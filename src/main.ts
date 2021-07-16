import * as path from 'path';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as events from '@aws-cdk/aws-events';
import * as event_targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';


export interface DualAlbFargateServiceProps {
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
}

/**
 * Task properties for the Fargate
 */
export interface FargateTaskProps {
  // The Fargate task definition
  readonly task: ecs.FargateTaskDefinition;
  /**
   * The internal ALB listener
   * @default - no internal listener
   */
  readonly internal?: LoadBalancerAccessibility;
  /**
   * The external ALB listener
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
   * the external ALB record name
   * @default external
   */
  readonly externalAlbRecordName?: string;
  /**
   * the internal ALB record name
   * @default internal
   */
  readonly internalAlbRecordName?: string;
}

export class DualAlbFargateService extends cdk.Construct {
  /**
   * The external ALB
   */
  readonly externalAlb?: elbv2.ApplicationLoadBalancer
  /**
   * The internal ALB
   */
  readonly internalAlb?: elbv2.ApplicationLoadBalancer
  /**
   * The VPC
   */
  readonly vpc: ec2.IVpc;
  /**
   * The service(s) created from the task(s)
   */
  readonly service: ecs.FargateService[];
  private hasExternalLoadBalancer: boolean = false;
  private hasInternalLoadBalancer: boolean = false;
  private vpcSubnets: ec2.SubnetSelection = { subnetType: ec2.SubnetType.PRIVATE };
  private enableLoadBalancerAlias: boolean;
  private hasSpotCapacity: boolean = false;
  /**
   * determine if vpcSubnets are all public ones
   */
  private isPublicSubnets: boolean = false;
  constructor(scope: cdk.Construct, id: string, props: DualAlbFargateServiceProps) {
    super(scope, id);

    this.enableLoadBalancerAlias = props.route53Ops?.enableLoadBalancerAlias != false;
    this.vpc = props.vpc ?? getOrCreateVpc(this),
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

    if (this.hasExternalLoadBalancer) {
      this.externalAlb = new elbv2.ApplicationLoadBalancer(this, 'ExternalAlb', {
        vpc: this.vpc,
        internetFacing: true,
      });
    }

    if (this.hasInternalLoadBalancer) {
      this.internalAlb = new elbv2.ApplicationLoadBalancer(this, 'InternalAlb', {
        vpc: this.vpc,
        internetFacing: false,
      });
    }

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: this.vpc,
      enableFargateCapacityProviders: true,
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
        capacityProviderStrategies: t.capacityProviderStrategy ?? ( props.spot ? spotOnlyStrategy : undefined ),
        desiredCount: t.desiredCount,
        enableExecuteCommand: props.enableExecuteCommand ?? false,
        vpcSubnets: this.vpcSubnets,
        assignPublicIp: this.isPublicSubnets,
        circuitBreaker: props.circuitBreaker != false ? {
          rollback: true,
        } : undefined,
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

      // default scaling policy
      const scaling = svc.autoScaleTaskCount({ maxCapacity: t.scalingPolicy?.maxCapacity ?? 10 });
      scaling.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: t.scalingPolicy?.targetCpuUtilization ?? 50,
      });

      if (t.external) {
        const exttg = new elbv2.ApplicationTargetGroup(this, `${defaultContainerName}ExtTG`, {
          protocol: elbv2.ApplicationProtocol.HTTP,
          vpc: this.vpc,
          healthCheck: t.healthCheck,
        });
        // listener for the external ALB
        new elbv2.ApplicationListener(this, `ExtAlbListener${t.external.port}`, {
          loadBalancer: this.externalAlb!,
          open: true,
          port: t.external.port,
          protocol: t.external.certificate ? elbv2.ApplicationProtocol.HTTPS : elbv2.ApplicationProtocol.HTTP,
          certificates: t.external.certificate,
          defaultTargetGroups: [exttg],
        });
        scaling.scaleOnRequestCount('RequestScaling', {
          requestsPerTarget: t.scalingPolicy?.requestPerTarget ?? 1000,
          targetGroup: exttg,
        });
        exttg.addTarget(svc);
      }

      if (t.internal) {
        const inttg = new elbv2.ApplicationTargetGroup(this, `${defaultContainerName}IntTG`, {
          protocol: elbv2.ApplicationProtocol.HTTP,
          vpc: this.vpc,
          healthCheck: t.healthCheck,
        });

        // listener for the internal ALB
        new elbv2.ApplicationListener(this, `IntAlbListener${t.internal.port}`, {
          loadBalancer: this.internalAlb!,
          open: true,
          port: t.internal.port,
          protocol: t.internal.certificate ? elbv2.ApplicationProtocol.HTTPS : elbv2.ApplicationProtocol.HTTP,
          certificates: t.internal.certificate,
          defaultTargetGroups: [inttg],
        });

        // extra scaling policy
        scaling.scaleOnRequestCount('RequestScaling2', {
          requestsPerTarget: t.scalingPolicy?.requestPerTarget ?? 1000,
          targetGroup: inttg,
        });
        inttg.addTarget(svc);
      }
    });

    // ensure the dependency
    const cp = this.node.tryFindChild('Cluster') as ecs.CfnClusterCapacityProviderAssociations;
    this.service.forEach(s => {
      s.node.addDependency(cp);
    });

    // Route53
    const zoneName = props.route53Ops?.zoneName ?? 'svc.local';
    const externalAlbRecordName = props.route53Ops?.externalAlbRecordName ?? 'external';
    const internalAlbRecordName = props.route53Ops?.internalAlbRecordName ?? 'internal';

    // spot termination handler by default
    if (this.hasSpotCapacity && props.spotTerminationHandler !== false) {
      this.createSpotTerminationHandler(cluster);
    }


    if (this.enableLoadBalancerAlias) {
      const zone = new route53.PrivateHostedZone(this, 'HostedZone', {
        zoneName,
        vpc: this.vpc,
      });

      if (this.hasInternalLoadBalancer) {
        new route53.ARecord(this, 'InternalAlbAlias', {
          zone,
          recordName: internalAlbRecordName,
          target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(this.internalAlb!)),
        });
      }


      if (this.hasExternalLoadBalancer) {
        new route53.ARecord(this, 'ExternalAlbAlias', {
          zone,
          recordName: externalAlbRecordName,
          target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(this.externalAlb!)),
        });
      }
      if (this.hasExternalLoadBalancer) {
        new cdk.CfnOutput(this, 'ExternalEndpoint', { value: `http://${this.externalAlb!.loadBalancerDnsName}` });
        new cdk.CfnOutput(this, 'ExternalEndpointPrivate', { value: `http://${externalAlbRecordName}.${zoneName}` });
      }
      if (this.hasInternalLoadBalancer) {
        new cdk.CfnOutput(this, 'InternalEndpoint', { value: `http://${this.internalAlb!.loadBalancerDnsName}` });
        new cdk.CfnOutput(this, 'InternalEndpointPrivate', { value: `http://${internalAlbRecordName}.${zoneName}` });
      }
    } else {
      if (this.hasExternalLoadBalancer) {
        new cdk.CfnOutput(this, 'ExternalEndpoint', { value: `http://${this.externalAlb!.loadBalancerDnsName}` });
      }
      if (this.hasInternalLoadBalancer) {
        new cdk.CfnOutput(this, 'InternalEndpoint', { value: `http://${this.internalAlb!.loadBalancerDnsName}` });
      }
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

function getOrCreateVpc(scope: cdk.Construct): ec2.IVpc {
  // use an existing vpc or create a new one
  return scope.node.tryGetContext('use_default_vpc') === '1'
    || process.env.CDK_USE_DEFAULT_VPC === '1' ? ec2.Vpc.fromLookup(scope, 'Vpc', { isDefault: true }) :
    scope.node.tryGetContext('use_vpc_id') ?
      ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: scope.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(scope, 'Vpc', { maxAzs: 3, natGateways: 1 });
}
