---
title: HTTPS with ACM Certificate
weight: 2
---

To expost HTTPS only listener with existing ACM certificate:


```ts

const cert = acm.Certificate.fromCertificateArn(stack, 'ExistingCert', EXISTING_CERT_ARN);

new DualAlbFargateService(stack, 'ALBService', {
  enableExecuteCommand: true,
  tasks: [
    {
      task: orderTask,
      desiredCount: 2,
      // expose the service externally with HTTPS
      external: { port: 443, certificate: [cert] }
    },
  ],
  ...
}
```
