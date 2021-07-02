import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import * as logs from '@aws-cdk/aws-logs';
import * as rds from '@aws-cdk/aws-rds';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import * as patterns from './index';


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
}

export class WordPress extends cdk.Construct {
  readonly vpc: ec2.IVpc;
  readonly db?: Database;
  readonly svc: patterns.DualAlbFargateService;
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
    });

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const task = new ecs.FargateTaskDefinition(this, 'Task', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    // bootstrap container that creates the database if not exist
    const bootstrap = task.addContainer('bootstrap', {
      essential: false,
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/ubuntu/mysql:latest'),
      environment: {
        DB_NAME: 'wordpress',
      },
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
      command: [
        'sh', '-c',
        'mysql -u$WORDPRESS_DB_USER -p$WORDPRESS_DB_PASSWORD -h$WORDPRESS_DB_HOST -e "CREATE DATABASE IF NOT EXISTS $DB_NAME"',
      ],
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'bootstrap',
        logGroup,
      }),
    });
    const wp = task.addContainer('wordpress', {
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

    wp.addContainerDependencies({
      container: bootstrap,
      condition: ecs.ContainerDependencyCondition.SUCCESS,
    });

    this.svc = new patterns.DualAlbFargateService(this, 'ALBFargateService', {
      spot: true,
      enableExecuteCommand: true,
      tasks: [
        {
          listenerPort: 80,
          accessibility: patterns.LoadBalancerAccessibility.EXTERNAL_ONLY,
          task,
          healthCheck: {
            path: '/wp-includes/images/blank.gif',
            interval: cdk.Duration.minutes(1),
          },
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

    filesystem.connections.allowFrom(this.svc.service[0], ec2.Port.tcp(2049));


  }
  private addDatabase(props: DatabaseProps): Database {
    return new Database(this, 'Database', {
      ...props,
      // allowFrom: this.svc.service[0].connections,
    });
  }
}

export interface DatabaseProps {
  /**
   * The VPC for the database
   */
  readonly vpc: ec2.IVpc;
  /**
   * VPC subnets for database
   */
  readonly databaseSubnets?: ec2.SubnetSelection;
  /**
   * The database instance type
   *
   * @default r5.large
   */
  readonly instanceType?: ec2.InstanceType;
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
   * enable aurora serverless
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
   * Allow database connection.
   * @default - the whole VPC CIDR
   */
  readonly allowFrom?: ec2.IConnectable;
}

/**
 * Database configuration
 */
export interface DatabaseCofig {
  /**
   * The database secret.
   */
  readonly secret: secretsmanager.ISecret;
  /**
   * The database connnections.
   */
  readonly connections: ec2.Connections;
  /**
   * The endpoint address for the database.
   */
  readonly endpoint: string;
  /**
   * The databasae identifier.
   */
  readonly identifier: string;
}


/**
 * Represents the database instance or database cluster
 */
export class Database extends cdk.Construct {
  readonly vpc: ec2.IVpc;
  readonly clusterEndpointHostname: string;
  readonly clusterIdentifier: string;
  readonly secret: secretsmanager.ISecret;
  readonly connections: ec2.Connections;
  private readonly _mysqlListenerPort: number = 3306;

  constructor(scope: cdk.Construct, id: string, props: DatabaseProps) {
    super(scope, id);
    this.vpc = props.vpc;
    const config = props.auroraServerless ? this._createServerlessCluster(props)
      : props.singleDbInstance ? this._createRdsInstance(props) : this._createRdsCluster(props);
    this.secret = config.secret;
    // allow internally from the same security group
    config.connections.allowInternally(ec2.Port.tcp(this._mysqlListenerPort));
    // allow from the whole vpc cidr
    config.connections.allowFrom(props.allowFrom ?? ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(this._mysqlListenerPort));
    this.clusterEndpointHostname = config.endpoint;
    this.clusterIdentifier = config.identifier;
    this.connections = config.connections;
    printOutput(this, 'DBSecretArn', config.secret.secretArn);
    printOutput(this, 'clusterEndpointHostname', this.clusterEndpointHostname);
    printOutput(this, 'clusterIdentifier', this.clusterIdentifier);
  }
  private _createRdsInstance(props: DatabaseProps): DatabaseCofig {
    const dbInstance = new rds.DatabaseInstance(this, 'DBInstance', {
      vpc: props.vpc,
      vpcSubnets: props.databaseSubnets,
      engine: props.instanceEngine ?? rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_21,
      }),
      storageEncrypted: true,
      backupRetention: props.backupRetention ?? cdk.Duration.days(7),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      instanceType: props.instanceType ?? new ec2.InstanceType('r5.large'),
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.mysql8.0'),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    return {
      connections: dbInstance.connections,
      endpoint: dbInstance.dbInstanceEndpointAddress,
      identifier: dbInstance.instanceIdentifier,
      secret: dbInstance.secret!,
    };
  }
  // create a RDS for MySQL DB cluster
  private _createRdsCluster(props: DatabaseProps): DatabaseCofig {
    const dbCluster = new rds.DatabaseCluster(this, 'DBCluster', {
      engine: props.clusterEngine ?? rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_2_09_1,
      }),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      instanceProps: {
        vpc: props.vpc,
        vpcSubnets: props.databaseSubnets,
        instanceType: props.instanceType ?? new ec2.InstanceType('r5.large'),
      },
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-mysql5.7'),
      backup: {
        retention: props.backupRetention ?? cdk.Duration.days(7),
      },
      storageEncrypted: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    return {
      connections: dbCluster.connections,
      endpoint: dbCluster.clusterEndpoint.hostname,
      identifier: dbCluster.clusterIdentifier,
      secret: dbCluster.secret!,
    };
  }
  private _createServerlessCluster(props: DatabaseProps): DatabaseCofig {
    const dbCluster = new rds.ServerlessCluster(this, 'AuroraServerlessCluster', {
      engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
      vpc: props.vpc,
      vpcSubnets: props.databaseSubnets,
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      backupRetention: props.backupRetention ?? cdk.Duration.days(7),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-mysql5.7'),
    });
    return {
      connections: dbCluster.connections,
      endpoint: dbCluster.clusterEndpoint.hostname,
      identifier: dbCluster.clusterIdentifier,
      secret: dbCluster.secret!,
    };
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

function printOutput(scope: cdk.Construct, id: string, key: string | number) {
  new cdk.CfnOutput(scope, id, { value: String(key) });
}


