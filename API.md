# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### Database <a name="cdk-fargate-patterns.Database"></a>

Represents the database instance or database cluster.

#### Initializer <a name="cdk-fargate-patterns.Database.Initializer"></a>

```typescript
import { Database } from 'cdk-fargate-patterns'

new Database(scope: Construct, id: string, props: DatabaseProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.props"></a>

- *Type:* [`cdk-fargate-patterns.DatabaseProps`](#cdk-fargate-patterns.DatabaseProps)

---



#### Properties <a name="Properties"></a>

##### `clusterEndpointHostname`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.clusterEndpointHostname"></a>

- *Type:* `string`

---

##### `clusterIdentifier`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.clusterIdentifier"></a>

- *Type:* `string`

---

##### `connections`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.connections"></a>

- *Type:* [`@aws-cdk/aws-ec2.Connections`](#@aws-cdk/aws-ec2.Connections)

---

##### `secret`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.secret"></a>

- *Type:* [`@aws-cdk/aws-secretsmanager.ISecret`](#@aws-cdk/aws-secretsmanager.ISecret)

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.Database.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---


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

The VPC.

---

##### `externalAlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.externalAlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer)

The external ALB.

---

##### `internalAlb`<sup>Optional</sup> <a name="cdk-fargate-patterns.DualAlbFargateService.internalAlb"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer`](#@aws-cdk/aws-elasticloadbalancingv2.ApplicationLoadBalancer)

The internal ALB.

---


### Laravel <a name="cdk-fargate-patterns.Laravel"></a>

Represents the Laravel service.

#### Initializer <a name="cdk-fargate-patterns.Laravel.Initializer"></a>

```typescript
import { Laravel } from 'cdk-fargate-patterns'

new Laravel(scope: Construct, id: string, props: LaravelProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.props"></a>

- *Type:* [`cdk-fargate-patterns.LaravelProps`](#cdk-fargate-patterns.LaravelProps)

---



#### Properties <a name="Properties"></a>

##### `svc`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.svc"></a>

- *Type:* [`cdk-fargate-patterns.DualAlbFargateService`](#cdk-fargate-patterns.DualAlbFargateService)

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.Laravel.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `db`<sup>Optional</sup> <a name="cdk-fargate-patterns.Laravel.db"></a>

- *Type:* [`cdk-fargate-patterns.Database`](#cdk-fargate-patterns.Database)

---


### WordPress <a name="cdk-fargate-patterns.WordPress"></a>

#### Initializer <a name="cdk-fargate-patterns.WordPress.Initializer"></a>

```typescript
import { WordPress } from 'cdk-fargate-patterns'

