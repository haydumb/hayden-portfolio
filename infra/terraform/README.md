# Terraform — Cloudflare Pages + DNS

Provisions the Cloudflare Pages project (`hayden-remington`) and the apex DNS record
for `haydenremington.com`.

## Usage

```bash
export CLOUDFLARE_API_TOKEN=...        # token with Pages:Edit + DNS:Edit
terraform init
terraform plan \
  -var="cloudflare_account_id=..." \
  -var="cloudflare_zone_id=..."
terraform apply
```

The live site is deployed by GitHub Actions; this config captures the underlying
Cloudflare resources as code.
