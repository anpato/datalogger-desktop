package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/adrg/xdg"
)

// Bump this on release
var version = "v1.0.1"

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

func (a *App) GetVersionInfo() Version {

	version = strings.Replace(version, "v", "", -1)
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
	}
	return versionInfo
}

func RankTags(tags []RepoTag, sha string) bool {
	var isCurrent bool = false
	var versions []string

	for _, tag := range tags {
		versions = append(versions, strings.Replace(tag.Name, "v", "", -1))
	}

	if len(versions) > 0 && versions[0] == version {
		isCurrent = true
	} else if len(versions) == 0 {
		isCurrent = true
	}

	return isCurrent
}

func ConstructFileGet() string {

	storageDirectory := fmt.Sprintf("%s/datalogger/config.json", xdg.UserDirs.Documents)

	configFile, err := xdg.ConfigFile(storageDirectory)
	if err != nil {
		fmt.Println("Failed to get config file", err)
	}

	return configFile
}

func GetFile(filename string) string {

	b, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Println("Failed to load config file")
	}
	var result = string(b)

	return result
}

func (a *App) StoreResult(data map[string]interface{}) {

	configFile := ConstructFileGet()
	jsonString, _ := json.Marshal(data)
	ioutil.WriteFile(configFile, jsonString, os.ModePerm)
}

// Returns stringified json values stored for user
func (a *App) GetResult() string {

	configFile := ConstructFileGet()
	fileData := GetFile(configFile)

	return fileData
}
