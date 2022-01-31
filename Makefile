.PHONY: help backup build clean shell start
.DEFAULT_GOAL := help

CURRDIR := $(shell pwd)
WORKDIR := /workspaces/$(notdir $(CURRDIR))
DOCKER_IMAGE := typescript-node

help:
	@awk 'BEGIN {FS = ":.*#"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\n"} /^[a-zA-Z0-9_-]+:.*?#/ { printf "  \033[36m%-27s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST); printf "\n"

backup: ## Backup codebase (*_YYYYMMDD_HHMM.tar.gz)
backup: archive=`pwd`_`date +'%Y%m%d_%H%M'`.tar.gz
backup:
	@tar -czf $(archive) --exclude=node_modules --exclude=public/dist *
	@ls -l `pwd`*.tar.gz

build: ## Build
	gulp dist

clean: ## Clean
	@rm -fR public/dist
	@rm -fR public/test
	@rm -fR public/temp

shell: ## Login into docker developer container
	docker build .devcontainer -t $(DOCKER_IMAGE)
	docker run -it --rm -v $(CURRDIR):$(WORKDIR) -w $(WORKDIR) $(DOCKER_IMAGE) bash

start: ## Start the server
	npm start
