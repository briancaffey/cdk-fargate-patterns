import * as path from 'path';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as events from '@aws-cdk/aws-events';
import * as event_targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { getOrCreateVpc } from './common/common-functions';


export interface BaseFargateServiceProps {
  /**
   * The properties used to define an ECS cluster.
   *
   * @default - Create vpc and enable Fargate Capacity Providers.
   */
  readonly clusterProps?: ecs.ClusterProps;
  /**
   * Use existing ECS Cluster.
   * @default - create a new ECS Cluster.
   */
  readonly cluster?: ecs.ICluster;
  readonly vpc?: ec2.IVpc;
  readonly tasks: FargateTaskProps[];
  readonly route53Ops?: Route53Options;
  /**
   * create a FARGATE_SPOT only cluster
   * @default false
   */
  readonly spot?: boolean;
  /**
   * Enable the fargate spot termination handler
   * @see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html#fargate-capacity-providers-termination
   * @default true
   */
  readonly spotTerminationHandler?: boolean;
  /**
   * Whether to enable ECS Exec support
   * @see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html
   * @default false
   */
  readonly enableExecuteCommand?: boolean;
  /**
   * The subnets to associate with the service.
   * @default -
   * {
   *       subnetType: ec2.SubnetType.PRIVATE,
   * }
   */
  readonly vpcSubnets?: ec2.SubnetSelection;
  /**
   * Enable the ECS service circuit breaker
   * @see - https://aws.amazon.com/tw/blogs/containers/announcing-amazon-ecs-deployment-circuit-breaker/
   * @default true
   */
  readonly circuitBreaker?: boolean;
}

/**
 * The load balancer accessibility.
 */
export interface LoadBalancerAccessibility {
  /**
   * The port of the listener
   */
  readonly port: number;
  /**
   * The ACM certificate for the HTTPS listener
   * @default - no certificate(HTTP only)
   */
  readonly certificate?: acm.ICertificate[];

  /** 
  * Listener forward conditions.
  * @default - no forward conditions.
  */
  readonly forwardConditions?: elbv2.ListenerCondition[];
}

/**
 * Task properties for the Fargate
 */
export interface FargateTaskProps {
  // The Fargate task definition
  readonly task: ecs.FargateTaskDefinition;

  /**
   * The internal ELB listener
   * @default - no internal listener
   */
  readonly internal?: LoadBalancerAccessibility;

  /**
   * The external ELB listener
   * @default - no external listener
   */
  readonly external?: LoadBalancerAccessibility;

  /**
   * desired number of tasks for the service
   * @default 1
   */
  readonly desiredCount?: number;

  /**
   * service autoscaling policy
   * @default - { maxCapacity: 10, targetCpuUtilization: 50, requestsPerTarget: 1000 }
   */
  readonly scalingPolicy?: ServiceScalingPolicy;

  /**
   * Customized capacity provider strategy
   */
  readonly capacityProviderStrategy?: ecs.CapacityProviderStrategy[];

  /**
   * health check from elbv2 target group
  */
  readonly healthCheck?: elbv2.HealthCheck;

  /**
   * The target group protocol for NLB. For ALB, this option will be ignored and always set to HTTP.
   *
   * @default - TCP
   */
  readonly protocol?: elbv2.Protocol;

  /**
   * The protocol version to use.
   */
  readonly protocolVersion?: elbv2.ApplicationProtocolVersion;

  /**
   * The serviceName.
   *
   * @default - auto-generated
   */
  readonly serviceName?: string;

  /**
   * The maximum number of tasks, specified as a percentage of the Amazon ECS service's DesiredCount value,
   * that can run in a service during a deployment.
   * @default 200
  */
  readonly maxHealthyPercent?: number;

  /**
   * The minimum number of tasks, specified as a percentage of the Amazon ECS service's DesiredCount value,
   * that must continue to run and remain healthy during a deployment.
   * @default 50
  */
  readonly minHealthyPercent?: number;

  /**
   * The period of time, in seconds,
   * that the Amazon ECS service scheduler ignores unhealthy Elastic Load Balancing target health checks after a task has first started.
   * @default cdk.Duration.seconds(60),
  */
  readonly healthCheckGracePeriod?: cdk.Duration;
}

export interface ServiceScalingPolicy {
  /**
   * max capacity for the service autoscaling
   * @default 10
   */
  readonly maxCapacity?: number;
  /**
   * target cpu utilization
   * @default 50
   */
  readonly targetCpuUtilization?: number;
  /**
   * request per target
   * @default 1000
   */
  readonly requestPerTarget?: number;
}

export interface Route53Options {
  /**
   * Whether to configure the ALIAS for the LB.
   * @default true
   */
  readonly enableLoadBalancerAlias?: boolean;
  /**
   * private zone name
   * @default svc.local
   */
  readonly zoneName?: string;
  /**
   * the external ELB record name
   * @default external
   */
  readonly externalElbRecordName?: string;
  /**
   * the internal ELB record name
   * @default internal
   */
  readonly internalElbRecordName?: string;
}

export abstract class BaseFargateService extends cdk.Construct {
  /**
   * The VPC
   */
  readonly vpc: ec2.IVpc;
  /**
   * The service(s) created from the task(s)
   */
  readonly service: ecs.FargateService[];

