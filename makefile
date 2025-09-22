# =========
# Variables
# =========
CURDIR            ?= $(shell pwd)
TERRAFORM_ENV     ?= student
REGION            ?= us-east-1
TF_BACKEND_BUCKET ?= infrastructura-clasificador-g8
ACCOUNT_ID        := $(shell aws sts get-caller-identity --query Account --output text)


# ================
# Backend S3
# ================
.PHONY: tf-backend-bucket tf-backend-bucket-delete destroyterraform-all
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

# Destruye infra (registry) y luego elimina el bucket
destroyterraform-all: destroyterraform tf-backend-bucket-delete


# =========================
# Terraform (componentes)
# =========================
.PHONY: tfinit tfplan tfapply tfdestroy
# Usa -reconfigure para evitar "Backend configuration changed"
tfinit:
	terraform -chdir="$(shell pwd)/terraform/stacks/${STACK}" init -reconfigure \
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
# Terraform (registry)
# =========================
.PHONY: initterraform planterraform applyterraform destroyterraform
initterraform:
	$(MAKE) tf-backend-bucket REGION=$(REGION) TF_BACKEND_BUCKET=$(TF_BACKEND_BUCKET)
	$(MAKE) tfinit STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)

planterraform:
	$(MAKE) tfplan STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)

applyterraform:
	$(MAKE) tfapply STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)

destroyterraform:
	$(MAKE) tfdestroy STACK=registry TERRAFORM_ENV=$(TERRAFORM_ENV)


# =========================
# Docker Image
# =========================
.PHONY: buildimages ecrlogin dkimg
buildimageapi:
	docker build --rm --platform linux/amd64 --no-cache -f app/Dockerfile -t ${APP}:latest .

buildimagefront:
	docker build --rm --platform linux/amd64 --no-cache -f web/Dockerfile -t ${APP}:latest .

ecrlogin:
	aws ecr get-login-password --region $(REGION) | docker login --username AWS --password-stdin "$(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com"

dkimg:
	docker tag "${APP}:latest" "$(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/${APP}:latest"
	docker push "$(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/${APP}:latest"


# =========================
# Terraform (VPC)
# =========================
.PHONY: vpc-init vpc-plan vpc-apply vpc-destroy deploy-vpc
vpc-init:
	$(MAKE) tfinit STACK=vpc TERRAFORM_ENV=$(TERRAFORM_ENV)

vpc-plan:
	$(MAKE) tfplan STACK=vpc TERRAFORM_ENV=$(TERRAFORM_ENV)

vpc-apply:
	$(MAKE) tfapply STACK=vpc TERRAFORM_ENV=$(TERRAFORM_ENV)

vpc-destroy:
	$(MAKE) tfdestroy STACK=vpc TERRAFORM_ENV=$(TERRAFORM_ENV)

deploy-vpc:
	$(MAKE) vpc-init
	$(MAKE) vpc-plan
	$(MAKE) vpc-apply


# =========================
# Terraform (ECS/ALB/APP)
# =========================
.PHONY: ecs-init ecs-plan ecs-apply ecs-destroy \
        alb-init alb-plan alb-apply alb-destroy \
        app-init app-plan app-apply app-destroy \
        deploy-ecs-alb-app destroy-ecs-alb-app

# ECS
ecs-init:
	$(MAKE) tfinit STACK=ecs TERRAFORM_ENV=$(TERRAFORM_ENV)
ecs-plan:
	$(MAKE) tfplan STACK=ecs TERRAFORM_ENV=$(TERRAFORM_ENV)
ecs-apply:
	$(MAKE) tfapply STACK=ecs TERRAFORM_ENV=$(TERRAFORM_ENV)
ecs-destroy:
	$(MAKE) tfdestroy STACK=ecs TERRAFORM_ENV=$(TERRAFORM_ENV)

# ALB
alb-init:
	$(MAKE) tfinit STACK=alb TERRAFORM_ENV=$(TERRAFORM_ENV)
alb-plan:
	$(MAKE) tfplan STACK=alb TERRAFORM_ENV=$(TERRAFORM_ENV)
alb-apply:
	$(MAKE) tfapply STACK=alb TERRAFORM_ENV=$(TERRAFORM_ENV)
alb-destroy:
	$(MAKE) tfdestroy STACK=alb TERRAFORM_ENV=$(TERRAFORM_ENV)

# APP
app-init:
	$(MAKE) tfinit STACK=app TERRAFORM_ENV=$(TERRAFORM_ENV)
app-plan:
	$(MAKE) tfplan STACK=app TERRAFORM_ENV=$(TERRAFORM_ENV)
app-apply:
	$(MAKE) tfapply STACK=app TERRAFORM_ENV=$(TERRAFORM_ENV)
app-destroy:
	$(MAKE) tfdestroy STACK=app TERRAFORM_ENV=$(TERRAFORM_ENV)


# =========================
# Terraform (frontend
# =========================

.PHONY: front-init front-plan front-apply front-destroy
front-init:
	$(MAKE) tfinit STACK=web TERRAFORM_ENV=$(TERRAFORM_ENV)

front-plan:
	$(MAKE) tfplan STACK=web TERRAFORM_ENV=$(TERRAFORM_ENV)

