---
title: AWS CDK 
weight: 2
---

The [AWS Cloud Development Kit (AWS CDK)](https://aws.amazon.com/cdk/) is an open source software development framework that allows you to define your cloud application resources using familiar programming languages.


Install the AWS CDK CLI globally in your local environment.

```sh
npm install -g aws-cdk
```

Run the following command to verify correct installation and print the version number of the AWS CDK.

```sh
cdk --version
```

Bootstrap your environment with the AWS CDK Toolkit.

```sh
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

The following examples illustrate bootstrapping an environment in **us-east-1**.

```sh
cdk bootstrap aws://123456789012/us-east-1
```

{{% notice note %}}

If you don't have your AWS account number handy, you can get it from the AWS Management Console. Or, if you have the AWS CLI installed, the following command displays your default account information, including the account number. 

{{% /notice %}} 

```sh
aws sts get-caller-identity
```

To display the default region, use aws configure get. 

{{% notice note %}}

To display the default region, use aws configure get. 

{{% /notice %}} 

```sh
aws configure get region
```

See [Getting Started with the AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) for more details.
