import '@aws-cdk/assert/jest';
import * as path from 'path';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService } from '../src/index';

// match snapshot
test('Snapshot', () => {
  const app = new cdk.App();

  const env = {
    region: 'us-east-1',
    account: '123456789012',
  };

  const stack = new cdk.Stack(app, 'demo-stack', { env });

  const orderTask = new ecs.FargateTaskDefinition(stack, 'orderTask', {
    cpu: 256,
    memoryLimitMiB: 512,
  });

  const zoneName = 'svc.local';
  const internalAlbRecordName = 'internal';
  const externalAlbRecordName = 'external';
  const internalALBEndpoint = `http://${internalAlbRecordName}.${zoneName}`;

  orderTask.addContainer('order', {
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/OrderService')),
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
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/CommonService')),
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
    image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/CommonService')),
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
        listenerPort: 80,
        task: orderTask,
        desiredCount: 2,
        // customize the service autoscaling policy
        scalingPolicy: {
          maxCapacity: 20,
          requestPerTarget: 1000,
          targetCpuUtilization: 50,
        },
      },
      { listenerPort: 8080, task: customerTask, desiredCount: 2 },
      { listenerPort: 9090, task: productTask, desiredCount: 2 },
    ],
    route53Ops: {
      zoneName, // svc.local
      externalAlbRecordName, // external.svc.local
      internalAlbRecordName, // internal.svc.local
    },
  });
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});

test('DualAlbFargateService - minimal setup', () => {
  // GIVEN
  const app = new cdk.App();

  const env = {
    region: 'us-east-1',
    account: '123456789012',
  };

  const stack = new cdk.Stack(app, 'demo-stack', { env });

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
    tasks: [{ listenerPort: 80, task }],
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
  expect(stack).toHaveResource('AWS::ECS::Service', {
    LaunchType: 'FARGATE',
  });
});
