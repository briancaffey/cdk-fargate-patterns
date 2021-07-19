import * as path from 'path';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService, DualNlbFargateService } from './index';

const app = new cdk.App();

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const stack = new cdk.Stack(app, 'demo-stack-tiny', { env });

const zoneName = `${stack.stackName}.local`;
const internalAlbRecordName = 'internal';
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

const certArn = stack.node.tryGetContext('ACM_CERT_ARN');
const cert = certArn ? acm.Certificate.fromCertificateArn(stack, 'Cert', certArn) : undefined;

new DualAlbFargateService(stack, 'ALBService', {
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
  ],
  route53Ops: {
    zoneName,
  },
});

const nlbService = new DualNlbFargateService(stack, 'NLBService', {
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
  ],
  route53Ops: {
    zoneName: `${stack.stackName}-nlb.local`,
  },
});


// we need this to allow ingress traffic from public internet only for the order service
nlbService.service[0].connections.allowFromAnyIpv4(ec2.Port.tcp(8080));
// allow from VPC
nlbService.service.forEach(s => {
  s.connections.allowFrom(ec2.Peer.ipv4(nlbService.vpc.vpcCidrBlock), ec2.Port.tcp(8080));
});
