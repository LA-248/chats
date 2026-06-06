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

variable "ecr_repo_name" {
  type = string
}