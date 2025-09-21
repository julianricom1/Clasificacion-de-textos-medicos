region         = "us-east-1"
backend_bucket = "infrastructura-clasificador-g8"

service_name   = "clasificador"
image          = "clasificador-api:latest"
container_port = 8000
cpu            = 512
memory         = 1024
desired_count  = 1
env_vars = { LOG_LEVEL = "INFO" }

