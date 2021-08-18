---
title: Initialize the Project
weight: 1
---

Open VSCode with the built-in terminal. Let's create and initialize a new project.

```sh
mkdir serverless-container-demo
cd $_
```

Open current directory in the workspace with the `code` command.

```sh
code -a .
```

{{% notice note %}}

If you don't have the **code** command in yoru PATH, you can [install it from VSCode command palette](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line).

{{% /notice %}} 


Initialize the CDK application.

```sh
# in the serverless-container-demo directory
cdk init -l typescript
```

Install the **cdk-fargate-patterns** construct library.

```sh
npm install cdk-fargate-patterns
```

Install `@aws-cdk/aws-ec2` and `@aws-cdk/aws-ecs` construct libraries.

```sh
npm i @aws-cdk/aws-{ec2,ecs}
```

Open the `lib/serverless-cpontainer-demo-stack.ts` in the left panel.

![Initialize](/images/init-ok.png)

Now we are ready to deploy our first serverless container application.
