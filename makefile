# Los pasos en este archivo pueden ser usados para su pipeline de Unit testing
# en el caso que usted decida usar Python.

.PHONY: lintfix lintcheck unittest

lintfix:
	poetry --directory="$(DIR)" install
	poetry --directory="$(DIR)" run black .
	poetry --directory="$(DIR)" run isort . --profile black
	poetry --directory="$(DIR)" run bandit -c pyproject.toml -r .
	poetry --directory="$(DIR)" run ruff check --fix

lintcheck:
	poetry --directory="$(DIR)" install
	poetry --directory="$(DIR)" run black --check .
	poetry --directory="$(DIR)" run isort --check . --profile black
	poetry --directory="$(DIR)" run bandit -c pyproject.toml -r .
	poetry --directory="$(DIR)" run ruff check

unittest:
	poetry --directory="$(DIR)" install
	poetry --directory="$(DIR)" run pytest --cov=src -v -s --cov-fail-under=70 --cov-report term-missing

# Agregue nuevas a partir de esta línea

CURDIR ?= $(shell pwd)

docsbuild:
	docker run --rm -e PLANTUML_LIMIT_SIZE=8192 -v "./docs/diagrams:/workspace" -w /workspace plantuml/plantuml **.puml

dklogin:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com"

s3back:
	aws s3api create-bucket --bucket terraform-dann-nfortiz --region us-east-1 --debug

dkimage:
	docker build --rm --platform linux/amd64 --no-cache -t "${APP}-app:latest" -f "./apps_nube/${APP}_app/Dockerfile" "./apps_nube/${APP}_app/"

buildimages:
	make dkimage APP=users
	make dkimage APP=offers
	docker build --rm --platform linux/amd64 -t routes-app:latest -f "./apps_nube/routes_service/Dockerfile" "./apps_nube/routes_service/"
	make dkimage APP=posts
	make dkimage APP=scores
	make dkimage APP=rf

dkpush:
	docker tag "${APP}-app:latest" "${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/${APP}-app:latest"
	docker push "${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/${APP}-app:latest"

pushimages:
	make dkpush APP=users ACCOUNT_ID=${ACCOUNT_ID}
	make dkpush APP=offers ACCOUNT_ID=${ACCOUNT_ID}
	make dkpush APP=routes ACCOUNT_ID=${ACCOUNT_ID}
	make dkpush APP=posts ACCOUNT_ID=${ACCOUNT_ID}
	make dkpush APP=scores ACCOUNT_ID=${ACCOUNT_ID}
	make dkpush APP=rf ACCOUNT_ID=${ACCOUNT_ID}

applyk8s:
	kubectl apply -f "k8s/"

eksk8s:
	envsubst < "$(CURDIR)/k8s/${APP}_app.deployment.yaml" | kubectl apply -f -

eksapply:
	make eksk8s APP=users
	make eksk8s APP=posts
	make eksk8s APP=routes
	make eksk8s APP=offer
	make eksk8s APP=score
	make eksk8s APP=rf
	envsubst < "$(CURDIR)/k8s/db.secrets.yaml" | kubectl apply -f -
	kubectl apply -f "$(shell pwd)/k8s/service-discovery.configmap.yaml"
    
# delete all resources in default namespace
mkdelete:
	kubectl delete all --all -n default

deletek8s:
	kubectl delete -f "k8s/"

eksconfig:
	aws sts get-caller-identity
	aws eks update-kubeconfig --region us-east-1 --name  ${EKS_CLUSTER_NAME}

eksingressurl:
	kubectl get svc -n ingress-nginx ingress-nginx-controller 

TERRAFORM_ENV ?= student

tfinit:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" init -backend-config="$(shell pwd)/terraform/environments/${TERRAFORM_ENV}/${STACK}/backend.tfvars"

initterraform:
	make tfinit STACK=eks
	make tfinit STACK=database
	make tfinit STACK=registry

tfplan:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" plan -var-file="$(shell pwd)/terraform/environments/${TERRAFORM_ENV}/${STACK}/terraform.tfvars" -out="$(STACK).tfplan"

planterraform:
	make tfplan STACK=eks
	make tfplan STACK=database
	make tfplan STACK=registry

# apply the created plan file
tfapply:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" apply "$(STACK).tfplan"

applyterraform:
	make tfapply STACK=eks
	make tfapply STACK=database
	make tfapply STACK=registry

createingress:
	helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
	helm repo update
	helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace --set controller.service.type=LoadBalancer 
	kubectl get svc -n ingress-nginx ingress-nginx-controller
	
applyingress:
	kubectl apply -f "$(CURDIR)/k8s/ingress.deployment.yaml"

createinfra:
	make initterraform
	make planterraform
	make applyterraform

# =========================
# Sección de destrucción
# =========================

.PHONY: destroy-k8s destroyterraform tfdestroy ecr-nuke-repos destroyall

destroy-k8s:
	- kubectl delete -f "$(CURDIR)/k8s/ingress.deployment.yaml"
	- kubectl delete -f "k8s/"
	- helm uninstall ingress-nginx -n ingress-nginx
	- kubectl delete ns ingress-nginx
	- kubectl delete all --all -n default

tfdestroy:
	terraform -chdir="$(CURDIR)/terraform/stacks/$(STACK)" destroy \
		-auto-approve \
		-var-file="$(CURDIR)/terraform/environments/$(TERRAFORM_ENV)/$(STACK)/terraform.tfvars"

tfdestroy-u:
	terraform -chdir="$(CURDIR)/terraform/stacks/$(STACK)" destroy \
		-auto-approve \
		-var-file="$(CURDIR)/terraform/environments/$(TERRAFORM_ENV)/$(STACK)/terraform.tfvars"

destroyterraform:
	make tfdestroy STACK=registry
	make tfdestroy STACK=database
	make tfdestroy STACK=eks

ecr-nuke-repos:
	- aws ecr delete-repository --repository-name users-app  --force --region us-east-1
	- aws ecr delete-repository --repository-name offers-app --force --region us-east-1
	- aws ecr delete-repository --repository-name routes-app --force --region us-east-1
	- aws ecr delete-repository --repository-name posts-app  --force --region us-east-1
	- aws ecr delete-repository --repository-name scores-app --force --region us-east-1
	- aws ecr delete-repository --repository-name rf-app     --force --region us-east-1

destroyall:
	make destroy-k8s
	make destroyterraform
