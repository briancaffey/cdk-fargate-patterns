---
title: Service Autoscaling
weight: 1
---

By default, all services deployed with `DualAlbFargateService` or `DualNlbFargateService` have a build-in service autoscaling policy with the target tracking on **CPU Utilization** and **Request Concurrency**. The default target CPU utilization for each service is `50` and number of requests per target is `1000`. However, you are allowed to define custom policy for each services.

In the following sample, we define a custom service autoscaling policy for the `orderTask` and allow the service to scale from `2` to `20` with custom `requestPerTarget` and `targetCpuUtilization` values.

```ts
new DualAlbFargateService(stack, 'Service', {
  tasks: [
    {
      task: orderTask,
      desiredCount: 2,
      external: { port: 443, certificate },
      internal: { port: 80 },
      // customize the service autoscaling policy
      scalingPolicy: {
        maxCapacity: 20,
        requestPerTarget: 1500,
        targetCpuUtilization: 80,
      },
    },
    { task: customerTask, desiredCount: 2, internal: { port: 8080 } },
    { task: productTask, desiredCount: 2, internal: { port: 9090 } },
  ],
  ...
});

```

See [Target tracking scaling policies](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-autoscaling-targettracking.html) from Amazon ECS Developer Guide for more details.
