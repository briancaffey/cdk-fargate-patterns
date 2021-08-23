---
title: Prepare the code
weight: 1
---

Now we are going to deploy **3 services** in a single deployment with all the services inter-communicate internally. Considering the following architecture diagram. The `Order` service listening on the external ALB receives requests from client, sending requests asynchonously to `Product` and `Customer` services internally, aggregating the responses and return to the client.

![](/images/DualAlbFargateService.svg)


Let's delete everything under the `services` directory and download our application.

```sh
# in serverless-container-demo directory
# delete everything under services/
rm -rf services/*
curl -L -o sample.zip https://github.com/pahud/cdk-fargate-patterns/archive/refs/heads/main.zip
unzip sample.zip
mv cdk-fargate-patterns-main/services/golang services
rm -rf cdk-fargate-patterns-main
```
