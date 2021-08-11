# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### BaseFargateService <a name="cdk-fargate-patterns.BaseFargateService"></a>

#### Initializer <a name="cdk-fargate-patterns.BaseFargateService.Initializer"></a>

```typescript
import { BaseFargateService } from 'cdk-fargate-patterns'

new BaseFargateService(scope: Construct, id: string, props: BaseFargateServiceProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.BaseFargateService.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.BaseFargateService.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.BaseFargateService.parameter.props"></a>

- *Type:* [`cdk-fargate-patterns.BaseFargateServiceProps`](#cdk-fargate-patterns.BaseFargateServiceProps)

---



#### Properties <a name="Properties"></a>

##### `service`<sup>Required</sup> <a name="cdk-fargate-patterns.BaseFargateService.property.service"></a>

- *Type:* [`@aws-cdk/aws-ecs.FargateService`](#@aws-cdk/aws-ecs.FargateService)[]

The service(s) created from the task(s).

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.BaseFargateService.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

The VPC.

---


### Database <a name="cdk-fargate-patterns.Database"></a>

Represents the database instance or database cluster.

#### Initializer <a name="cdk-fargate-patterns.Database.Initializer"></a>

```typescript
import { Database } from 'cdk-fargate-patterns'

new Database(scope: Construct, id: string, props: DatabaseProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.parameter.props"></a>

- *Type:* [`cdk-fargate-patterns.DatabaseProps`](#cdk-fargate-patterns.DatabaseProps)

---



#### Properties <a name="Properties"></a>

##### `clusterEndpointHostname`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.property.clusterEndpointHostname"></a>

- *Type:* `string`

---

##### `clusterIdentifier`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.property.clusterIdentifier"></a>

- *Type:* `string`

---

##### `connections`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.property.connections"></a>

- *Type:* [`@aws-cdk/aws-ec2.Connections`](#@aws-cdk/aws-ec2.Connections)

---

##### `secret`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.property.secret"></a>

- *Type:* [`@aws-cdk/aws-secretsmanager.ISecret`](#@aws-cdk/aws-secretsmanager.ISecret)

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---


### DualAlbFargateService <a name="cdk-fargate-patterns.DualAlbFargateService"></a>

#### Initializer <a name="cdk-fargate-patterns.DualAlbFargateService.Initializer"></a>

```typescript
import { DualAlbFargateService } from 'cdk-fargate-patterns'

new DualAlbFargateService(scope: Construct, id: string, props: DualAlbFargateServiceProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.parameter.props"></a>

- *Type:* [`cdk-fargate-patterns.DualAlbFargateServiceProps`](#cdk-fargate-patterns.DualAlbFargateServiceProps)

---



#### Properties <a name="Properties"></a>

##### `externalAlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.property.externalAlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer)

The external ALB.

---

##### `internalAlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.property.internalAlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer)

The internal ALB.

---


### DualNlbFargateService <a name="cdk-fargate-patterns.DualNlbFargateService"></a>

#### Initializer <a name="cdk-fargate-patterns.DualNlbFargateService.Initializer"></a>

```typescript
import { DualNlbFargateService } from 'cdk-fargate-patterns'

new DualNlbFargateService(scope: Construct, id: string, props: DualNlbFargateServiceProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.DualNlbFargateService.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.DualNlbFargateService.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.DualNlbFargateService.parameter.props"></a>

- *Type:* [`cdk-fargate-patterns.DualNlbFargateServiceProps`](#cdk-fargate-patterns.DualNlbFargateServiceProps)

---



#### Properties <a name="Properties"></a>

##### `externalNlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateService.property.externalNlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.NetworkLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.NetworkLoadBalancer)

The external Nlb.

---

##### `internalNlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateService.property.internalNlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.NetworkLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.NetworkLoadBalancer)

The internal Nlb.

---


### Laravel <a name="cdk-fargate-patterns.Laravel"></a>

Represents the Laravel service.

#### Initializer <a name="cdk-fargate-patterns.Laravel.Initializer"></a>

```typescript
import { Laravel } from 'cdk-fargate-patterns'

new Laravel(scope: Construct, id: string, props: LaravelProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.parameter.props"></a>

- *Type:* [`cdk-fargate-patterns.LaravelProps`](#cdk-fargate-patterns.LaravelProps)

---



#### Properties <a name="Properties"></a>

##### `svc`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.property.svc"></a>

- *Type:* [`cdk-fargate-patterns.DualAlbFargateService`](#cdk-fargate-patterns.DualAlbFargateService)

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `db`<sup>Optional</sup> <a name="cdk-fargate-patterns.Laravel.property.db"></a>

- *Type:* [`cdk-fargate-patterns.Database`](#cdk-fargate-patterns.Database)

---


### WordPress <a name="cdk-fargate-patterns.WordPress"></a>

#### Initializer <a name="cdk-fargate-patterns.WordPress.Initializer"></a>

```typescript
import { WordPress } from 'cdk-fargate-patterns'

new WordPress(scope: Construct, id: string, props?: WordPressProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPress.parameter.props"></a>

- *Type:* [`cdk-fargate-patterns.WordPressProps`](#cdk-fargate-patterns.WordPressProps)

---



#### Properties <a name="Properties"></a>

##### `svc`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.property.svc"></a>

- *Type:* [`cdk-fargate-patterns.DualAlbFargateService`](#cdk-fargate-patterns.DualAlbFargateService)

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `db`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPress.property.db"></a>

- *Type:* [`cdk-fargate-patterns.Database`](#cdk-fargate-patterns.Database)

---


## Structs <a name="Structs"></a>

### BaseFargateServiceProps <a name="cdk-fargate-patterns.BaseFargateServiceProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { BaseFargateServiceProps } from 'cdk-fargate-patterns'

const baseFargateServiceProps: BaseFargateServiceProps = { ... }
```

##### `tasks`<sup>Required</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.tasks"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)[]

---

##### `circuitBreaker`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.circuitBreaker"></a>

- *Type:* `boolean`
- *Default:* true

Enable the ECS service circuit breaker.

> - https://aws.amazon.com/tw/blogs/containers/announcing-amazon-ecs-deployment-circuit-breaker/

---

##### `cluster`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.cluster"></a>

- *Type:* [`@aws-cdk/aws-ecs.ICluster`](#@aws-cdk/aws-ecs.ICluster)
- *Default:* create a new ECS Cluster.

Use existing ECS Cluster.

---

##### `clusterProps`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.clusterProps"></a>

- *Type:* [`@aws-cdk/aws-ecs.ClusterProps`](#@aws-cdk/aws-ecs.ClusterProps)
- *Default:* Create vpc and enable Fargate Capacity Providers.

The properties used to define an ECS cluster.

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.enableExecuteCommand"></a>

- *Type:* `boolean`
- *Default:* false

Whether to enable ECS Exec support.

> https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html

---

##### `route53Ops`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.route53Ops"></a>

- *Type:* [`cdk-fargate-patterns.Route53Options`](#cdk-fargate-patterns.Route53Options)

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.spot"></a>

- *Type:* `boolean`
- *Default:* false

create a FARGATE_SPOT only cluster.

---

##### `spotTerminationHandler`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.spotTerminationHandler"></a>

- *Type:* `boolean`
- *Default:* true

Enable the fargate spot termination handler.

> https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html#fargate-capacity-providers-termination

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `vpcSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.BaseFargateServiceProps.property.vpcSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* {
subnetType: ec2.SubnetType.PRIVATE,
}

The subnets to associate with the service.

---

### DatabaseCofig <a name="cdk-fargate-patterns.DatabaseCofig"></a>

Database configuration.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DatabaseCofig } from 'cdk-fargate-patterns'

const databaseCofig: DatabaseCofig = { ... }
```

##### `connections`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.property.connections"></a>

- *Type:* [`@aws-cdk/aws-ec2.Connections`](#@aws-cdk/aws-ec2.Connections)

The database connnections.

---

##### `endpoint`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.property.endpoint"></a>

- *Type:* `string`

The endpoint address for the database.

---

##### `identifier`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.property.identifier"></a>

- *Type:* `string`

The databasae identifier.

---

##### `secret`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.property.secret"></a>

- *Type:* [`@aws-cdk/aws-secretsmanager.ISecret`](#@aws-cdk/aws-secretsmanager.ISecret)

The database secret.

---

### DatabaseProps <a name="cdk-fargate-patterns.DatabaseProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DatabaseProps } from 'cdk-fargate-patterns'

const databaseProps: DatabaseProps = { ... }
```

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

The VPC for the database.

---

##### `allowFrom`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.allowFrom"></a>

- *Type:* [`@aws-cdk/aws-ec2.IConnectable`](#@aws-cdk/aws-ec2.IConnectable)
- *Default:* the whole VPC CIDR

Allow database connection.

---

##### `auroraServerless`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.auroraServerless"></a>

- *Type:* `boolean`
- *Default:* false

enable aurora serverless.

---

##### `backupRetention`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.backupRetention"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 7 days

database backup retension.

---

##### `clusterEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.clusterEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IClusterEngine`](#@aws-cdk/aws-rds.IClusterEngine)
- *Default:* rds.AuroraMysqlEngineVersion.VER_2_09_1

The database cluster engine.

---

##### `databaseSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.databaseSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)

VPC subnets for database.

---

##### `defaultDatabaseName`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.defaultDatabaseName"></a>

- *Type:* `string`
- *Default:* do not create any default database

Default database name to create.

---

##### `instanceEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.instanceEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IInstanceEngine`](#@aws-cdk/aws-rds.IInstanceEngine)
- *Default:* MySQL 8.0.21

The database instance engine.

---

##### `instanceType`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.instanceType"></a>

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* r5.large

The database instance type.

---

##### `singleDbInstance`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.property.singleDbInstance"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use single RDS instance rather than RDS cluster.

Not recommended for production.

---

### DualAlbFargateServiceProps <a name="cdk-fargate-patterns.DualAlbFargateServiceProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DualAlbFargateServiceProps } from 'cdk-fargate-patterns'

const dualAlbFargateServiceProps: DualAlbFargateServiceProps = { ... }
```

##### `tasks`<sup>Required</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.tasks"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)[]

---

##### `circuitBreaker`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.circuitBreaker"></a>

- *Type:* `boolean`
- *Default:* true

Enable the ECS service circuit breaker.

> - https://aws.amazon.com/tw/blogs/containers/announcing-amazon-ecs-deployment-circuit-breaker/

---

##### `cluster`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.cluster"></a>

- *Type:* [`@aws-cdk/aws-ecs.ICluster`](#@aws-cdk/aws-ecs.ICluster)
- *Default:* create a new ECS Cluster.

Use existing ECS Cluster.

---

##### `clusterProps`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.clusterProps"></a>

- *Type:* [`@aws-cdk/aws-ecs.ClusterProps`](#@aws-cdk/aws-ecs.ClusterProps)
- *Default:* Create vpc and enable Fargate Capacity Providers.

The properties used to define an ECS cluster.

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.enableExecuteCommand"></a>

- *Type:* `boolean`
- *Default:* false

Whether to enable ECS Exec support.

> https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html

---

##### `route53Ops`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.route53Ops"></a>

- *Type:* [`cdk-fargate-patterns.Route53Options`](#cdk-fargate-patterns.Route53Options)

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.spot"></a>

- *Type:* `boolean`
- *Default:* false

create a FARGATE_SPOT only cluster.

---

##### `spotTerminationHandler`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.spotTerminationHandler"></a>

- *Type:* `boolean`
- *Default:* true

Enable the fargate spot termination handler.

> https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html#fargate-capacity-providers-termination

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `vpcSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.vpcSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* {
subnetType: ec2.SubnetType.PRIVATE,
}

The subnets to associate with the service.

---

##### `idleTimeout`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateServiceProps.property.idleTimeout"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 60.

The load balancer idle timeout, in seconds.

---

### DualNlbFargateServiceProps <a name="cdk-fargate-patterns.DualNlbFargateServiceProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DualNlbFargateServiceProps } from 'cdk-fargate-patterns'

const dualNlbFargateServiceProps: DualNlbFargateServiceProps = { ... }
```

##### `tasks`<sup>Required</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.tasks"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)[]

---

##### `circuitBreaker`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.circuitBreaker"></a>

- *Type:* `boolean`
- *Default:* true

Enable the ECS service circuit breaker.

> - https://aws.amazon.com/tw/blogs/containers/announcing-amazon-ecs-deployment-circuit-breaker/

---

##### `cluster`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.cluster"></a>

- *Type:* [`@aws-cdk/aws-ecs.ICluster`](#@aws-cdk/aws-ecs.ICluster)
- *Default:* create a new ECS Cluster.

Use existing ECS Cluster.

---

##### `clusterProps`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.clusterProps"></a>

- *Type:* [`@aws-cdk/aws-ecs.ClusterProps`](#@aws-cdk/aws-ecs.ClusterProps)
- *Default:* Create vpc and enable Fargate Capacity Providers.

The properties used to define an ECS cluster.

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.enableExecuteCommand"></a>

- *Type:* `boolean`
- *Default:* false

Whether to enable ECS Exec support.

> https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html

---

##### `route53Ops`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.route53Ops"></a>

- *Type:* [`cdk-fargate-patterns.Route53Options`](#cdk-fargate-patterns.Route53Options)

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.spot"></a>

- *Type:* `boolean`
- *Default:* false

create a FARGATE_SPOT only cluster.

---

##### `spotTerminationHandler`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.spotTerminationHandler"></a>

- *Type:* `boolean`
- *Default:* true

Enable the fargate spot termination handler.

> https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html#fargate-capacity-providers-termination

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `vpcSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualNlbFargateServiceProps.property.vpcSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* {
subnetType: ec2.SubnetType.PRIVATE,
}

The subnets to associate with the service.

---

### FargateTaskProps <a name="cdk-fargate-patterns.FargateTaskProps"></a>

Task properties for the Fargate.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { FargateTaskProps } from 'cdk-fargate-patterns'

const fargateTaskProps: FargateTaskProps = { ... }
```

##### `task`<sup>Required</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.task"></a>

- *Type:* [`@aws-cdk/aws-ecs.FargateTaskDefinition`](#@aws-cdk/aws-ecs.FargateTaskDefinition)

---

##### `capacityProviderStrategy`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.capacityProviderStrategy"></a>

- *Type:* [`@aws-cdk/aws-ecs.CapacityProviderStrategy`](#@aws-cdk/aws-ecs.CapacityProviderStrategy)[]

Customized capacity provider strategy.

---

##### `desiredCount`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.desiredCount"></a>

- *Type:* `number`
- *Default:* 1

desired number of tasks for the service.

---

##### `external`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.external"></a>

- *Type:* [`cdk-fargate-patterns.LoadBalancerAccessibility`](#cdk-fargate-patterns.LoadBalancerAccessibility)
- *Default:* no external listener

The external ELB listener.

---

##### `healthCheck`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.healthCheck"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.HealthCheck`](#@aws-cdk/aws-elasticloadbalancingv2.HealthCheck)

health check from elbv2 target group.

---

##### `healthCheckGracePeriod`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.healthCheckGracePeriod"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* cdk.Duration.seconds(60),

The period of time, in seconds, that the Amazon ECS service scheduler ignores unhealthy Elastic Load Balancing target health checks after a task has first started.

---

##### `internal`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.internal"></a>

- *Type:* [`cdk-fargate-patterns.LoadBalancerAccessibility`](#cdk-fargate-patterns.LoadBalancerAccessibility)
- *Default:* no internal listener

The internal ELB listener.

---

##### `maxHealthyPercent`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.maxHealthyPercent"></a>

- *Type:* `number`
- *Default:* 200

The maximum number of tasks, specified as a percentage of the Amazon ECS service's DesiredCount value, that can run in a service during a deployment.

---

##### `minHealthyPercent`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.minHealthyPercent"></a>

- *Type:* `number`
- *Default:* 50

The minimum number of tasks, specified as a percentage of the Amazon ECS service's DesiredCount value, that must continue to run and remain healthy during a deployment.

---

##### `protocol`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.protocol"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.Protocol`](#@aws-cdk/aws-elasticloadbalancingv2.Protocol)
- *Default:* TCP

The target group protocol for NLB.

For ALB, this option will be ignored and always set to HTTP.

---

##### `protocolVersion`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.protocolVersion"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ApplicationProtocolVersion`](#@aws-cdk/aws-elasticloadbalancingv2.ApplicationProtocolVersion)

The protocol version to use.

---

##### `scalingPolicy`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.scalingPolicy"></a>

- *Type:* [`cdk-fargate-patterns.ServiceScalingPolicy`](#cdk-fargate-patterns.ServiceScalingPolicy)
- *Default:* { maxCapacity: 10, targetCpuUtilization: 50, requestsPerTarget: 1000 }

service autoscaling policy.

---

##### `serviceName`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.property.serviceName"></a>

- *Type:* `string`
- *Default:* auto-generated

The serviceName.

---

### LaravelProps <a name="cdk-fargate-patterns.LaravelProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { LaravelProps } from 'cdk-fargate-patterns'

const laravelProps: LaravelProps = { ... }
```

##### `code`<sup>Required</sup> <a name="cdk-fargate-patterns.LaravelProps.property.code"></a>

- *Type:* `string`

The local path to the Laravel code base.

---

##### `loadbalancer`<sup>Required</sup> <a name="cdk-fargate-patterns.LaravelProps.property.loadbalancer"></a>

- *Type:* [`cdk-fargate-patterns.LoadBalancerAccessibility`](#cdk-fargate-patterns.LoadBalancerAccessibility)

The loadbalancer accessibility for the service.

---

##### `auroraServerless`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.auroraServerless"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use aurora serverless.

When enabled, the `databaseInstanceType` and
`engine` will be ignored. The `rds.DatabaseClusterEngine.AURORA_MYSQL` will be used as
the default cluster engine instead.

---

##### `backupRetention`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.backupRetention"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 7 days

database backup retension.

---

##### `clusterEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.clusterEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IClusterEngine`](#@aws-cdk/aws-rds.IClusterEngine)
- *Default:* rds.AuroraMysqlEngineVersion.VER_2_09_1

The database cluster engine.

---

##### `containerPort`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.containerPort"></a>

- *Type:* `number`
- *Default:* 80

The Laravel container port.

---

##### `databaseInstanceType`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.databaseInstanceType"></a>

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* r5.large

Database instance type.

---

##### `databaseSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.databaseSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* VPC isolated subnets

VPC subnets for database.

---

##### `defaultDatabaseName`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.defaultDatabaseName"></a>

- *Type:* `string`

The default database name to create.

---

##### `efsFileSystem`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.efsFileSystem"></a>

- *Type:* [`@aws-cdk/aws-efs.FileSystemProps`](#@aws-cdk/aws-efs.FileSystemProps)

Options to create the EFS FileSystem.

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.enableExecuteCommand"></a>

- *Type:* `boolean`

enable ECS Exec.

---

##### `instanceEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.instanceEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IInstanceEngine`](#@aws-cdk/aws-rds.IInstanceEngine)
- *Default:* MySQL 8.0.21

The database instance engine.

---

##### `serviceProps`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.serviceProps"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)

task options for the Laravel fargate service.

---

##### `singleDbInstance`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.singleDbInstance"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use single RDS instance rather than RDS cluster.

Not recommended for production.

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.spot"></a>

- *Type:* `boolean`

enable fargate spot.

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

### LoadBalancerAccessibility <a name="cdk-fargate-patterns.LoadBalancerAccessibility"></a>

The load balancer accessibility.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { LoadBalancerAccessibility } from 'cdk-fargate-patterns'

const loadBalancerAccessibility: LoadBalancerAccessibility = { ... }
```

##### `port`<sup>Required</sup> <a name="cdk-fargate-patterns.LoadBalancerAccessibility.property.port"></a>

- *Type:* `number`

The port of the listener.

---

##### `certificate`<sup>Optional</sup> <a name="cdk-fargate-patterns.LoadBalancerAccessibility.property.certificate"></a>

- *Type:* [`@aws-cdk/aws-certificatemanager.ICertificate`](#@aws-cdk/aws-certificatemanager.ICertificate)[]
- *Default:* no certificate(HTTP only)

The ACM certificate for the HTTPS listener.

---

##### `forwardConditions`<sup>Optional</sup> <a name="cdk-fargate-patterns.LoadBalancerAccessibility.property.forwardConditions"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ListenerCondition`](#@aws-cdk/aws-elasticloadbalancingv2.ListenerCondition)[]

Listener forward conditions.

---

### Route53Options <a name="cdk-fargate-patterns.Route53Options"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { Route53Options } from 'cdk-fargate-patterns'

const route53Options: Route53Options = { ... }
```

##### `enableLoadBalancerAlias`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.property.enableLoadBalancerAlias"></a>

- *Type:* `boolean`
- *Default:* true

Whether to configure the ALIAS for the LB.

---

##### `externalElbRecordName`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.property.externalElbRecordName"></a>

- *Type:* `string`
- *Default:* external

the external ELB record name.

---

##### `internalElbRecordName`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.property.internalElbRecordName"></a>

- *Type:* `string`
- *Default:* internal

the internal ELB record name.

---

##### `zoneName`<sup>Optional</sup> <a name="cdk-fargate-patterns.Route53Options.property.zoneName"></a>

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

##### `maxCapacity`<sup>Optional</sup> <a name="cdk-fargate-patterns.ServiceScalingPolicy.property.maxCapacity"></a>

- *Type:* `number`
- *Default:* 10

max capacity for the service autoscaling.

---

##### `requestPerTarget`<sup>Optional</sup> <a name="cdk-fargate-patterns.ServiceScalingPolicy.property.requestPerTarget"></a>

- *Type:* `number`
- *Default:* 1000

request per target.

---

##### `targetCpuUtilization`<sup>Optional</sup> <a name="cdk-fargate-patterns.ServiceScalingPolicy.property.targetCpuUtilization"></a>

- *Type:* `number`
- *Default:* 50

target cpu utilization.

---

### WordPressProps <a name="cdk-fargate-patterns.WordPressProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { WordPressProps } from 'cdk-fargate-patterns'

const wordPressProps: WordPressProps = { ... }
```

##### `auroraServerless`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.auroraServerless"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use aurora serverless.

When enabled, the `databaseInstanceType` and
`engine` will be ignored. The `rds.DatabaseClusterEngine.AURORA_MYSQL` will be used as
the default cluster engine instead.

---

##### `backupRetention`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.backupRetention"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 7 days

database backup retension.

---

##### `clusterEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.clusterEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IClusterEngine`](#@aws-cdk/aws-rds.IClusterEngine)
- *Default:* rds.AuroraMysqlEngineVersion.VER_2_09_1

The database cluster engine.

---

##### `databaseInstanceType`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.databaseInstanceType"></a>

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* r5.large

Database instance type.

---

##### `databaseSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.databaseSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* VPC isolated subnets

VPC subnets for database.

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.enableExecuteCommand"></a>

- *Type:* `boolean`

enable ECS Exec.

---

##### `instanceEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.instanceEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IInstanceEngine`](#@aws-cdk/aws-rds.IInstanceEngine)
- *Default:* MySQL 8.0.21

The database instance engine.

---

##### `serviceProps`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.serviceProps"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)

task options for the WordPress fargate service.

---

##### `singleDbInstance`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.singleDbInstance"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use single RDS instance rather than RDS cluster.

Not recommended for production.

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.spot"></a>

- *Type:* `boolean`

enable fargate spot.

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---



