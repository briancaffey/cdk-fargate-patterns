# API Reference

**Classes**

Name|Description
----|-----------
[DualAlbFargateService](#cdk-fargate-patterns-dualalbfargateservice)|*No description*


**Structs**

Name|Description
----|-----------
[DualAlbFargateServiceProps](#cdk-fargate-patterns-dualalbfargateserviceprops)|*No description*
[FargateTaskProps](#cdk-fargate-patterns-fargatetaskprops)|*No description*
[Route53Options](#cdk-fargate-patterns-route53options)|*No description*
[ServiceScalingPolicy](#cdk-fargate-patterns-servicescalingpolicy)|*No description*



## class DualAlbFargateService  <a id="cdk-fargate-patterns-dualalbfargateservice"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new DualAlbFargateService(scope: Construct, id: string, props: DualAlbFargateServiceProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[DualAlbFargateServiceProps](#cdk-fargate-patterns-dualalbfargateserviceprops)</code>)  *No description*
  * **tasks** (<code>Array<[FargateTaskProps](#cdk-fargate-patterns-fargatetaskprops)></code>)  *No description* 
  * **enableExecuteCommand** (<code>boolean</code>)  Whether to enable ECS Exec support. __*Default*__: false
  * **route53Ops** (<code>[Route53Options](#cdk-fargate-patterns-route53options)</code>)  *No description* __*Optional*__
  * **spot** (<code>boolean</code>)  create a FARGATE_SPOT only cluster. __*Default*__: false
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  *No description* __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**internalAlb** | <code>[ApplicationLoadBalancer](#aws-cdk-aws-elasticloadbalancingv2-applicationloadbalancer)</code> | <span></span>
**service** | <code>Array<[FargateService](#aws-cdk-aws-ecs-fargateservice)></code> | The service(s) created from the task(s).
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>
**externalAlb**? | <code>[ApplicationLoadBalancer](#aws-cdk-aws-elasticloadbalancingv2-applicationloadbalancer)</code> | __*Optional*__



## struct DualAlbFargateServiceProps  <a id="cdk-fargate-patterns-dualalbfargateserviceprops"></a>






Name | Type | Description 
-----|------|-------------
**tasks** | <code>Array<[FargateTaskProps](#cdk-fargate-patterns-fargatetaskprops)></code> | <span></span>
**enableExecuteCommand**? | <code>boolean</code> | Whether to enable ECS Exec support.<br/>__*Default*__: false
**route53Ops**? | <code>[Route53Options](#cdk-fargate-patterns-route53options)</code> | __*Optional*__
**spot**? | <code>boolean</code> | create a FARGATE_SPOT only cluster.<br/>__*Default*__: false
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | __*Optional*__



## struct FargateTaskProps  <a id="cdk-fargate-patterns-fargatetaskprops"></a>






Name | Type | Description 
-----|------|-------------
**listenerPort** | <code>number</code> | <span></span>
**task** | <code>[FargateTaskDefinition](#aws-cdk-aws-ecs-fargatetaskdefinition)</code> | <span></span>
**capacityProviderStrategy**? | <code>Array<[CapacityProviderStrategy](#aws-cdk-aws-ecs-capacityproviderstrategy)></code> | __*Optional*__
**desiredCount**? | <code>number</code> | desired number of tasks for the service.<br/>__*Default*__: 1
**internalOnly**? | <code>boolean</code> | Internal only.<br/>__*Default*__: false
**scalingPolicy**? | <code>[ServiceScalingPolicy](#cdk-fargate-patterns-servicescalingpolicy)</code> | service autoscaling policy.<br/>__*Optional*__



## struct Route53Options  <a id="cdk-fargate-patterns-route53options"></a>






Name | Type | Description 
-----|------|-------------
**externalAlbRecordName**? | <code>string</code> | the external ALB record name.<br/>__*Default*__: external
**internalAlbRecordName**? | <code>string</code> | the internal ALB record name.<br/>__*Default*__: internal
**zoneName**? | <code>string</code> | private zone name.<br/>__*Default*__: svc.local



## struct ServiceScalingPolicy  <a id="cdk-fargate-patterns-servicescalingpolicy"></a>






Name | Type | Description 
-----|------|-------------
**maxCapacity**? | <code>number</code> | max capacity for the service autoscaling.<br/>__*Default*__: 10
**requestPerTarget**? | <code>number</code> | request per target.<br/>__*Default*__: 1000
**targetCpuUtilization**? | <code>number</code> | target cpu utilization.<br/>__*Default*__: 50



