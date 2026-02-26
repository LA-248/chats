provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

provider "aws" {
  alias   = "ecr_public"
  region  = "us-east-1"
  profile = var.aws_profile
}

variable "aws_region" {
  type    = string
  default = "eu-central-1"
}
variable "aws_profile" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "ecr_repo_names" {
  type = set(string)
}

resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_ecrpublic_repository" "this" {
  provider = aws.ecr_public

  for_each = var.ecr_repo_names
  repository_name = each.value
}
