import '@aws-cdk/assert/jest';
import * as path from 'path';
import { ResourcePart } from '@aws-cdk/assert/lib/assertions/have-resource';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService, DualNlbFargateService } from '../src/index';
import { WordPress } from '../src/wordpress';

let app: cdk.App;
let env: { region: string; account: string };
let stack: cdk.Stack;


beforeEach(() => {
  app = new cdk.App();
  env = {
    region: 'us-east-1',
    account: '123456789012',
  };
  stack = new cdk.Stack(app, 'demo-stack', { env });
});


// match snapshot
test('Snapshot - DualAlbFargateService', () => {
  const orderTask = new ecs.FargateTaskDefinition(stack, 'orderTask', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  const zoneName = 'svc.local';
  const internalAlbRecordName = 'internal';
  const externalAlbRecordName = 'external';
  const internalALBEndpoint = `http://${internalAlbRecordName}.${zoneName}`;

  orderTask.addContainer('order', {
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/golang/OrderService')),
    portMappings: [
      { containerPort: 8080 },
    ],
    environment: {
      PRODUCT_SVC_URL: `${internalALBEndpoint}:9090`,
      CUSTOMER_SVC_URL: `${internalALBEndpoint}:8080`,
      serviceName: 'order',
      versionNum: '1.0',
    },
  });

  const customerTask = new ecs.FargateTaskDefinition(stack, 'customerTask', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  customerTask.addContainer('customer', {
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/golang/CommonService')),
    portMappings: [
      { containerPort: 8080 },
    ],
    environment: {
      PRODUCT_SVC_URL: `${internalALBEndpoint}:9090`,
      CUSTOMER_SVC_URL: `${internalALBEndpoint}:8080`,
      serviceName: 'customer',
      versionNum: '1.0',
    },
  });

  const productTask = new ecs.FargateTaskDefinition(stack, 'productTask', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  productTask.addContainer('product', {
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/golang/CommonService')),
    portMappings: [
      { containerPort: 8080 },
    ],
    environment: {
      PRODUCT_SVC_URL: `${internalALBEndpoint}:9090`,
      CUSTOMER_SVC_URL: `${internalALBEndpoint}:8080`,
      serviceName: 'product',
      versionNum: '1.0',
    },
  });

  new DualAlbFargateService(stack, 'Service', {
    spot: true, // FARGATE_SPOT only cluster
    tasks: [
      {
        task: orderTask,
        desiredCount: 2,
        internal: { port: 80 },
        external: { port: 80 },
        // customize the service autoscaling policy
        scalingPolicy: {
          maxCapacity: 20,
          requestPerTarget: 1000,
          targetCpuUtilization: 50,
        },
      },
      { task: customerTask, desiredCount: 2, internal: { port: 8080 } },
      { task: productTask, desiredCount: 2, internal: { port: 9090 } },
    ],
    route53Ops: {
      zoneName, // svc.local
      externalElbRecordName: externalAlbRecordName, // external.svc.local
      internalElbRecordName: internalAlbRecordName, // internal.svc.local
    },
  });
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});

test('DualAlbFargateService - minimal setup both internal and external ALB', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      { task, internal: { port: 80 }, external: { port: 80 } },
    ],
  });

  // THEN
  // We should have two ALBs
  // the external one
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internet-facing',
    Type: 'application',
  });
  // the internal one
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internal',
    Type: 'application',
  });
  // We should have fargate service
  expect(stack).toHaveResourceLike('AWS::ECS::Service', {
    Properties: {
      LaunchType: 'FARGATE',
    },
    DependsOn: [
      'ServiceCluster2E988025',
      'ServiceCluster572F72F1',
      'ServiceExtAlbListener80CF2B8C01',
      'ServiceIntAlbListener80DD49BDE2',
    ],
  }, ResourcePart.CompleteDefinition);
});

test('DualAlbFargateService - circuit breaker enabled by default', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      { task, internal: { port: 80 }, external: { port: 80 } },
    ],
  });

  // THEN
  // We should have fargate service with circuit breaker enabled
  expect(stack).toHaveResource('AWS::ECS::Service', {
    LaunchType: 'FARGATE',
    DeploymentConfiguration: {
      DeploymentCircuitBreaker: {
        Enable: true,
        Rollback: true,
      },
      MaximumPercent: 200,
      MinimumHealthyPercent: 50,
    },
  });
});

