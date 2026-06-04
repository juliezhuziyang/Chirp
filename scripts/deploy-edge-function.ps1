# Deploy Chirp Edge Function from the correct directory (contains supabase/functions/...)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$entrypoint = Join-Path $Root "supabase\functions\make-server-b89d4352\index.ts"
if (-not (Test-Path $entrypoint)) {
  Write-Error "Missing entrypoint: $entrypoint`nRun this script from the Chirp app folder (not CHIRP parent)."
}

Write-Host "Deploying from: $Root"
Write-Host "Entrypoint: $entrypoint"
supabase functions deploy make-server-b89d4352 --project-ref edjtshisztwaunytdlxd --no-verify-jwt
