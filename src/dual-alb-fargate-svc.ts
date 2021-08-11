import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';
import { BaseFargateService, BaseFargateServiceProps } from './main';


export interface DualAlbFargateServiceProps extends BaseFargateServiceProps {
  /**
   * The load balancer idle timeout, in seconds.
   * @default - 60.
  */
  readonly idleTimeout?: cdk.Duration;
};

export class DualAlbFargateService extends BaseFargateService {
  /**
   * The external ALB
   */
  readonly externalAlb?: elbv2.ApplicationLoadBalancer
  /**
   * The internal ALB
   */
  readonly internalAlb?: elbv2.ApplicationLoadBalancer

  protected externalAlbApplicationListeners: {[key: string]: elbv2.ApplicationListener}

  protected internalAlbApplicationListeners: {[key: string]: elbv2.ApplicationListener}


  constructor(scope: cdk.Construct, id: string, props: DualAlbFargateServiceProps) {
    super(scope, id, props);

    this.externalAlbApplicationListeners = {};
    this.internalAlbApplicationListeners = {};

    if (this.hasExternalLoadBalancer) {
      this.externalAlb = new elbv2.ApplicationLoadBalancer(this, 'ExternalAlb', {
        vpc: this.vpc,
        internetFacing: true,
        idleTimeout: props.idleTimeout,
      });
    }

    if (this.hasInternalLoadBalancer) {
      this.internalAlb = new elbv2.ApplicationLoadBalancer(this, 'InternalAlb', {
        vpc: this.vpc,
        internetFacing: false,
        idleTimeout: props.idleTimeout,
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
          port: t.external.port,
          vpc: this.vpc,
          protocolVersion: t.protocolVersion,
          healthCheck: t.healthCheck,
        });
        // listener for the external ALB
        const listenerId = `ExtAlbListener${t.external.port}`;
        let listener = this.externalAlbApplicationListeners[listenerId];
        if (!listener) {
          listener = new elbv2.ApplicationListener(this, listenerId, {
            loadBalancer: this.externalAlb!,
            open: true,
            port: t.external.port,
            protocol: t.external.certificate ? elbv2.ApplicationProtocol.HTTPS : elbv2.ApplicationProtocol.HTTP,
            certificates: t.external.certificate,
            defaultTargetGroups: [exttg],
          });
          this.externalAlbApplicationListeners[listenerId] = listener;
        }

        if (t.external.forwardConditions) {
          new elbv2.ApplicationListenerRule(this, `ExtAlbListener${t.external.port}Rule${index}`, {
            priority: index + 1,
            conditions: t.external.forwardConditions,
            listener,
            action: elbv2.ListenerAction.forward([exttg]),
          });
        }

        scaling.scaleOnRequestCount('RequestScaling', {
          requestsPerTarget: t.scalingPolicy?.requestPerTarget ?? 1000,
          targetGroup: exttg,
        });
        exttg.addTarget(this.service[index]);
      }

      if (t.internal) {
        const inttg = new elbv2.ApplicationTargetGroup(this, `${defaultContainerName}IntTG`, {
          protocol: elbv2.ApplicationProtocol.HTTP,
          port: t.internal.port,
          vpc: this.vpc,
          protocolVersion: t.protocolVersion,
          healthCheck: t.healthCheck,
        });

        // listener for the internal ALB
        const listenerId = `IntAlbListener${t.internal.port}`;
        let listener = this.internalAlbApplicationListeners[listenerId];
        if (!listener) {
          listener = new elbv2.ApplicationListener(this, `IntAlbListener${t.internal.port}`, {
            loadBalancer: this.internalAlb!,
            open: true,
            port: t.internal.port,
            protocol: t.internal.certificate ? elbv2.ApplicationProtocol.HTTPS : elbv2.ApplicationProtocol.HTTP,
            certificates: t.internal.certificate,
            defaultTargetGroups: [inttg],
          });
          this.internalAlbApplicationListeners[listenerId] = listener;
        }

        if (t.internal.forwardConditions) {
          new elbv2.ApplicationListenerRule(this, `IntAlbListener${t.internal.port}Rule${index}`, {
            priority: index + 1,
            conditions: t.internal.forwardConditions,
            listener,
            action: elbv2.ListenerAction.forward([inttg]),
          });
        }

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
