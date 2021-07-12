import * as path from 'path';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService } from './index';

const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const stack = new cdk.Stack(app, 'demo-stack2', { env });

const zoneName = 'svc.local';
const internalAlbRecordName = 'internal';
const externalAlbRecordName = 'external';
const internalALBEndpoint = `http://${internalAlbRecordName}.${zoneName}`;

// order service
const orderTask = new ecs.FargateTaskDefinition(stack, 'orderTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

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

// customer service
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

// product service
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

// nginx service
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

// php service
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

// laravel-nginx-php-fpm service
const laravelNginxPhpFpmTask = new ecs.FargateTaskDefinition(stack, 'laravelNginxPhpFpmTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

laravelNginxPhpFpmTask.addContainer('laravel-nginx-php-fpm', {
  image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/laravel-nginx-php-fpm')),
  portMappings: [
    { containerPort: 80 },
  ],
});

// laravel-bitnami service
const laravelBitnamiTask = new ecs.FargateTaskDefinition(stack, 'laravelBitnamiTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

laravelBitnamiTask.addContainer('laravel-bitnami', {
  image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/laravel-bitnami')),
  portMappings: [
    { containerPort: 3000 },
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

// java spring boot service
const javaTask = new ecs.FargateTaskDefinition(stack, 'javaTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

javaTask.addContainer('java', {
  image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/java-spring-boot')),
  portMappings: [
    { containerPort: 8080 },
  ],
});

// apache-php service
const apachePHP = new ecs.FargateTaskDefinition(stack, 'apachephpTask', {
  cpu: 256,
  memoryLimitMiB: 512,
});

apachePHP.addContainer('apachephp', {
  image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../services/apache-php')),
  portMappings: [
    { containerPort: 80 },
  ],
});

const certArn = stack.node.tryGetContext('ACM_CERT_ARN');
const cert = certArn ? acm.Certificate.fromCertificateArn(stack, 'Cert', certArn) : undefined;

const svc = new DualAlbFargateService(stack, 'Service', {
  spot: true, // FARGATE_SPOT only cluster
  enableExecuteCommand: true,
  tasks: [
    // The order service with both external/internal access
    {
      task: orderTask,
      desiredCount: 2,
      internal: { port: 80 },
      external: cert ? { port: 443, certificate: [cert] } : { port: 80 },
      // customize the service autoscaling policy
      scalingPolicy: {
        maxCapacity: 20,
        requestPerTarget: 1000,
        targetCpuUtilization: 50,
      },
    },
    {
      // The customer service(internal only)
      task: customerTask,
      desiredCount: 1,
      internal: { port: 8080 },
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
    {
      task: productTask,
      desiredCount: 1,
      internal: { port: 9090 },
    },
    // The nginx service(external only)
    {
      task: nginxTask,
      desiredCount: 1,
      external: { port: 9091 },
    },
    // The nginx-php-fpm service(external/internal)
    {
      task: phpTask,
      desiredCount: 1,
      internal: { port: 9092 },
      external: { port: 9092 },
    },
    // The NuxtJS service(external/internal)
    {
      task: nuxtTask,
      desiredCount: 1,
      internal: { port: 9093 },
      external: { port: 9093 },
    },
    // The node service(external/internal)
    {
      task: nodeTask,
      desiredCount: 1,
      internal: { port: 9094 },
      external: { port: 9094 },
    },
    // The laravel-nginx-php-fpm service(external/internal)
    {
      task: laravelNginxPhpFpmTask,
      desiredCount: 1,
      internal: { port: 9095 },
      external: { port: 9095 },
    },
    // The laravel-bitnami service(external/internal)
    {
      task: laravelBitnamiTask,
      desiredCount: 1,
      internal: { port: 9096 },
      external: { port: 9096 },
    },
    // java spring boot service(external/internal)
    {
      task: javaTask,
      desiredCount: 1,
      internal: { port: 9097 },
      external: { port: 9097 },
      healthCheck: { path: '/hello-world' },
    },
    // apache-php(external/internal)
    {
      task: apachePHP,
      desiredCount: 1,
      internal: { port: 9098 },
      external: { port: 9098 },
    },
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
