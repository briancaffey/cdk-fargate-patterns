package main

import (
	"log"
	"net"
	"os"
	"time"

	pb "example.com/echo-server/echospec"
	context "golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var (
	serviceName string = ""
	serverPort  string = ":50051"
)

type EchoServer struct{}

func (e *EchoServer) Echo(ctx context.Context, req *pb.EchoRequest) (resp *pb.EchoReply, err error) {
	if v, ok := os.LookupEnv("AWS_EXECUTION_ENV"); ok {
		serviceName = v
	}
	log.Printf("receive client request, client send:%s\n", req.Msg)
	return &pb.EchoReply{
		Msg:      req.Msg + serviceName,
		Unixtime: time.Now().Unix(),
	}, nil

}

func main() {
	if v, ok := os.LookupEnv("SERVER_PORT"); ok {
		serverPort = ":" + v
	}
	apiListener, err := net.Listen("tcp", serverPort)
	if err != nil {
		log.Println(err)
		return
	}

	es := &EchoServer{}
	grpc := grpc.NewServer()
	pb.RegisterEchoServer(grpc, es)

	reflection.Register(grpc)
	if err := grpc.Serve(apiListener); err != nil {
		log.Fatal(" grpc.Serve Error: ", err)
		return
	}
}