test('DualAlbFargateService - circuit breaker disabled', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      { task, internal: { port: 80 }, external: { port: 80 } },
    ],
    circuitBreaker: false,
  });

  // THEN
  // We should have fargate service with circuit breaker enabled
  expect(stack).toHaveResource('AWS::ECS::Service', {
    LaunchType: 'FARGATE',
    DeploymentConfiguration: {
      MaximumPercent: 200,
      MinimumHealthyPercent: 50,
    },
  });
});

test('DualAlbFargateService - internal only', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [{ task, internal: { port: 80 } }],
  });

  // THEN
  // we should NOT have the external ALB
  expect(stack).not.toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internet-facing',
    Type: 'application',
  });
  // we should have the internal ALB
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internal',
    Type: 'application',
  });
  // We should have fargate service
  expect(stack).toHaveResource('AWS::ECS::Service', {
    LaunchType: 'FARGATE',
  });
});

test('DualAlbFargateService - external only', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [{ task, external: { port: 80 } }],
  });

  // THEN
  // we should NOT have the internal ALB
  expect(stack).not.toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internal',
    Type: 'application',
  });
  // we should have the external ALB
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internet-facing',
    Type: 'application',
  });
  // We should have fargate service
  expect(stack).toHaveResource('AWS::ECS::Service', {
    LaunchType: 'FARGATE',
  });
});


test('DualAlbFargateService - partial internal only', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  const task2 = new ecs.FargateTaskDefinition(stack, 'task2', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task2.addContainer('caddy', {
    image: ecs.ContainerImage.fromRegistry('caddy'),
    portMappings: [{ containerPort: 2015 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      { task, internal: { port: 80 } },
      {
        task: task2,
        internal: { port: 8080 },
        external: { port: 8080 },
      },
    ],
  });

  // THEN
  // we should still have the external ALB
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internet-facing',
    Type: 'application',
  });
  // we should have the internal ALB
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internal',
    Type: 'application',
  });
  // We should have fargate service
  expect(stack).toHaveResource('AWS::ECS::Service', {
    LaunchType: 'FARGATE',
  });
});

test('DualAlbFargateService - partial external only', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  const task2 = new ecs.FargateTaskDefinition(stack, 'task2', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task2.addContainer('caddy', {
    image: ecs.ContainerImage.fromRegistry('caddy'),
    portMappings: [{ containerPort: 2015 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      { task, external: { port: 80 } },
      { task: task2, internal: { port: 8080 }, external: { port: 8080 } },
    ],
  });

  // THEN
  // we should still have the external ALB
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internet-facing',
    Type: 'application',
  });
  // we should have the internal ALB
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internal',
    Type: 'application',
  });
  // We should have fargate service
  expect(stack).toHaveResource('AWS::ECS::Service', {
    LaunchType: 'FARGATE',
  });
});


test('DualAlbFargateService - vpc subnet select default select private subnet', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      {
        task,
        internal: { port: 80 },
      },
    ],
  });

  // THEN
  // we should still have the assgin public Ip.
  expect(stack).toHaveResource('AWS::ECS::Service', {
    NetworkConfiguration: {
      AwsvpcConfiguration: {
        AssignPublicIp: 'DISABLED',
        SecurityGroups: [
          {
            'Fn::GetAtt': [
              'ServicenginxServiceSecurityGroupD362365D',
              'GroupId',
            ],
          },
        ],
        Subnets: [
          {
            Ref: 'ServiceVpcPrivateSubnet1Subnet5DB98340',
          },
          {
            Ref: 'ServiceVpcPrivateSubnet2Subnet0A0B778B',
          },
          {
            Ref: 'ServiceVpcPrivateSubnet3SubnetFED5903C',
          },
        ],
      },
    },
  });
});


test('DualAlbFargateService - vpc subnet select test select public subnet', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      {
        task,
        internal: { port: 8080 },
        external: { port: 8080 },
      },
    ],
    vpcSubnets: {
      subnetType: ec2.SubnetType.PUBLIC,
    },
  });

  // THEN
  // we should still have the assgin public Ip.
  expect(stack).toHaveResource('AWS::ECS::Service', {
    NetworkConfiguration: {
      AwsvpcConfiguration: {
        AssignPublicIp: 'ENABLED',
        SecurityGroups: [
          {
            'Fn::GetAtt': [
              'ServicenginxServiceSecurityGroupD362365D',
              'GroupId',
            ],
          },
        ],
        Subnets: [
          {
            Ref: 'ServiceVpcPublicSubnet1Subnet7B418339',
          },
          {
            Ref: 'ServiceVpcPublicSubnet2SubnetDE1A00CE',
          },
          {
            Ref: 'ServiceVpcPublicSubnet3SubnetDDA2D85D',
          },
        ],
      },
    },
  });
});

