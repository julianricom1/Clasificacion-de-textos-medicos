region        = "us-east-1"
state_bucket  = "infrastructura-clasificador-g8"
vpc_state_key = "vpc/terraform.tfstate"

alb_name    = "ctm-alb"
target_port = 8000
health_path = "/api/v1/health"   
