import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService } from './index';
import { LoadBalancerAccessibility } from './main';


const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const stack = new cdk.Stack(app, 'demo-stack2', { env });

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

const phpTask = new ecs.FargateTaskDefinition(stack, 'phpTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

phpTask.addContainer('php', {
  image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/nginx-php')),
  portMappings: [
    { containerPort: 80 },
  ],
});

// NuxtJS service
const nuxtTask = new ecs.FargateTaskDefinition(stack, 'nuxtTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

nuxtTask.addContainer('nuxt', {
  image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/nuxt')),
  portMappings: [
    { containerPort: 80 },
  ],
});

// Node.js service
const nodeTask = new ecs.FargateTaskDefinition(stack, 'nodeTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

nodeTask.addContainer('node', {
  image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/node')),
  portMappings: [
    { containerPort: 80 },
  ],
});

const svc = new DualAlbFargateService(stack, 'Service', {
  spot: true, // FARGATE_SPOT only cluster
  enableExecuteCommand: true,
  tasks: [
    // The order service with both external/internal access
    {
      listenerPort: 80,
      accessibility: LoadBalancerAccessibility.EXTERNAL_ONLY,
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
      // The customer service(internal only)
      accessibility: LoadBalancerAccessibility.INTERNAL_ONLY,
      listenerPort: 8080,
      task: customerTask,
      desiredCount: 1,
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
    // The produce service(internal only)
    { listenerPort: 9090, task: productTask, desiredCount: 1, accessibility: LoadBalancerAccessibility.INTERNAL_ONLY },
    // The nginx service(external only)
    { listenerPort: 9091, task: nginxTask, desiredCount: 1, accessibility: LoadBalancerAccessibility.EXTERNAL_ONLY },
    // The nginx-php-fpm service(external/internal)
    { listenerPort: 9092, task: phpTask, desiredCount: 1 },
    // The NuxtJS service(external/internal)
    { listenerPort: 9093, task: nuxtTask, desiredCount: 1 },
    // The node service(external/internal)
    { listenerPort: 9094, task: nodeTask, desiredCount: 1 },
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
for (let i = 0; i < svc.service.length; i++) {
  svc.service[i].connections.allowFrom(dummySg, ec2.Port.allTraffic());
}
