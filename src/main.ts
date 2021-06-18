import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
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
}

export interface FargateTaskProps {
  readonly task: ecs.FargateTaskDefinition;
  readonly listenerPort: number;
  /**
   * desired number of tasks for the service
   * @default 1
   */
  readonly desiredCount?: number;
  /**
   * service autoscaling policy
   */
  readonly scalingPolicy?: ServiceScalingPolicy;
  readonly capacityProviderStretegy?: ecs.CapacityProviderStrategy[];
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
  readonly externalAlb: elbv2.ApplicationLoadBalancer
  readonly internalAlb: elbv2.ApplicationLoadBalancer
  readonly vpc: ec2.IVpc;
  constructor(scope: cdk.Construct, id: string, props: DualAlbFargateServiceProps) {
    super(scope, id);

    this.vpc = props.vpc ?? getOrCreateVpc(this),

    this.externalAlb = new elbv2.ApplicationLoadBalancer(this, 'ExternalAlb', {
      vpc: this.vpc,
      internetFacing: true,
    });

    this.internalAlb = new elbv2.ApplicationLoadBalancer(this, 'InternalAlb', {
      vpc: this.vpc,
      internetFacing: false,
    });

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

    props.tasks.forEach(t => {
      const defaultContainerName = t.task.defaultContainer?.containerName;
      const svc = new ecs.FargateService(this, `${defaultContainerName}Service`, {
        taskDefinition: t.task,
        cluster,
        capacityProviderStrategies: t.capacityProviderStretegy ?? props.spot ? spotOnlyStrategy : undefined,
        desiredCount: t.desiredCount,
      });

      const exttg = new elbv2.ApplicationTargetGroup(this, `${defaultContainerName}ExtTG`, {
        protocol: elbv2.ApplicationProtocol.HTTP,
        vpc: this.vpc,
      });

      const inttg = new elbv2.ApplicationTargetGroup(this, `${defaultContainerName}IntTG`, {
        protocol: elbv2.ApplicationProtocol.HTTP,
        vpc: this.vpc,
      });

      // listener for the external ALB
      new elbv2.ApplicationListener(this, `ExtAlbListener${t.listenerPort}`, {
        loadBalancer: this.externalAlb,
        open: true,
        port: t.listenerPort,
        protocol: elbv2.ApplicationProtocol.HTTP,
        defaultTargetGroups: [exttg],
      });

      // listener for the internal ALB
      new elbv2.ApplicationListener(this, `IntAlbListener${t.listenerPort}`, {
        loadBalancer: this.internalAlb,
        open: true,
        port: t.listenerPort,
        protocol: elbv2.ApplicationProtocol.HTTP,
        defaultTargetGroups: [inttg],
      });

      // default scaling policy
      const scaling = svc.autoScaleTaskCount({ maxCapacity: t.scalingPolicy?.maxCapacity ?? 10 });
      scaling.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: t.scalingPolicy?.targetCpuUtilization ?? 50,
      });
      scaling.scaleOnRequestCount('RequestScaling', {
        requestsPerTarget: t.scalingPolicy?.requestPerTarget ?? 1000,
        targetGroup: exttg,
      });
      // extra scaling policy
      scaling.scaleOnRequestCount('RequestScaling2', {
        requestsPerTarget: t.scalingPolicy?.requestPerTarget ?? 1000,
        targetGroup: inttg,
      });


      exttg.addTarget(svc);
      inttg.addTarget(svc);
    });

    // Route53
    const zoneName = props.route53Ops?.zoneName ?? 'svc.local';
    const externalAlbRecordName = props.route53Ops?.externalAlbRecordName ?? 'external';
    const internalAlbRecordName = props.route53Ops?.internalAlbRecordName ?? 'internal';
    const zone = new route53.PrivateHostedZone(this, 'HostedZone', {
      zoneName,
      vpc: this.vpc,
    });

    new route53.ARecord(this, 'InternalAlbAlias', {
      zone,
      recordName: internalAlbRecordName,
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(this.internalAlb)),
    });

    new route53.ARecord(this, 'ExternalAlbAlias', {
      zone,
      recordName: externalAlbRecordName,
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(this.internalAlb)),
    });

    new cdk.CfnOutput(this, 'ExternalEndpoint', { value: `http://${this.externalAlb.loadBalancerDnsName}` });
    new cdk.CfnOutput(this, 'InternalEndpoint', { value: `http://${this.internalAlb.loadBalancerDnsName}` });
    new cdk.CfnOutput(this, 'ExternalEndpointPrivate', { value: `http://${externalAlbRecordName}.${zoneName}` });
    new cdk.CfnOutput(this, 'InternalEndpointPrivate', { value: `http://${internalAlbRecordName}.${zoneName}` });
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
