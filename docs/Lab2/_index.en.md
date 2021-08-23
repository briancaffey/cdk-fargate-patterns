---
title: Lab 2 - multiple container services
weight: 40
---

Now we are going to deploy **3 services** in a single deployment with all the services inter-communicate internally. Considering the following architecture diagram. The `Order` service listening on the external ALB receives requests from client, sending requests asynchonously to `Product` and `Customer` services internally, aggregating the responses and return to the client.

![](/images/DualAlbFargateService.svg)


- [Prepare the code](./prepare-the-code/readme)
- [Local testing](./local-testing/readme)
- [Deploy it](./deploy/readme)

