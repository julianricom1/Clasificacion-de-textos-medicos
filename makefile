# =========================
# Lint / Tests
# =========================
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

# =========
# Variables
# =========
CURDIR ?= $(shell pwd)
TERRAFORM_ENV      = student                
REGION             = us-east-1
TF_BACKEND_BUCKET  = infrastructura-clasificador-g8
TERRAFORM_ENV = student

# ================
# Backend S3 
# ================
.PHONY: tf-backend-bucket
tf-backend-bucket:
	@echo ">> Verificando bucket S3: $(TF_BACKEND_BUCKET) en $(REGION)"
	@if aws s3api head-bucket --bucket $(TF_BACKEND_BUCKET) 2>/dev/null; then \
	  echo "   Bucket ya existe."; \
	else \
	  if [ "$(REGION)" = "us-east-1" ]; then \
	    aws s3api create-bucket --bucket $(TF_BACKEND_BUCKET) --region $(REGION); \
	  else \
	    aws s3api create-bucket --bucket $(TF_BACKEND_BUCKET) --region $(REGION) \
	      --create-bucket-configuration LocationConstraint=$(REGION); \
	  fi; \
	  aws s3api put-bucket-versioning \
	    --bucket $(TF_BACKEND_BUCKET) --versioning-configuration Status=Enabled; \
	  aws s3api put-bucket-encryption \
	    --bucket $(TF_BACKEND_BUCKET) \
	    --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'; \
	fi

.PHONY: tf-backend-bucket-delete destroyterraform-all

# Borra TODAS las versiones y luego elimina el bucket del backend
tf-backend-bucket-delete:
	@echo ">> Eliminando objetos versionados en s3://$(TF_BACKEND_BUCKET)"
	@aws s3api list-object-versions --bucket $(TF_BACKEND_BUCKET) --output json | \
	  jq -r '.Versions[]?, .DeleteMarkers[]? | {Key:.Key, VersionId:.VersionId} | @json' | \
	  while read -r obj; do \
	    key=$$(echo $$obj | jq -r .Key); \
	    vid=$$(echo $$obj | jq -r .VersionId); \
	    aws s3api delete-object --bucket $(TF_BACKEND_BUCKET) --key "$$key" --version-id "$$vid" >/dev/null; \
	  done || true
	@echo ">> Eliminando bucket s3://$(TF_BACKEND_BUCKET)"
	@aws s3api delete-bucket --bucket $(TF_BACKEND_BUCKET) --region $(REGION) || true

# Destruye infra y luego elimina el bucket
destroyterraform-all: destroyterraform tf-backend-bucket-delete


# =========================
# Terraform (componentes)
# =========================
tfinit:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" init \
	  -backend-config="$(shell pwd)/terraform/environments/${TERRAFORM_ENV}/${STACK}/backend.tfvars"

tfplan:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" plan \
	  -var-file="$(shell pwd)/terraform/environments/${TERRAFORM_ENV}/${STACK}/terraform.tfvars" \
	  -out="$(STACK).tfplan"

tfapply:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" apply "$(STACK).tfplan"

tfdestroy:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" destroy -auto-approve \
	  -var-file="$(shell pwd)/terraform/environments/${TERRAFORM_ENV}/${STACK}/terraform.tfvars"

# =========================
# Terraform (infra)
# =========================
initterraform:
	$(MAKE) tf-backend-bucket REGION=$(REGION) TF_BACKEND_BUCKET=$(TF_BACKEND_BUCKET)
	$(MAKE) tfinit STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)

planterraform:
	$(MAKE) tfplan STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)

applyterraform:
	$(MAKE) tfapply STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)

destroyterraform:
	$(MAKE) tfdestroy STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)
	$(MAKE) tf-backend-bucket-delete


# =========================
# Docker Image
# =========================
buildimages:
	docker build --rm --platform linux/amd64 --no-cache -t ${APP}:latest .

ecrlogin:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com"

dkimg:
	docker tag "${APP}:latest" "${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/${APP}:latest"
	docker push "${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/${APP}:latest"


# =========================
# Shortcuts
# =========================

deployinfrastructure:
	make initterraform
	make planterraform
	make applyterraform

uploadimages:
	make buildimages APP=clasificador-api
	make ecrlogin
	make dkimg APP=clasificador-api ACCOUNT_ID=${ACCOUNT_ID}

setup:
	make deployinfrastructure
	make uploadimages