package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var version = "v1.0.3"
var env = "dev"

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

type Commit struct {
	Sha string `json:"sha"`
}

type RepoTag struct {
	Name   string `json:"name"`
	NodeId string `json:"node_id"`
	Commit struct {
		Sha string `json:"sha"`
	}
}

type Version struct {
	Version        string
	IsLatest       bool
	CurrentVersion string
	Env            string
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func LoadEnvironment() {
	godotenv.Load(".env")

	version = os.Getenv("VERSION")
	version = strings.Replace(version, "v", "", -1)
}

func (a *App) GetVersionInfo() Version {
	LoadEnvironment()

	res, err := http.Get("https://api.github.com/repos/anpato/datalogger-desktop/tags")
	if err != nil {
		fmt.Printf("Error retrieving version info: %s", err)
	}
	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)

	var result []RepoTag
	if err := json.Unmarshal(body, &result); err != nil {
		fmt.Println("Could not unmarshal body", err)
	}

	isCurrent := RankTags(result, version)

	versionInfo := Version{
		IsLatest:       isCurrent,
		CurrentVersion: version,
		Env:            env,
	}
	return versionInfo
}

func RankTags(tags []RepoTag, currentVersion string) bool {
	var isCurrent bool = false
	var versions []string
	for _, tag := range tags {

		versions = append(versions, strings.Replace(tag.Name, "v", "", -1))
	}

	if len(versions) > 0 && versions[0] == currentVersion {
		isCurrent = true
	} else if len(versions) == 0 {
		isCurrent = true
	}

	return isCurrent
}
