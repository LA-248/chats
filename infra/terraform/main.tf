provider "aws" {
  region  = "eu-central-1"
  profile = "my-sso"
}

variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "bucket_name" {
  type = string
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