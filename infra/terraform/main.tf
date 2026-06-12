terraform {
  required_version = ">= 1.5"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# Authenticates via the CLOUDFLARE_API_TOKEN environment variable.
provider "cloudflare" {}

# The Cloudflare Pages project that hosts the static site.
resource "cloudflare_pages_project" "site" {
  account_id        = var.cloudflare_account_id
  name              = "hayden-remington"
  production_branch = "main"
}

# Point the apex domain at the Pages project.
resource "cloudflare_record" "apex" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "CNAME"
  content = "hayden-remington.pages.dev"
  proxied = true
}
