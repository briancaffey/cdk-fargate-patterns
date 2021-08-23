---
title: From code assets
weight: 4
---

Now we know how to deploy existing container images from the pulic registries. However, as a developer, we tend build, test and run our development locally and, if everything is working great, deploy it straight from our IDE to the AWS environment.

In this chapter, we will build a simple Golang app locally, make sure it works in our local environment and then just deploy it to AWS Fargate.

In `serverless-container-demo` directory, create the `src/service` directory.

```sh
# in serverless-container-demo
mkdir -p src/service
cd $_
```

Download the code assets into the `service` directory.

```sh
curl https://raw.githubusercontent.com/pahud/cdk-fargate-patterns/main/services/golang/gorilla-mux/{main.go,go.sum,go.mod,Dockerfile} -o "#1"
```

Build the docker image locally.

```sh
docker build -t gorilla-demo .
```

Bring up the conainer locally and listen on `localhost:8080`.

```sh
docker run -p 8080:8080 gorilla-demo
```

Open a seperate terminal in VSCode and test it with curl.

```sh
curl localhost:8080
```

And you should see the output.

```json
{"serviceName":"mux","versionNum":"1.0"}
```

Go back to previous terminal and terminate the running docker container with `Ctrl-c`.

Now the code should be working in our local environment, let's deploy it.

edit `lib/serverless-container-demo-stack.ts`. 

```ts
import * as cdk from '@aws-cdk/core';
import { DualAlbFargateService } from 'cdk-fargate-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as path from 'path';

export class ServerlessContainerDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const mytask = new ecs.FargateTaskDefinition(this, 'Task', {
      cpu: 256,
      memoryLimitMiB: 512
    })
    mytask.addContainer('nyancat', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../src/service')),
      portMappings: [
        {
          containerPort: 8080,
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

{{% notice note %}}

We just modified the `image` property by specifying the path to the code assets and update the container port from `80` to `8080`.

{{% /notice %}} 



Go to `serverless-container-demo` directory and run:


```sh
# see the changes first.
npx cdk diff 
# deploy it
npx cdk deploy
```

On deploy completed, click the URL returned and you should see exactly the same response.

Make sure you reload the page.

```json
{"serviceName":"mux","versionNum":"1.0"}
```
