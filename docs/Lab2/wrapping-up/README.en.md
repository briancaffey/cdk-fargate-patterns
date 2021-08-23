---
title: Wrapping up
weight: 4
---

Congratulations! Now we've learned how to develop and test multiple microservices locally and deploy all of them to AWS Fargate in a single deployment straight from our IDE.

With this pattern, you are allowed to deploy any of your applications or services from your IDE. You don't have to define your infrastructure, instead, the `DualAlbFargateService` automatically provision required infrastructure as well as IAM policies, security groups as well as external and internal load balancers to bring up your services immediately.

