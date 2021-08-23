---
title: Local testing
weight: 2
---

Now our code assets are ready at `services/golang`, we should test it locally to before we deploy it onto AWS.

Create a `docker-compose.yml` unser the `services` directory:

```yaml
version: '3'

networks:
  default:

services:
  golang-order:
    build:
      context: ./golang/OrderService
      dockerfile: Dockerfile
    container_name: order
    ports:
      - 80:8080
    environment: 
      - PRODUCT_SVC_URL=http://golang-product:8080
      - CUSTOMER_SVC_URL=http://golang-customer:8080
      - serviceName=order
      - versionNum=1.0
    networks:
      - default
  golang-customer:
    build:
      context: ./golang/CommonService
      dockerfile: Dockerfile
    container_name: customer
    ports:
      - 8080:8080
    environment: 
      - PRODUCT_SVC_URL=http://golang-product:8080
      - CUSTOMER_SVC_URL=http://golang-customer:8080
      - serviceName=customer
      - versionNum=1.0
    networks:
      - default
  golang-product:
    build:
      context: ./golang/CommonService
      dockerfile: Dockerfile
    container_name: product
    ports:
      - 9090:8080
    environment: 
      - PRODUCT_SVC_URL=http://golang-product:8080
      - CUSTOMER_SVC_URL=http://golang-customer:8080
      - serviceName=product
      - versionNum=1.0
    networks:
      - default

  ```

Now bring up all the services locally with `docker compose up`:

```sh
cd services
docker compose up
```

Open another terminal from VSCode

```sh
curl http://localhost:80
```

Response

```json
{"service":"order", "version":"1.0"}
{"service":"customer","version":"1.0"}
{"service":"product","version":"1.0"}
```

Go back to the previous terminal and terminate it with `Ctrl-c`.

OK the application with `Order`, `Product` and `Customer` services are working great in our local environment with docker. Let's deploy it to AWS in the next chapter.
