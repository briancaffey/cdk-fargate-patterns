import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService } from './index';


const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
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

const nginxTask = new ecs.FargateTaskDefinition(stack, 'nginxTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

nginxTask.addContainer('nginx', {
  image: ecs.ContainerImage.fromRegistry('nginx:latest'),
  portMappings: [
    { containerPort: 80 },
  ],
});

const svc = new DualAlbFargateService(stack, 'Service', {
  spot: true, // FARGATE_SPOT only cluster
  enableExecuteCommand: true,
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
    {
      listenerPort: 8080,
      task: customerTask,
      desiredCount: 10,
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
    { listenerPort: 9090, task: productTask, desiredCount: 2 },
    { listenerPort: 9091, task: nginxTask, desiredCount: 1 },
  ],
  route53Ops: {
    zoneName, // svc.local
    externalAlbRecordName, // external.svc.local
    internalAlbRecordName, // internal.svc.local
  },
});


// create a dummy sg
const dummySg = new ec2.SecurityGroup(stack, 'DummySG', {
  vpc: svc.vpc,
});

// allow all traffic from dummy sg to all the services
for (let i =0; i < svc.service.length; i++) {
  svc.service[i].connections.allowFrom(dummySg, ec2.Port.allTraffic());
}
