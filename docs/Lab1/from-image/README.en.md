---
title: From container image
weight: 2
---

Let's deploy a service running the [Nyan Cat animation](https://youtu.be/QH2-TGUlwu4). We will use the public container image at

```
public.ecr.aws/pahudnet/nyancat-docker-image:latest
```

edit `lib/serverless-container-demo-stack.ts`

```ts
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService } from 'cdk-fargate-patterns';
import * as ecs from '@aws-cdk/aws-ecs';

export class ServerlessContainerDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const mytask = new ecs.FargateTaskDefinition(this, 'Task', {
      cpu: 256,
      memoryLimitMiB: 512
    })
    mytask.addContainer('nyancat', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/pahudnet/nyancat-docker-image:latest'),
      portMappings: [
        {
          containerPort: 80,
        }
      ]
    })

    new DualAlbFargateService(this, 'NyanCatService', {
      tasks: [
        {
          task: mytask,
          external: { port: 80 }
        }
      ],
      route53Ops: {
        enableLoadBalancerAlias: false,
      }
    })
  }
}
```

Run `npx cdk diff` to see the changes.

```sh
npx cdk diff
```

Run `npx cdk deploy` to deploy.

```sh
npx cdk deploy
```

On deploy completed, click the URL in the **Outputs** like

```
Outputs:
ServerlessContainerDemoStack.NyanCatServiceExternalEndpoint0F7E5BAB = http://Serve-NyanC-12T2Y6PNZS60G-50811448.ap-northeast-1.elb.amazonaws.com
```

The **Nycan Cat** is running. Behind the scene, a serverless container service running with **AWS Fargate** was deployed with the **ALB(Application Load Balancer)**.

![Nyan Cat](/images/nyancat.png)

Now let's go to the next section. We will deploy the code assets from the development environment all the way to AWS Fargate.