test('Wordpress - DB inbound rules have wordpress SG', () => {
  // GIVEN
  // WHEN
  new WordPress(stack, 'WP', {
    auroraServerless: true,
    spot: true,
    enableExecuteCommand: true,
  });

  // THEN
  // we should still have the assgin public Ip.
  expect(stack).toHaveResource('AWS::EC2::SecurityGroupIngress', {
    IpProtocol: 'tcp',
    Description: {
      'Fn::Join': [
        '',
        [
          'allow ',
          {
            'Fn::GetAtt': [
              'WPALBFargateServicewordpressServiceE0F9D98E',
              'Name',
            ],
          },
          ' to connect db',
        ],
      ],
    },
    FromPort: {
      'Fn::GetAtt': [
        'WPDatabaseAuroraServerlessClusterC5D03EC9',
        'Endpoint.Port',
      ],
    },
    GroupId: {
      'Fn::GetAtt': [
        'WPDatabaseAuroraServerlessClusterSecurityGroup5274AAA5',
        'GroupId',
      ],
    },
    SourceSecurityGroupId: {
      'Fn::GetAtt': [
        'WPALBFargateServicewordpressServiceSecurityGroupEC88C795',
        'GroupId',
      ],
    },
    ToPort: {
      'Fn::GetAtt': [
        'WPDatabaseAuroraServerlessClusterC5D03EC9',
        'Endpoint.Port',
      ],
    },
  });
});

test('Wordpress - EFS inbound rules have Fargate Service SG', () => {
  // GIVEN
  // WHEN
  new WordPress(stack, 'WP', {
    auroraServerless: true,
    spot: true,
    enableExecuteCommand: true,
  });

  // THEN
  // we should still have the assgin public Ip.
  expect(stack).toHaveResource('AWS::EC2::SecurityGroupIngress', {
    IpProtocol: 'tcp',
    Description: 'allow wordpress to connect efs',
    FromPort: 2049,
    GroupId: {
      'Fn::GetAtt': [
        'WPFileSystemEfsSecurityGroup70359E17',
        'GroupId',
      ],
    },
    SourceSecurityGroupId: {
      'Fn::GetAtt': [
        'WPALBFargateServicewordpressServiceSecurityGroupEC88C795',
        'GroupId',
      ],
    },
    ToPort: 2049,
  });
});

test('fargate spot termination handler - 100% spot', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    spot: true,
    tasks: [
      { task, internal: { port: 80 }, external: { port: 80 } },
    ],
  });

  // THEN
  // we should have lambda function as the termination handler
  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Code: {
      ImageUri: {
        'Fn::Join': [
          '',
          [
            '123456789012.dkr.ecr.us-east-1.',
            {
              Ref: 'AWS::URLSuffix',
            },
            '/aws-cdk/assets:006165fc78a55a416da8fcf74ff0c2d8600a714bb1d473455df51611a8b26e45',
          ],
        ],
      },
    },
    Role: {
      'Fn::GetAtt': [
        'ServiceSpotTermHandlerServiceRole0421F335',
        'Arn',
      ],
    },
    PackageType: 'Image',
    Timeout: 20,
  });
  // we should have an events rule
  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'source': [
        'aws.ecs',
      ],
      'detail-type': [
        'ECS Task State Change',
      ],
      'detail': {
        clusterArn: [
          {
            'Fn::GetAtt': [
              'ServiceCluster572F72F1',
              'Arn',
            ],
          },
        ],
      },
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': [
            'ServiceSpotTermHandlerE0C58E4E',
            'Arn',
          ],
        },
        Id: 'Target0',
      },
    ],
  });
});


