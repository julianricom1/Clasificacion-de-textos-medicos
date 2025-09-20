provider "aws" {
  region = var.region
  default_tags {
    tags = {
      "terraform" : true,
      "owner" : var.owner,
    }
  }
}

terraform {
  required_version = "~> 1.13.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5"
    }
  }
  backend "s3" {}
}