front-apply:
	$(MAKE) tfapply STACK=web TERRAFORM_ENV=$(TERRAFORM_ENV)

front-destroy:
	$(MAKE) tfdestroy STACK=web TERRAFORM_ENV=$(TERRAFORM_ENV)

deployfrontend:
	$(MAKE) front-init
	$(MAKE) front-plan
	$(MAKE) front-apply

# Orquestación end-to-end (ECS -> ALB -> APP)
deploy-ecs-alb-app:
	$(MAKE) ecs-init
	$(MAKE) ecs-plan
	$(MAKE) ecs-apply
	$(MAKE) alb-init
	$(MAKE) alb-plan
	$(MAKE) alb-apply
	$(MAKE) app-init
	$(MAKE) app-plan
	$(MAKE) app-apply

destroy-ecs-alb-app:
	$(MAKE) app-destroy
	$(MAKE) alb-destroy
	$(MAKE) ecs-destroy


# =========================
# Shortcuts
# =========================
.PHONY: deployinfrastructure uploadimages setup fulldestroy alb-dns purge-alb-enis

deployinfrastructure:
	$(MAKE) initterraform
	$(MAKE) planterraform
	$(MAKE) applyterraform

uploadimages:
	$(MAKE) buildimageapi APP=clasificador-api
	$(MAKE) buildimagefront APP=clasificador-front
	$(MAKE) ecrlogin
	$(MAKE) dkimg APP=clasificador-api
	$(MAKE) dkimg APP=clasificador-front

# Construye TODO desde cero:
setup:
	$(MAKE) deployinfrastructure
	$(MAKE) uploadimages
	$(MAKE) deploy-vpc
	$(MAKE) deploy-ecs-alb-app
	$(MAKE) deployfrontend
	$(MAKE) alb-dns

# Imprime el DNS del ALB (via output; fallback a AWS CLI si no existe)
alb-dns:
	@set -e; \
	if terraform -chdir="$(CURDIR)/terraform/stacks/alb" output -raw alb_dns >/dev/null 2>&1; then \
	  DNS=$$(terraform -chdir="$(CURDIR)/terraform/stacks/alb" output -raw alb_dns); \
	else \
	  ALB_ARN=$$(terraform -chdir="$(CURDIR)/terraform/stacks/alb" output -raw alb_arn); \
	  DNS=$$(aws elbv2 describe-load-balancers --load-balancer-arns $$ALB_ARN --query 'LoadBalancers[0].DNSName' --output text); \
	fi; \
	printf "\nALB DNS: %s\n\n" "$$DNS"

# Purga ENIs que bloquean el SG del ALB
purge-alb-enis:
	@echo ">> Buscando ENIs ligados al SG del ALB..."
	@ALB_SG=$$(terraform -chdir="$(CURDIR)/terraform/stacks/alb" output -raw alb_sg_id 2>/dev/null || true); \
	if [ -z "$$ALB_SG" ]; then echo "   No hay alb_sg_id en outputs (ALB ya destruido?)."; exit 0; fi; \
	ENIS=$$(aws ec2 describe-network-interfaces --filters Name=group-id,Values=$$ALB_SG --query 'NetworkInterfaces[*].NetworkInterfaceId' --output text); \
	if [ -n "$$ENIS" ]; then \
	  echo "   ENIs encontradas: $$ENIS"; \
	  for eni in $$ENIS; do \
	    ATT=$$(aws ec2 describe-network-interfaces --network-interface-ids $$eni --query 'NetworkInterfaces[0].Attachment.AttachmentId' --output text 2>/dev/null || true); \
	    if [ "$$ATT" != "None" ] && [ -n "$$ATT" ]; then \
	      echo "   Detaching $$eni ($$ATT)..."; \
	      aws ec2 detach-network-interface --attachment-id $$ATT || true; \
	    fi; \
	    echo "   Esperando a que $$eni quede 'available'..."; \
	    for i in 1 2 3 4 5 6 7 8 9 10; do \
	      S=$$(aws ec2 describe-network-interfaces --network-interface-ids $$eni --query 'NetworkInterfaces[0].Status' --output text 2>/dev/null || true); \
	      if [ "$$S" = "available" ]; then break; fi; \
	      sleep 3; \
	    done; \
	    echo "   Eliminando ENI $$eni..."; \
	    aws ec2 delete-network-interface --network-interface-id $$eni || true; \
	  done; \
	else \
	  echo "   No hay ENIs asociadas."; \
	fi

# Deja TODO limpio
fulldestroy:
	$(MAKE) front-destroy
	$(MAKE) destroy-ecs-alb-app
	$(MAKE) purge-alb-enis
	$(MAKE) vpc-destroy
	$(MAKE) destroyterraform-all

# =========================
# Re-deploys
# =========================
.PHONY: redeployapi redeployfront
redeployapi:
	$(MAKE) buildimageapi APP=clasificador-api
	$(MAKE) ecrlogin
	$(MAKE) dkimg APP=clasificador-api
	$(MAKE) app-apply

redeployfront:
	$(MAKE) buildimagefront APP=clasificador-front
	$(MAKE) ecrlogin
	$(MAKE) dkimg APP=clasificador-front
	$(MAKE) front-apply