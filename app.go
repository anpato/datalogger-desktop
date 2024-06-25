package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"runtime/debug"
)

var version = ""

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
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetVersionInfo() Version {
	if info, ok := debug.ReadBuildInfo(); ok {
		for _, setting := range info.Settings {
			if setting.Key == "vcs.revision" {
				version = setting.Value
			}
		}
	}

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

	var versionInfo Version

	if len(result) > 0 {
		versionInfo.CurrentVersion = version
		versionInfo.IsLatest = result[0].Commit.Sha == version
		versionInfo.Version = result[0].Commit.Sha

	} else {
		versionInfo.CurrentVersion = version
		versionInfo.IsLatest = true
		versionInfo.Version = version
	}

	return versionInfo
}
