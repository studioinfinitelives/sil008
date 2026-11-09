terraform {
  required_version = ">= 1.5"

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 6.20, < 8.0"
    }
  }

  backend "gcs" {
    bucket = "sil-terraform-state"
    prefix = "sil008"
  }
}

variable "project_id" {
  description = "GCP and Firebase project id."
  type        = string
}

# Firebase rejects user (ADC) credentials without a quota project, hence the override.
provider "google-beta" {
  user_project_override = true
  billing_project       = var.project_id
}

resource "google_firebase_hosting_site" "prod" {
  provider = google-beta
  project  = var.project_id
  site_id  = "sil008"
}

resource "google_firebase_hosting_site" "dev" {
  provider = google-beta
  project  = var.project_id
  site_id  = "sil008-dev"
}
