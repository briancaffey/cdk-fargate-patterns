import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';
import { BaseFargateService, BaseFargateServiceProps } from './main';


export interface DualAlbFargateServiceProps extends BaseFargateServiceProps {};

export class DualAlbFargateService extends BaseFargateService {
  /**
   * The external ALB
   */
  readonly externalAlb?: elbv2.ApplicationLoadBalancer
  /**
   * The internal ALB
   */
  readonly internalAlb?: elbv2.ApplicationLoadBalancer
  constructor(scope: cdk.Construct, id: string, props: DualAlbFargateServiceProps) {
    super(scope, id, props);


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

    props.tasks.forEach((t, index) => {
      const defaultContainerName = t.task.defaultContainer?.containerName;
      // default scaling policy
      const scaling = this.service[index].autoScaleTaskCount({ maxCapacity: t.scalingPolicy?.maxCapacity ?? 10 });
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
        exttg.addTarget(this.service[index]);
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
        inttg.addTarget(this.service[index]);
      }
    });

    // Route53
    const externalAlbRecordName = props.route53Ops?.externalElbRecordName ?? 'external';
    const internalAlbRecordName = props.route53Ops?.internalElbRecordName ?? 'internal';

    if (this.enableLoadBalancerAlias) {
      const zone = new route53.PrivateHostedZone(this, 'HostedZone', {
        zoneName: this.zoneName,
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
        new cdk.CfnOutput(this, 'ExternalEndpointPrivate', { value: `http://${externalAlbRecordName}.${this.zoneName}` });
      }
      if (this.hasInternalLoadBalancer) {
        new cdk.CfnOutput(this, 'InternalEndpoint', { value: `http://${this.internalAlb!.loadBalancerDnsName}` });
        new cdk.CfnOutput(this, 'InternalEndpointPrivate', { value: `http://${internalAlbRecordName}.${this.zoneName}` });
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
};
