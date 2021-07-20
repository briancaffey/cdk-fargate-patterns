FROM golang:alpine AS builder

RUN apk add --no-cache make git

WORKDIR /go/src/example.com/

COPY . .

RUN GOOS=linux GOARCH=amd64 go build -o echo-server

FROM alpine

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /go/src/example.com/echo-server .

ARG AWS_EXECUTION_ENV

ARG SERVER_PORT

EXPOSE 50051

CMD ["./echo-server"]