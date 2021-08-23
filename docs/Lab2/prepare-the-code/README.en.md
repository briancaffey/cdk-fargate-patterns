---
title: Prepare the code
weight: 1
---

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
