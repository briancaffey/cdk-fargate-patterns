---
title: Deploy
weight: 3
---

Now let's describe our deployment for the three services with AWS CDK.


edit `lib/serverless-container-demo-stack.ts`. 

```ts
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService } from 'cdk-fargate-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as path from 'path';

export class ServerlessContainerDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zoneName = `${this.stackName}.local`;
    const internalAlbRecordName = 'internal';
    const internalALBEndpoint = `http://${internalAlbRecordName}.${zoneName}`;

    // prepare the task for the Order service
    const orderTask = new ecs.FargateTaskDefinition(this, 'orderTask', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

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

    // customer service
    const customerTask = new ecs.FargateTaskDefinition(this, 'customerTask', {
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

    // product service
    const productTask = new ecs.FargateTaskDefinition(this, 'productTask', {
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

    new DualAlbFargateService(this, 'ALBService', {
      spot: true, // FARGATE_SPOT only cluster
      enableExecuteCommand: true,
      tasks: [
        // The order service with both external/internal access
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
  }
}
```


Login the ecr-public first as we will pull public images from ECR Public. Make sure the region is always `us-east-1`.

```sh
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
```

Deploy it now.

```sh
npx cdk diff
npx cdk deploy
```

Click the `ExternalEndpoint` from the `Outputs` and you should see exactly the same response like:


```json
{"service":"order", "version":"1.0"}
{"service":"customer","version":"1.0"}
{"service":"product","version":"1.0"}
```

Now we've successfully deployed our microservices from local IDE to AWS Fargate.
