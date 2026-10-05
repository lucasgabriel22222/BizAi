# Configura .env e cria tabelas no Supabase
# Uso: .\scripts\setup-supabase.ps1 -Password "sua-senha-do-banco"

param(
    [Parameter(Mandatory = $true)]
    [string]$Password
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$encoded = [uri]::EscapeDataString($Password)
$dbUrl = "postgresql://postgres.wyhsymczapiykpksvqpb:${encoded}@aws-1-us-east-2.pooler.supabase.com:6543/postgres?schema=public&sslmode=require&pgbouncer=true"
$directUrl = "postgresql://postgres.wyhsymczapiykpksvqpb:${encoded}@aws-1-us-east-2.pooler.supabase.com:5432/postgres?schema=public&sslmode=require"

$envContent = @"
# Supabase — gerado por setup-supabase.ps1
NEXT_PUBLIC_SUPABASE_URL="https://wyhsymczapiykpksvqpb.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_tF9wzYnuCw5UDH8rlRspig_V-ymwdof"

DATABASE_URL="$dbUrl"
DIRECT_URL="$directUrl"

JWT_SECRET="clinica-pro-dev-secret-key-min-32-chars-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "Arquivo .env atualizado." -ForegroundColor Green

Write-Host "Criando tabelas no Supabase..." -ForegroundColor Cyan
npx prisma db push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Populando dados demo..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Pronto! Reinicie o servidor: npm run dev" -ForegroundColor Green
Write-Host "Login demo: demo@clinica.com / 123456" -ForegroundColor Yellow
Write-Host "Agendamento: http://localhost:3000/agendar/ana-silva" -ForegroundColor Yellow
