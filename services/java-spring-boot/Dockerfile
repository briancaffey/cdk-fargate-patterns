FROM maven:3.6.3-jdk-11 AS builder
WORKDIR /usr/src
COPY . .
RUN mvn package -Dmaven.test.skip=true

FROM adoptopenjdk/openjdk11:x86_64-alpine-jdk-11.0.10_9
RUN rm -f /etc/localtime; ln -s /usr/share/zoneinfo/Asia/Taipei /etc/localtime
RUN apk --update add fontconfig ttf-dejavu
ENV JAVA_TOOL_OPTIONS=''
COPY --from=builder /usr/src/target/demo-spring-boot-0.0.1-SNAPSHOT.jar /demo-spring-boot-0.0.1-SNAPSHOT.jar
ARG BUILD_TAG='xxx'
ENV BUILD_TAG=$BUILD_TAG

EXPOSE 8080
ENTRYPOINT java ${JAVA_TOOL_OPTIONS} -Djava.security.egd=file:/dev/./urandom -Djava.awt.headless=true -jar /demo-spring-boot-0.0.1-SNAPSHOT.jar