  protected zoneName: string = '';
  protected hasExternalLoadBalancer: boolean = false;
  protected hasInternalLoadBalancer: boolean = false;
  protected vpcSubnets: ec2.SubnetSelection = { subnetType: ec2.SubnetType.PRIVATE };
  protected enableLoadBalancerAlias: boolean;
  private hasSpotCapacity: boolean = false;
  /**
   * determine if vpcSubnets are all public ones
   */
  private isPublicSubnets: boolean = false;
  constructor(scope: cdk.Construct, id: string, props: BaseFargateServiceProps) {
    super(scope, id);

    this.enableLoadBalancerAlias = props.route53Ops?.enableLoadBalancerAlias != false;
    if (props.vpc && props.cluster) {
      throw new Error('Cannot specify vpc and cluster at the same time');
    }
    if (props.clusterProps && props.cluster) {
      throw new Error('Cannot specify clusterProps and cluster at the same time');
    }
    this.vpc = props.cluster ? props.cluster.vpc : props.vpc ?? getOrCreateVpc(this),
    this.service = [];
    if (props.vpcSubnets) {
      this.vpcSubnets = props.vpcSubnets;
      this.validateSubnets(this.vpc, this.vpcSubnets);
    }


    // determine whether we need the external LB
    props.tasks.forEach(t => {
      // determine the accessibility
      if (t.external) {
        this.hasExternalLoadBalancer = true;
      }
      if (t.internal) {
        this.hasInternalLoadBalancer = true;
      }
    });

    const cluster = props.cluster ?? new ecs.Cluster(this, 'Cluster', {
      vpc: this.vpc,
      enableFargateCapacityProviders: true,
      ...props.clusterProps,
    });

    const spotOnlyStrategy = [
      {
        capacityProvider: 'FARGATE_SPOT',
        base: 0,
        weight: 1,
      },
      {
        capacityProvider: 'FARGATE',
        base: 0,
        weight: 0,
      },
    ];

    if (props.spot == true) this.hasSpotCapacity = true;

    props.tasks.forEach(t => {
      const defaultContainerName = t.task.defaultContainer?.containerName;
      const svc = new ecs.FargateService(this, `${defaultContainerName}Service`, {
        taskDefinition: t.task,
        cluster,
        serviceName: t.serviceName,
        capacityProviderStrategies: t.capacityProviderStrategy ?? ( props.spot ? spotOnlyStrategy : undefined ),
        desiredCount: t.desiredCount,
        enableExecuteCommand: props.enableExecuteCommand ?? false,
        vpcSubnets: this.vpcSubnets,
        assignPublicIp: this.isPublicSubnets,
        circuitBreaker: props.circuitBreaker != false ? {
          rollback: true,
        } : undefined,
        maxHealthyPercent: t.maxHealthyPercent,
        minHealthyPercent: t.minHealthyPercent,
        healthCheckGracePeriod: t.healthCheckGracePeriod,
      });
      this.service.push(svc);

      /**
       * determine if we have spot capacity in this cluster
       * scenario 1: FARGATE_SPOT with weight > 0
       * scenario 2: FARGATE_SPOT with base > 0
       * scenario 3: props.spot = true
       */
      t.capacityProviderStrategy?.forEach(s => {
        if (s.capacityProvider == 'FARGATE_SPOT' && ((s.weight && s.weight > 0)
          || (s.base && s.base > 0))) {
          this.hasSpotCapacity = true;
        }
      });
    });
    // ensure the dependency
    if (!props.cluster) {
      const cp = this.node.tryFindChild('Cluster') as ecs.CfnClusterCapacityProviderAssociations;
      this.service.forEach(s => {
        s.node.addDependency(cp);
      });
    };

    // Route53
    this.zoneName = props.route53Ops?.zoneName ?? 'svc.local';

    // spot termination handler by default
    if (this.hasSpotCapacity && props.spotTerminationHandler !== false) {
      this.createSpotTerminationHandler(cluster);
    }
  }
  private createSpotTerminationHandler(cluster: ecs.ICluster) {
  // create the handler
    const handler = new lambda.DockerImageFunction(this, 'SpotTermHandler', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../lambda/spot-term-handler')),
      timeout: cdk.Duration.seconds(20),
    });
    // create event rule
    const rule = new events.Rule(this, 'OnTaskStateChangeEvent', {
      eventPattern: {
        source: ['aws.ecs'],
        detailType: ['ECS Task State Change'],
        detail: {
          clusterArn: [cluster.clusterArn],
        },
      },
    });
    rule.addTarget(new event_targets.LambdaFunction(handler));
    handler.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'ecs:DescribeServices',
        'elasticloadbalancing:DeregisterTargets',
        'ec2:DescribeSubnets',
      ],
      resources: ['*'],
    }));
  }

  private validateSubnets(vpc: ec2.IVpc, vpcSubnets: ec2.SubnetSelection) {
    const subnets = vpc.selectSubnets(vpcSubnets);
    // get all subnets in the VPC
    const allsubnetIds = vpc.publicSubnets.concat(vpc.privateSubnets).concat(vpc.isolatedSubnets).map(x => x.subnetId);
    // validate the given subnets
    subnets.subnetIds.forEach(s => {
      if (!allsubnetIds.includes(s)) {
        throw new Error(`${s} does not exist in the VPC`);
      }
      if (vpc.isolatedSubnets.map(i => i.subnetId).includes(s)) {
        throw new Error(`Isolated subnet ${s} is not allowed`);
      }
    });
    const hasPublic = subnets.subnetIds.some(s => new Set(vpc.publicSubnets.map(x => x.subnetId)).has(s));
    const hasPrivate = subnets.subnetIds.some(s => new Set(vpc.privateSubnets.map(x => x.subnetId)).has(s));
    if (hasPublic && hasPrivate) {
      throw new Error('You should provide either all public or all private subnets, not both.');
    }
    this.isPublicSubnets = subnets.subnetIds.some(s => new Set(vpc.publicSubnets.map(x => x.subnetId)).has(s));
  }
}
