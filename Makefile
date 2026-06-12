.PHONY: dev build local-k8s clean

dev: ## Run the Astro dev server
	cd site && npm run dev

build: ## Install deps and build the static site
	cd site && npm ci && npm run build

local-k8s: ## Build the image and deploy to a local kind cluster via Helm
	kind create cluster --name hayden-portfolio || true
	docker build -t hayden-portfolio:local -f infra/Dockerfile .
	kind load docker-image hayden-portfolio:local --name hayden-portfolio
	helm upgrade --install hayden-portfolio infra/helm \
		--set image.repository=hayden-portfolio \
		--set image.tag=local \
		--set image.pullPolicy=Never

clean: ## Tear down the local cluster
	kind delete cluster --name hayden-portfolio || true