test('fargate spot termination handler - partial spot', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualAlbFargateService(stack, 'Service', {
    tasks: [
      {
        task,
        internal: { port: 80 },
        external: { port: 80 },
        capacityProviderStrategy: [
          {
            capacityProvider: 'FARGATE',
            base: 1,
            weight: 1,
          },
          {
            capacityProvider: 'FARGATE_SPOT',
            base: 0,
            weight: 3,
          },
        ],
      },
    ],
  });

  // THEN
  // we should have lambda function as the termination handler
  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Code: {
      ImageUri: {
        'Fn::Join': [
          '',
          [
            '123456789012.dkr.ecr.us-east-1.',
            {
              Ref: 'AWS::URLSuffix',
            },
            '/aws-cdk/assets:006165fc78a55a416da8fcf74ff0c2d8600a714bb1d473455df51611a8b26e45',
          ],
        ],
      },
    },
    Role: {
      'Fn::GetAtt': [
        'ServiceSpotTermHandlerServiceRole0421F335',
        'Arn',
      ],
    },
    PackageType: 'Image',
    Timeout: 20,
  });
  // we should have an events rule
  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'source': [
        'aws.ecs',
      ],
      'detail-type': [
        'ECS Task State Change',
      ],
      'detail': {
        clusterArn: [
          {
            'Fn::GetAtt': [
              'ServiceCluster572F72F1',
              'Arn',
            ],
          },
        ],
      },
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': [
            'ServiceSpotTermHandlerE0C58E4E',
            'Arn',
          ],
        },
        Id: 'Target0',
      },
    ],
  });
});

test('Snapshot - DualNlbFargateService', () => {
  const orderTask = new ecs.FargateTaskDefinition(stack, 'orderTask', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  const zoneName = 'svc.local';
  const internalElbRecordName = 'internal';
  const externalElbRecordName = 'external';
  const internalELBEndpoint = `http://${internalElbRecordName}.${zoneName}`;

  orderTask.addContainer('order', {
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/golang/OrderService')),
    portMappings: [
      { containerPort: 8080 },
    ],
    environment: {
      PRODUCT_SVC_URL: `${internalELBEndpoint}:9090`,
      CUSTOMER_SVC_URL: `${internalELBEndpoint}:8080`,
      serviceName: 'order',
      versionNum: '1.0',
    },
  });

  const customerTask = new ecs.FargateTaskDefinition(stack, 'customerTask', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  customerTask.addContainer('customer', {
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/golang/CommonService')),
    portMappings: [
      { containerPort: 8080 },
    ],
    environment: {
      PRODUCT_SVC_URL: `${internalELBEndpoint}:9090`,
      CUSTOMER_SVC_URL: `${internalELBEndpoint}:8080`,
      serviceName: 'customer',
      versionNum: '1.0',
    },
  });

  const productTask = new ecs.FargateTaskDefinition(stack, 'productTask', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  productTask.addContainer('product', {
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/golang/CommonService')),
    portMappings: [
      { containerPort: 8080 },
    ],
    environment: {
      PRODUCT_SVC_URL: `${internalELBEndpoint}:9090`,
      CUSTOMER_SVC_URL: `${internalELBEndpoint}:8080`,
      serviceName: 'product',
      versionNum: '1.0',
    },
  });

  new DualNlbFargateService(stack, 'Service', {
    spot: true, // FARGATE_SPOT only cluster
    tasks: [
      {
        task: orderTask,
        desiredCount: 2,
        internal: { port: 80 },
        external: { port: 80 },
        // customize the service autoscaling policy
        scalingPolicy: {
          maxCapacity: 20,
          requestPerTarget: 1000,
          targetCpuUtilization: 50,
        },
      },
      { task: customerTask, desiredCount: 2, internal: { port: 8080 } },
      { task: productTask, desiredCount: 2, internal: { port: 9090 } },
    ],
    route53Ops: {
      zoneName, // svc.local
      externalElbRecordName: externalElbRecordName, // external.svc.local
      internalElbRecordName: internalElbRecordName, // internal.svc.local
    },
  });
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});

test('DualNlbFargateService - minimal setup both internal and external NLB', () => {
  // GIVEN
  // WHEN
  const task = new ecs.FargateTaskDefinition(stack, 'task', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  task.addContainer('nginx', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });

  new DualNlbFargateService(stack, 'Service', {
    tasks: [
      { task, internal: { port: 80 }, external: { port: 80 } },
    ],
  });

  // THEN
  // We should have two NLBs
  // the external one
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internet-facing',
    Type: 'network',
  });
  // the internal one
  expect(stack).toHaveResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Scheme: 'internal',
    Type: 'network',
  });
  // We should have fargate service
  expect(stack).toHaveResourceLike('AWS::ECS::Service', {
    Properties: {
      LaunchType: 'FARGATE',
    },
    DependsOn: [
      'ServiceCluster2E988025',
      'ServiceCluster572F72F1',
      'ServiceExtNlbListener80208FFCE9',
      'ServiceIntNlbListener8090EABD03',
    ],
  }, ResourcePart.CompleteDefinition);
});
