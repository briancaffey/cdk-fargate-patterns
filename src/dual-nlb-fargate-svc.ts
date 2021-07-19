import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';
import { BaseFargateService, BaseFargateServiceProps } from './main';


export interface DualNlbFargateServiceProps extends BaseFargateServiceProps {};

export class DualNlbFargateService extends BaseFargateService {
  /**
   * The external Nlb
   */
  readonly externalNlb?: elbv2.NetworkLoadBalancer
  /**
   * The internal Nlb
   */
  readonly internalNlb?: elbv2.NetworkLoadBalancer
  constructor(scope: cdk.Construct, id: string, props: DualNlbFargateServiceProps) {
    super(scope, id, props);


    if (this.hasExternalLoadBalancer) {
      this.externalNlb = new elbv2.NetworkLoadBalancer(this, 'ExternalNlb', {
        vpc: this.vpc,
        internetFacing: true,
      });
    }

    if (this.hasInternalLoadBalancer) {
      this.internalNlb = new elbv2.NetworkLoadBalancer(this, 'InternalNlb', {
        vpc: this.vpc,
        internetFacing: false,
      });
    }

    props.tasks.forEach((t, index) => {
      const defaultContainerName = t.task.defaultContainer?.containerName;
      // default scaling policy
      const scaling = this.service[index].autoScaleTaskCount({ maxCapacity: t.scalingPolicy?.maxCapacity ?? 10 });
      scaling.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: t.scalingPolicy?.targetCpuUtilization ?? 50,
      });

      if (t.external) {
        const exttg = new elbv2.NetworkTargetGroup(this, `${defaultContainerName}ExtTG`, {
          protocol: t.protocol ?? elbv2.Protocol.TCP,
          port: t.external.port,
          vpc: this.vpc,
          healthCheck: t.healthCheck,
        });
        // listener for the external Nlb
        new elbv2.NetworkListener(this, `ExtNlbListener${t.external.port}`, {
          loadBalancer: this.externalNlb!,
          port: t.external.port,
          protocol: t.external.certificate ? elbv2.Protocol.TLS : elbv2.Protocol.TCP,
          certificates: t.external.certificate,
          defaultTargetGroups: [exttg],
        });
        exttg.addTarget(this.service[index]);
      }

      if (t.internal) {
        const inttg = new elbv2.NetworkTargetGroup(this, `${defaultContainerName}IntTG`, {
          protocol: t.protocol ?? elbv2.Protocol.TCP,
          port: t.internal.port,
          vpc: this.vpc,
          healthCheck: t.healthCheck,
        });

        // listener for the internal Nlb
        new elbv2.NetworkListener(this, `IntNlbListener${t.internal.port}`, {
          loadBalancer: this.internalNlb!,
          port: t.internal.port,
          protocol: t.internal.certificate ? elbv2.Protocol.TLS : elbv2.Protocol.TCP,
          certificates: t.internal.certificate,
          defaultTargetGroups: [inttg],
        });

        inttg.addTarget(this.service[index]);
      }
    });

    // Route53
    const externalNlbRecordName = props.route53Ops?.externalElbRecordName ?? 'external';
    const internalNlbRecordName = props.route53Ops?.internalElbRecordName ?? 'internal';

    if (this.enableLoadBalancerAlias) {
      const zone = new route53.PrivateHostedZone(this, 'HostedZone', {
        zoneName: this.zoneName,
        vpc: this.vpc,
      });

      if (this.hasInternalLoadBalancer) {
        new route53.ARecord(this, 'InternalNlbAlias', {
          zone,
          recordName: internalNlbRecordName,
          target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(this.internalNlb!)),
        });
      }


      if (this.hasExternalLoadBalancer) {
        new route53.ARecord(this, 'ExternalNlbAlias', {
          zone,
          recordName: externalNlbRecordName,
          target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(this.externalNlb!)),
        });
      }
      if (this.hasExternalLoadBalancer) {
        new cdk.CfnOutput(this, 'ExternalEndpoint', { value: `http://${this.externalNlb!.loadBalancerDnsName}` });
        new cdk.CfnOutput(this, 'ExternalEndpointPrivate', { value: `http://${externalNlbRecordName}.${this.zoneName}` });
      }
      if (this.hasInternalLoadBalancer) {
        new cdk.CfnOutput(this, 'InternalEndpoint', { value: `http://${this.internalNlb!.loadBalancerDnsName}` });
        new cdk.CfnOutput(this, 'InternalEndpointPrivate', { value: `http://${internalNlbRecordName}.${this.zoneName}` });
      }
    } else {
      if (this.hasExternalLoadBalancer) {
        new cdk.CfnOutput(this, 'ExternalEndpoint', { value: `http://${this.externalNlb!.loadBalancerDnsName}` });
      }
      if (this.hasInternalLoadBalancer) {
        new cdk.CfnOutput(this, 'InternalEndpoint', { value: `http://${this.internalNlb!.loadBalancerDnsName}` });
      }
    }
  }
};