new WordPress(scope: Construct, id: string, props?: WordPressProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.id"></a>

- *Type:* `string`

---

##### `props`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPress.props"></a>

- *Type:* [`cdk-fargate-patterns.WordPressProps`](#cdk-fargate-patterns.WordPressProps)

---



#### Properties <a name="Properties"></a>

##### `svc`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.svc"></a>

- *Type:* [`cdk-fargate-patterns.DualAlbFargateService`](#cdk-fargate-patterns.DualAlbFargateService)

---

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.WordPress.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

##### `db`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPress.db"></a>

- *Type:* [`cdk-fargate-patterns.Database`](#cdk-fargate-patterns.Database)

---


## Structs <a name="Structs"></a>

### DatabaseCofig <a name="cdk-fargate-patterns.DatabaseCofig"></a>

Database configuration.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DatabaseCofig } from 'cdk-fargate-patterns'

const databaseCofig: DatabaseCofig = { ... }
```

##### `connections`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.connections"></a>

- *Type:* [`@aws-cdk/aws-ec2.Connections`](#@aws-cdk/aws-ec2.Connections)

The database connnections.

---

##### `endpoint`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.endpoint"></a>

- *Type:* `string`

The endpoint address for the database.

---

##### `identifier`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.identifier"></a>

- *Type:* `string`

The databasae identifier.

---

##### `secret`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseCofig.secret"></a>

- *Type:* [`@aws-cdk/aws-secretsmanager.ISecret`](#@aws-cdk/aws-secretsmanager.ISecret)

The database secret.

---

### DatabaseProps <a name="cdk-fargate-patterns.DatabaseProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DatabaseProps } from 'cdk-fargate-patterns'

const databaseProps: DatabaseProps = { ... }
```

##### `vpc`<sup>Required</sup> <a name="cdk-fargate-patterns.DatabaseProps.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

The VPC for the database.

---

##### `allowFrom`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.allowFrom"></a>

- *Type:* [`@aws-cdk/aws-ec2.IConnectable`](#@aws-cdk/aws-ec2.IConnectable)
- *Default:* the whole VPC CIDR

Allow database connection.

---

##### `auroraServerless`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.auroraServerless"></a>

- *Type:* `boolean`
- *Default:* false

enable aurora serverless.

---

##### `backupRetention`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.backupRetention"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 7 days

database backup retension.

---

##### `clusterEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.clusterEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IClusterEngine`](#@aws-cdk/aws-rds.IClusterEngine)
- *Default:* rds.AuroraMysqlEngineVersion.VER_2_09_1

The database cluster engine.

---

##### `databaseSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.databaseSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)

VPC subnets for database.

---

##### `defaultDatabaseName`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.defaultDatabaseName"></a>

- *Type:* `string`
- *Default:* do not create any default database

Default database name to create.

---

##### `instanceEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.instanceEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IInstanceEngine`](#@aws-cdk/aws-rds.IInstanceEngine)
- *Default:* MySQL 8.0.21

The database instance engine.

---

##### `instanceType`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.instanceType"></a>

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* r5.large

The database instance type.

---

##### `singleDbInstance`<sup>Optional</sup> <a name="cdk-fargate-patterns.DatabaseProps.singleDbInstance"></a>

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

Task properties for the Fargate.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { FargateTaskProps } from 'cdk-fargate-patterns'

const fargateTaskProps: FargateTaskProps = { ... }
```

##### `task`<sup>Required</sup> <a name="cdk-fargate-patterns.FargateTaskProps.task"></a>

- *Type:* [`@aws-cdk/aws-ecs.FargateTaskDefinition`](#@aws-cdk/aws-ecs.FargateTaskDefinition)

---

##### `capacityProviderStrategy`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.capacityProviderStrategy"></a>

- *Type:* [`@aws-cdk/aws-ecs.CapacityProviderStrategy`](#@aws-cdk/aws-ecs.CapacityProviderStrategy)[]

Customized capacity provider strategy.

---

##### `desiredCount`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.desiredCount"></a>

- *Type:* `number`
- *Default:* 1

desired number of tasks for the service.

---

##### `external`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.external"></a>

- *Type:* [`cdk-fargate-patterns.LoadBalancerAccessibility`](#cdk-fargate-patterns.LoadBalancerAccessibility)
- *Default:* no external listener

The external ALB listener.

---

##### `healthCheck`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.healthCheck"></a>

- *Type:* [`@aws-cdk/aws-elasticloadbalancingv2.HealthCheck`](#@aws-cdk/aws-elasticloadbalancingv2.HealthCheck)

health check from elbv2 target group.

---

##### `internal`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.internal"></a>

- *Type:* [`cdk-fargate-patterns.LoadBalancerAccessibility`](#cdk-fargate-patterns.LoadBalancerAccessibility)
- *Default:* no internal listener

The internal ALB listener.

---

##### `scalingPolicy`<sup>Optional</sup> <a name="cdk-fargate-patterns.FargateTaskProps.scalingPolicy"></a>

- *Type:* [`cdk-fargate-patterns.ServiceScalingPolicy`](#cdk-fargate-patterns.ServiceScalingPolicy)
- *Default:* { maxCapacity: 10, targetCpuUtilization: 50, requestsPerTarget: 1000 }

service autoscaling policy.

---

### LaravelProps <a name="cdk-fargate-patterns.LaravelProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { LaravelProps } from 'cdk-fargate-patterns'

const laravelProps: LaravelProps = { ... }
```

##### `code`<sup>Required</sup> <a name="cdk-fargate-patterns.LaravelProps.code"></a>

- *Type:* `string`

The local path to the Laravel code base.

---

##### `loadbalancer`<sup>Required</sup> <a name="cdk-fargate-patterns.LaravelProps.loadbalancer"></a>

- *Type:* [`cdk-fargate-patterns.LoadBalancerAccessibility`](#cdk-fargate-patterns.LoadBalancerAccessibility)

The loadbalancer accessibility for the service.

---

##### `auroraServerless`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.auroraServerless"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use aurora serverless.

When enabled, the `databaseInstanceType` and
`engine` will be ignored. The `rds.DatabaseClusterEngine.AURORA_MYSQL` will be used as
the default cluster engine instead.

---

##### `backupRetention`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.backupRetention"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 7 days

database backup retension.

---

##### `clusterEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.clusterEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IClusterEngine`](#@aws-cdk/aws-rds.IClusterEngine)
- *Default:* rds.AuroraMysqlEngineVersion.VER_2_09_1

The database cluster engine.

---

##### `containerPort`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.containerPort"></a>

- *Type:* `number`
- *Default:* 80

The Laravel container port.

---

##### `databaseInstanceType`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.databaseInstanceType"></a>

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* r5.large

Database instance type.

---

##### `databaseSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.databaseSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* VPC isolated subnets

VPC subnets for database.

---

##### `defaultDatabaseName`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.defaultDatabaseName"></a>

- *Type:* `string`

The default database name to create.

---

##### `efsFileSystem`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.efsFileSystem"></a>

- *Type:* [`@aws-cdk/aws-efs.FileSystemProps`](#@aws-cdk/aws-efs.FileSystemProps)

Options to create the EFS FileSystem.

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.enableExecuteCommand"></a>

- *Type:* `boolean`

enable ECS Exec.

---

##### `instanceEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.instanceEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IInstanceEngine`](#@aws-cdk/aws-rds.IInstanceEngine)
- *Default:* MySQL 8.0.21

The database instance engine.

---

##### `serviceProps`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.serviceProps"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)

task options for the Laravel fargate service.

---

##### `singleDbInstance`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.singleDbInstance"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use single RDS instance rather than RDS cluster.

Not recommended for production.

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.spot"></a>

- *Type:* `boolean`

enable fargate spot.

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.LaravelProps.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---

### LoadBalancerAccessibility <a name="cdk-fargate-patterns.LoadBalancerAccessibility"></a>

The load balancer accessibility.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { LoadBalancerAccessibility } from 'cdk-fargate-patterns'

const loadBalancerAccessibility: LoadBalancerAccessibility = { ... }
```

##### `port`<sup>Required</sup> <a name="cdk-fargate-patterns.LoadBalancerAccessibility.port"></a>

- *Type:* `number`

The port of the listener.

---

##### `certificate`<sup>Optional</sup> <a name="cdk-fargate-patterns.LoadBalancerAccessibility.certificate"></a>

- *Type:* [`@aws-cdk/aws-certificatemanager.ICertificate`](#@aws-cdk/aws-certificatemanager.ICertificate)[]
- *Default:* no certificate(HTTP only)

The ACM certificate for the HTTPS listener.

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

### WordPressProps <a name="cdk-fargate-patterns.WordPressProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { WordPressProps } from 'cdk-fargate-patterns'

const wordPressProps: WordPressProps = { ... }
```

##### `auroraServerless`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.auroraServerless"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use aurora serverless.

When enabled, the `databaseInstanceType` and
`engine` will be ignored. The `rds.DatabaseClusterEngine.AURORA_MYSQL` will be used as
the default cluster engine instead.

---

##### `backupRetention`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.backupRetention"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 7 days

database backup retension.

---

##### `clusterEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.clusterEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IClusterEngine`](#@aws-cdk/aws-rds.IClusterEngine)
- *Default:* rds.AuroraMysqlEngineVersion.VER_2_09_1

The database cluster engine.

---

##### `databaseInstanceType`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.databaseInstanceType"></a>

- *Type:* [`@aws-cdk/aws-ec2.InstanceType`](#@aws-cdk/aws-ec2.InstanceType)
- *Default:* r5.large

Database instance type.

---

##### `databaseSubnets`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.databaseSubnets"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* VPC isolated subnets

VPC subnets for database.

---

##### `enableExecuteCommand`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.enableExecuteCommand"></a>

- *Type:* `boolean`

enable ECS Exec.

---

##### `instanceEngine`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.instanceEngine"></a>

- *Type:* [`@aws-cdk/aws-rds.IInstanceEngine`](#@aws-cdk/aws-rds.IInstanceEngine)
- *Default:* MySQL 8.0.21

The database instance engine.

---

##### `serviceProps`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.serviceProps"></a>

- *Type:* [`cdk-fargate-patterns.FargateTaskProps`](#cdk-fargate-patterns.FargateTaskProps)

task options for the WordPress fargate service.

---

##### `singleDbInstance`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.singleDbInstance"></a>

- *Type:* `boolean`
- *Default:* false

Whether to use single RDS instance rather than RDS cluster.

Not recommended for production.

---

##### `spot`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.spot"></a>

- *Type:* `boolean`

enable fargate spot.

---

##### `vpc`<sup>Optional</sup> <a name="cdk-fargate-patterns.WordPressProps.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

---



