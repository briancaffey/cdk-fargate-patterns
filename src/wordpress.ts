import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import * as logs from '@aws-cdk/aws-logs';
import * as rds from '@aws-cdk/aws-rds';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService, FargateTaskProps, Database, DatabaseProps } from './';
import { getOrCreateVpc } from './common/common-functions';


export interface WordPressProps {
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
   * task options for the WordPress fargate service
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
}

export class WordPress extends cdk.Construct {
  readonly vpc: ec2.IVpc;
  readonly db?: Database;
  readonly svc: DualAlbFargateService;
  constructor(scope: cdk.Construct, id: string, props: WordPressProps = {}) {
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
      defaultDatabaseName: 'wordpress',
    });

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const task = new ecs.FargateTaskDefinition(this, 'Task', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    task.addContainer('wordpress', {
      image: ecs.ContainerImage.fromRegistry('wordpress:latest'),
      portMappings: [{ containerPort: 80 }],
      environment: {
        WORDPRESS_DB_NAME: 'wordpress',
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'wordpress-fargate',
        logGroup,
      }),
      secrets: {
        WORDPRESS_DB_HOST: ecs.Secret.fromSecretsManager(
          this.db.secret,
          'host',
        ),
        WORDPRESS_DB_USER: ecs.Secret.fromSecretsManager(
          this.db.secret,
          'username',
        ),
        WORDPRESS_DB_PASSWORD: ecs.Secret.fromSecretsManager(
          this.db.secret,
          'password',
        ),
      },
    });

    const healthCheck = {
      path: '/wp-includes/images/blank.gif',
      interval: cdk.Duration.minutes(1),
    };

    this.svc = new DualAlbFargateService(this, 'ALBFargateService', {
      vpc: this.vpc,
      spot: props.spot,
      enableExecuteCommand: props.enableExecuteCommand,
      tasks: props.serviceProps ? [props.serviceProps] : [
        {
          external: { port: 80 },
          task,
          healthCheck,
        },
      ],
      route53Ops: {
        enableLoadBalancerAlias: false,
      },
    });

    // EFS volume
    const filesystem = new efs.FileSystem(this, 'FileSystem', {
      vpc: this.vpc,
      encrypted: true,
    });

    const volumeName = 'efs';
    this.svc.service[0].taskDefinition.addVolume({
      name: volumeName,
      efsVolumeConfiguration: {
        fileSystemId: filesystem.fileSystemId,
      },
    });
    this.svc.service[0].taskDefinition.defaultContainer?.addMountPoints({
      containerPath: '/var/www/html',
      readOnly: false,
      sourceVolume: volumeName,
    });

    filesystem.connections.allowFrom( new ec2.Connections({ securityGroups: this.svc.service[0].connections.securityGroups }), ec2.Port.tcp(2049), 'allow wordpress to connect efs');

    this.db.connections.allowFrom(this.svc.service[0], this.db.connections.defaultPort!, `allow ${this.svc.service[0].serviceName} to connect db`);

  }
  private addDatabase(props: DatabaseProps): Database {
    return new Database(this, 'Database', {
      ...props,
    });
  }
}