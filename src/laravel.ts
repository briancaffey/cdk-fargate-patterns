import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import * as logs from '@aws-cdk/aws-logs';
import * as rds from '@aws-cdk/aws-rds';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService, FargateTaskProps, Database, DatabaseProps, LoadBalancerAccessibility } from './';

export interface LaravelProps {
  readonly vpc?: ec2.IVpc;
  /**
   * VPC subnets for database
   *
   * @default - VPC isolated subnets
   */
  readonly databaseSubnets?: ec2.SubnetSelection;
  /**
   * Database instance type
   *
   * @default r5.large
   */
  readonly databaseInstanceType?: ec2.InstanceType;
  /**
   * The database instance engine
   *
   * @default - MySQL 8.0.21
   */
  readonly instanceEngine?: rds.IInstanceEngine;
  /**
   * The database cluster engine
   *
   * @default rds.AuroraMysqlEngineVersion.VER_2_09_1
   */
  readonly clusterEngine?: rds.IClusterEngine;
  /**
   * Whether to use aurora serverless. When enabled, the `databaseInstanceType` and
   * `engine` will be ignored. The `rds.DatabaseClusterEngine.AURORA_MYSQL` will be used as
   * the default cluster engine instead.
   *
   * @default false
   */
  readonly auroraServerless?: boolean;
  /**
   * Whether to use single RDS instance rather than RDS cluster. Not recommended for production.
   *
   * @default false
   */
  readonly singleDbInstance?: boolean;
  /**
   * database backup retension
   *
   * @default - 7 days
   */
  readonly backupRetention?: cdk.Duration;

  /**
   * task options for the Laravel fargate service
   */
  readonly serviceProps?: FargateTaskProps;
  /**
   * enable fargate spot
   */
  readonly spot?: boolean;
  /**
   * enable ECS Exec
   */
  readonly enableExecuteCommand?: boolean;
  /**
   * The local path to the Laravel code base.
   */
  readonly code: string;
  /**
   * The Laravel container port
   * @default 80
   */
  readonly containerPort?: number;
  /**
   * The loadbalancer accessibility for the service.
   */
  readonly loadbalancer: LoadBalancerAccessibility;
  /**
   * The default database name to create.
   */
  readonly defaultDatabaseName?: string;

  /**
   * Options to create the EFS FileSystem
   */
  readonly efsFileSystem?: efs.FileSystemProps;

}

/**
 * Represents the Laravel service
 */
export class Laravel extends cdk.Construct {
  readonly vpc: ec2.IVpc;
  readonly db?: Database;
  readonly svc: DualAlbFargateService;
  constructor(scope: cdk.Construct, id: string, props: LaravelProps) {
    super(scope, id);

    this.vpc = props.vpc ?? getOrCreateVpc(this);
    this.db = this.addDatabase({
      vpc: this.vpc,
      databaseSubnets: props.databaseSubnets,
      instanceType: props.databaseInstanceType,
      instanceEngine: props.instanceEngine,
      clusterEngine: props.clusterEngine,
      auroraServerless: props.auroraServerless,
      singleDbInstance: props.singleDbInstance,
      backupRetention: props.backupRetention,
      defaultDatabaseName: props.defaultDatabaseName,
    });

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const task = new ecs.FargateTaskDefinition(this, 'Task', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    task.addContainer('Laravel', {
      image: ecs.ContainerImage.fromAsset(props.code),
      portMappings: [{ containerPort: props.containerPort ?? 80 }],
      environment: {
        Laravel_DB_NAME: 'Laravel',
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'Laravel-fargate',
        logGroup,
      }),
      secrets: {
        LARAVEL_DB_HOST: ecs.Secret.fromSecretsManager(
          this.db.secret,
          'host',
        ),
        LARAVEL_DB_USER: ecs.Secret.fromSecretsManager(
          this.db.secret,
          'username',
        ),
        LARAVEL_DB_PASSWORD: ecs.Secret.fromSecretsManager(
          this.db.secret,
          'password',
        ),
      },
    });

    const healthCheck = {
      path: '/',
      interval: cdk.Duration.minutes(1),
    };

    this.svc = new DualAlbFargateService(this, 'ALBFargateService', {
      vpc: this.vpc,
      spot: props.spot,
      enableExecuteCommand: props.enableExecuteCommand,
      tasks: props.serviceProps ? [props.serviceProps] : [
        {
          external: props.loadbalancer,
          task,
          healthCheck,
        },
      ],
      route53Ops: { enableLoadBalancerAlias: false },
    });

    if (props.efsFileSystem) {
      // EFS volume
      const filesystem = new efs.FileSystem(this, 'FileSystem', props.efsFileSystem);

      const volumeName = 'efs';
      this.svc.service[0].taskDefinition.addVolume({
        name: volumeName,
        efsVolumeConfiguration: {
          fileSystemId: filesystem.fileSystemId,
        },
      });

      // fix me - tentatively mount to /efsmount
      this.svc.service[0].taskDefinition.defaultContainer?.addMountPoints({
        containerPath: '/efsmount',
        readOnly: false,
        sourceVolume: volumeName,
      });

      filesystem.connections.allowFrom(new ec2.Connections({ securityGroups: this.svc.service[0].connections.securityGroups }), ec2.Port.tcp(2049), 'allow Laravel to connect to efs filesystem');
    }


    this.db.connections.allowFrom(this.svc.service[0], this.db.connections.defaultPort!, `allow ${this.svc.service[0].serviceName} to connect to database`);

  }
  private addDatabase(props: DatabaseProps): Database {
    return new Database(this, 'Database', {
      ...props,
    });
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


