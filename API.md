# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### DualAlbFargateService <a name="cdk-fargate-patterns.DualAlbFargateService"></a>

#### Initializer <a name="cdk-fargate-patterns.DualAlbFargateService.Initializer"></a>

```typescript
import { DualAlbFargateService } from 'cdk-fargate-patterns'

new DualAlbFargateService(scope: Construct, id: string, props: DualAlbFargateServiceProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.props"></a>

- *Type:* [`cdk-fargate-patterns.DualAlbFargateServiceProps`](#cdk-fargate-patterns.DualAlbFargateServiceProps)

---



#### Properties <a name="Properties"></a>

##### `service`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.service"></a>

- *Type:* [`@aws-cdk/aws-ecs.FargateService`](#@aws-cdk/aws-ecs.FargateService)[]

The service(s) created from the task(s).

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `externalAlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.externalAlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer)

---

##### `internalAlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.internalAlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer)

---


## Structs <a name="Structs"></a>

### DualAlbFargateServiceProps <a name="cdk-fargate-patterns.DualAlbFargateServiceProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DualAlbFargateServiceProps } from 'cdk-fargate-patterns'

const dualAlbFargateServiceProps: DualAlbFargateServiceProps = { ... }
```

##### `tasks`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.tasks"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)[]

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.enableExecuteCommand"></a>

- *Type:* `boolean`
- *Default:* false

Whether to enable ECS Exec support.

> https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html

---

##### `route53Ops`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.route53Ops"></a>

- *Type:* [`cdk-fargate-patterns.Route53Options`](#cdk-fargate-patterns.Route53Options)

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.spot"></a>

- *Type:* `boolean`
- *Default:* false

create a FARGATE_SPOT only cluster.

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `vpcSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.vpcSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* {
subnetType: ec2.SubnetType.PRIVATE,
}

The subnets to associate with the service.

---

### FargateTaskProps <a name="cdk-fargate-patterns.FargateTaskProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { FargateTaskProps } from 'cdk-fargate-patterns'

const fargateTaskProps: FargateTaskProps = { ... }
```

##### `listenerPort`<sup>Required</sup> <a name="cdk-fargate-patterns.FargateTaskProps.listenerPort"></a>

- *Type:* `number`

---

##### `task`<sup>Required</sup> <a name="cdk-fargate-patterns.FargateTaskProps.task"></a>

- *Type:* [`@aws-cdk/aws-ecs.FargateTaskDefinition`](#@aws-cdk/aws-ecs.FargateTaskDefinition)

---

##### `accessibility`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.accessibility"></a>

- *Type:* [`cdk-fargate-patterns.LoadBalancerAccessibility`](#cdk-fargate-patterns.LoadBalancerAccessibility)
- *Default:* both

Register the service to internal ALB, external ALB or both.

---

##### `capacityProviderStrategy`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.capacityProviderStrategy"></a>

- *Type:* [`@aws-cdk/aws-ecs.CapacityProviderStrategy`](#@aws-cdk/aws-ecs.CapacityProviderStrategy)[]

---

##### `desiredCount`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.desiredCount"></a>

- *Type:* `number`
- *Default:* 1

desired number of tasks for the service.

---

##### `healthCheck`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.healthCheck"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.HealthCheck`](#@aws-cdk/aws-elasticloadbalancingv2.HealthCheck)

health check from elbv2 target group.

---

##### `scalingPolicy`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.scalingPolicy"></a>

- *Type:* [`cdk-fargate-patterns.ServiceScalingPolicy`](#cdk-fargate-patterns.ServiceScalingPolicy)
- *Default:* { maxCapacity: 10, targetCpuUtilization: 50, requestsPerTarget: 1000 }

service autoscaling policy.

---

### Route53Options <a name="cdk-fargate-patterns.Route53Options"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { Route53Options } from 'cdk-fargate-patterns'

const route53Options: Route53Options = { ... }
```

##### `enableLoadBalancerAlias`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.enableLoadBalancerAlias"></a>

- *Type:* `boolean`
- *Default:* true

Whether to configure the ALIAS for the LB.

---

##### `externalAlbRecordName`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.externalAlbRecordName"></a>

- *Type:* `string`
- *Default:* external

the external ALB record name.

---

##### `internalAlbRecordName`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.internalAlbRecordName"></a>

- *Type:* `string`
- *Default:* internal

the internal ALB record name.

---

##### `zoneName`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.zoneName"></a>

- *Type:* `string`
- *Default:* svc.local

private zone name.

---

### ServiceScalingPolicy <a name="cdk-fargate-patterns.ServiceScalingPolicy"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { ServiceScalingPolicy } from 'cdk-fargate-patterns'

const serviceScalingPolicy: ServiceScalingPolicy = { ... }
```

##### `maxCapacity`<sup>Optional</sup> <a name="cdk-fargate-patterns.ServiceScalingPolicy.maxCapacity"></a>

- *Type:* `number`
- *Default:* 10

max capacity for the service autoscaling.

---

##### `requestPerTarget`<sup>Optional</sup> <a name="cdk-fargate-patterns.ServiceScalingPolicy.requestPerTarget"></a>

- *Type:* `number`
- *Default:* 1000

request per target.

---

##### `targetCpuUtilization`<sup>Optional</sup> <a name="cdk-fargate-patterns.ServiceScalingPolicy.targetCpuUtilization"></a>

- *Type:* `number`
- *Default:* 50

target cpu utilization.

---



## Enums <a name="Enums"></a>

### LoadBalancerAccessibility <a name="LoadBalancerAccessibility"></a>

The load balancer accessibility.

#### `EXTERNAL_ONLY` <a name="cdk-fargate-patterns.LoadBalancerAccessibility.EXTERNAL_ONLY"></a>

register to external load balancer only.

---


#### `INTERNAL_ONLY` <a name="cdk-fargate-patterns.LoadBalancerAccessibility.INTERNAL_ONLY"></a>

register to internal load balancer only.

---

