# Test POST /auth/register (PowerShell-safe JSON + real anon key)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$InfoFile = Join-Path $Root "utils\supabase\info.tsx"
if (-not (Test-Path $InfoFile)) { Write-Error "Missing $InfoFile" }

$content = Get-Content $InfoFile -Raw
if ($content -match 'publicAnonKey = "([^"]+)"') {
  $anonKey = $Matches[1]
} else {
  Write-Error "Could not parse publicAnonKey from info.tsx"
}

$bodyFile = Join-Path $PSScriptRoot "test-register-body.json"
@'
{"email":"cli-test@example.com","password":"test1234","name":"CLI Test"}
'@ | Set-Content -Path $bodyFile -Encoding utf8NoBOM

$url = "https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352/auth/register"
Write-Host "POST $url"
curl.exe -s -X POST $url `
  -H "Authorization: Bearer $anonKey" `
  -H "Content-Type: application/json" `
  --data-binary "@$bodyFile"

Write-Host ""
