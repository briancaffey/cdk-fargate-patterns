package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

const (
	DEFAULT_SERVICE_NAME string = "mux"
	DEFAULT_VERSION      string = "1.0"
)

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/", HomeHandler)
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", r))
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	serviceName := getEnvOrDefault("serviceName", DEFAULT_SERVICE_NAME)
	versionNum := getEnvOrDefault("versionNum", DEFAULT_VERSION)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"serviceName": serviceName, "versionNum": versionNum})
}

func getEnvOrDefault(e string, d string) string {
	if v, ok := os.LookupEnv(e); ok {
		return v
	}
	return d
}
