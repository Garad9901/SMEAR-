# ──────────────────────────────────────────────────────────────────
# RouteIQ X — AWS EKS Infrastructure (Terraform)
# Provisions: VPC, EKS cluster, RDS PostGIS, ElastiCache, S3, MSK Kafka
# ──────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }

  backend "s3" {
    bucket         = "routeiq-x-terraform-state"
    key            = "production/eks/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "routeiq-terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "RouteIQ-X"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "infrastructure-team"
    }
  }
}

# ── Variables ──────────────────────────────────────────────────────
variable "aws_region"    { default = "ap-south-1" }
variable "environment"   { default = "production" }
variable "cluster_name"  { default = "routeiq-x-eks" }
variable "cluster_version" { default = "1.29" }
variable "vpc_cidr"      { default = "10.0.0.0/16" }

# ── VPC ───────────────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5"

  name = "routeiq-x-vpc"
  cidr = var.vpc_cidr

  azs              = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true

  # EKS cluster tags for load balancer discovery
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"           = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
  }
  public_subnet_tags = {
    "kubernetes.io/role/elb"                    = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
  }
}

# ── EKS Cluster ───────────────────────────────────────────────────
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.8"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster addons
  cluster_addons = {
    coredns            = { most_recent = true }
    kube-proxy         = { most_recent = true }
    vpc-cni            = { most_recent = true }
    aws-ebs-csi-driver = { most_recent = true }
  }

  # Managed Node Groups
  eks_managed_node_groups = {
    # General workloads
    system = {
      name           = "system-ng"
      instance_types = ["t3.large"]
      min_size       = 2
      max_size       = 5
      desired_size   = 3
      labels = { workload = "system" }
    }
    
    # API + Microservices
    application = {
      name           = "app-ng"
      instance_types = ["c5.2xlarge"]
      min_size       = 3
      max_size       = 20
      desired_size   = 5
      labels = { workload = "application" }
      taints = []
    }
    
    # ML inference (GPU optional)
    ml = {
      name           = "ml-ng"
      instance_types = ["c5.4xlarge"]
      min_size       = 1
      max_size       = 10
      desired_size   = 2
      labels = { workload = "ml-inference" }
    }
    
    # Geospatial processing
    geospatial = {
      name           = "geo-ng"
      instance_types = ["r5.2xlarge"]  # Memory-optimized for PostGIS
      min_size       = 1
      max_size       = 8
      desired_size   = 2
      labels = { workload = "geospatial" }
    }
  }

  # IRSA for AWS service access
  enable_cluster_creator_admin_permissions = true
}

# ── RDS PostgreSQL + PostGIS ───────────────────────────────────────
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.5"

  identifier        = "routeiq-x-postgres"
  engine            = "postgres"
  engine_version    = "15.6"
  instance_class    = "db.r6g.2xlarge"
  allocated_storage = 500
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "routeiq_db"
  username = "routeiq"
  port     = 5432

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group_name

  backup_retention_period = 14
  skip_final_snapshot     = false
  deletion_protection     = true
  multi_az                = true

  parameters = [
    { name = "shared_preload_libraries", value = "pg_stat_statements,postgis-3" },
    { name = "max_connections", value = "1000" },
    { name = "work_mem", value = "512MB" },
    { name = "maintenance_work_mem", value = "2GB" },
  ]

  tags = { Service = "postgresql-postgis" }
}

# ── ElastiCache Redis ──────────────────────────────────────────────
resource "aws_elasticache_replication_group" "routeiq_redis" {
  replication_group_id       = "routeiq-x-redis"
  description                = "RouteIQ X Redis cluster for caching and Celery"
  node_type                  = "cache.r7g.large"
  num_cache_clusters         = 3
  parameter_group_name       = "default.redis7"
  port                       = 6379
  automatic_failover_enabled = true
  multi_az_enabled           = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  subnet_group_name          = aws_elasticache_subnet_group.routeiq.name
  security_group_ids         = [module.vpc.default_security_group_id]
}

resource "aws_elasticache_subnet_group" "routeiq" {
  name       = "routeiq-x-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

# ── Amazon MSK (Managed Kafka) ─────────────────────────────────────
resource "aws_msk_cluster" "routeiq_kafka" {
  cluster_name           = "routeiq-x-kafka"
  kafka_version          = "3.6.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = module.vpc.private_subnets
    security_groups = [module.vpc.default_security_group_id]

    storage_info {
      ebs_storage_info { volume_size = 1000 }
    }
  }

  encryption_info {
    encryption_in_transit { client_broker = "TLS" }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = "/routeiq/kafka/broker-logs"
      }
    }
  }
}

# ── S3 Buckets ────────────────────────────────────────────────────
resource "aws_s3_bucket" "artifacts" {
  bucket = "routeiq-x-artifacts-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

# ── Outputs ───────────────────────────────────────────────────────
output "cluster_endpoint"      { value = module.eks.cluster_endpoint }
output "cluster_name"          { value = module.eks.cluster_name }
output "rds_endpoint"          { value = module.rds.db_instance_endpoint }
output "redis_endpoint"        { value = aws_elasticache_replication_group.routeiq_redis.primary_endpoint_address }
output "kafka_bootstrap_brokers" { value = aws_msk_cluster.routeiq_kafka.bootstrap_brokers_tls }
output "s3_artifacts_bucket"   { value = aws_s3_bucket.artifacts.bucket }

data "aws_caller_identity" "current" {}
