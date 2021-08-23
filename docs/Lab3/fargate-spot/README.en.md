---
title: Fargate Spot
weight: 3
---

**AWS Fargate Spot** allows you to save your Fargate cost up to 70% off. To enable the Faragate Spot globally for all tasks, use `spot: true`. This is ideal and recommended for testing and staging environment as it provides exactly the same performace with Fargate with huge cost saving.


```ts
new DualAlbFargateService(stack, 'ALBService', {
  spot: true, 
  ...
}
```

However, you are allowed to mix Faragate and **Fargate Spot** with the `capacityProviderStrategy` property. In the following sample, **Fargate Spot** is the global capacity provider strategy yet we allow the `Customer` service to mix **Fargate** and **Fargate Spot** to ensure the baseline of the ondemand capacity. 

See [AWS Faragate Capacity Providers](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html) for more details.

```ts
new DualAlbFargateService(stack, 'ALBService', {
  spot: true, // FARGATE_SPOT only cluster
  tasks: [
    {
      task: orderTask,
      desiredCount: 2,
      internal: { port: 80 },
      external: { port: 443, certificate: [cert] },
    },
    {
      task: customerTask,
      desiredCount: 1,
      internal: { port: 8080 },
      // customize the fargate capacity provider strategy for this service
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
    {
      task: productTask,
      desiredCount: 1,
      internal: { port: 9090 },
    },
  ],
});
```
