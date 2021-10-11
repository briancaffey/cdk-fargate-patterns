---
title: Shared ALB Listener
weight: 4
---

Services running with shared ALB listener is a common pattern for modern application with multiple services. You are allowed to customize the **ALB Listener Rules** for name-based routing or path-based routing policies with single ALB listener.

In the sample below, we run the `Order`, `Product` and `Customer` services sharing a single HTTPS listener with different host names.

See [Listener rules for your Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-update-rules.html) for more details.


```ts
new DualAlbFargateService(stack, 'ALBService', {
  spot: true, // FARGATE_SPOT only cluster
  enableExecuteCommand: true,
  tasks: [
    {
      task: orderTask,
      desiredCount: 2,
      internal: { port: 80 },
      external: {
        port: 443,
        certificate: [cert],
        forwardConditions: [[elbv2.ListenerCondition.hostHeaders(['order.example.com'])]],
      }
    },
    {
      task: customerTask,
      desiredCount: 1,
      external: {
        port: 443,
        certificate: [cert],
        forwardConditions: [[elbv2.ListenerCondition.hostHeaders(['customer.example.com'])]],
      },
      internal: { port: 8080 },
    },
    {
      task: productTask,
      desiredCount: 1,
      external: {
        port: 443,
        certificate: [cert],
        forwardConditions: [[elbv2.ListenerCondition.hostHeaders(['product.example.com'])]],
      },
      internal: { port: 9090 },
    },
  ],
});
```
