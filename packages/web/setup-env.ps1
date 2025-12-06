# PowerShell script to generate .env.local with secure secrets

Write-Host "🚀 ShiftFlow Wave 3 - Environment Setup" -ForegroundColor Cyan
Write-Host ""

# Generate secrets
$nextAuthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
$cronSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

Write-Host "✅ Generated secure secrets" -ForegroundColor Green
Write-Host ""

# Prompt for Vercel Postgres URL
Write-Host "📋 Please paste your Vercel Postgres connection string:" -ForegroundColor Yellow
Write-Host "   (Get it from: Vercel Dashboard > Storage > Your DB > .env.local tab)" -ForegroundColor Gray
Write-Host "   Look for: POSTGRES_PRISMA_URL" -ForegroundColor Gray
$databaseUrl = Read-Host "DATABASE_URL"

Write-Host ""
Write-Host "📋 Please enter your SideShift API credentials:" -ForegroundColor Yellow
$sideshiftSecret = Read-Host "SIDESHIFT_SECRET"
$affiliateId = Read-Host "AFFILIATE_ID"

# Create .env.local
$envContent = @"
# Database (Vercel Postgres)
DATABASE_URL="$databaseUrl"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$nextAuthSecret"

# SideShift API
SIDESHIFT_SECRET="$sideshiftSecret"
AFFILIATE_ID="$affiliateId"

# Cron Job Security
CRON_SECRET="$cronSecret"

# Optional: CoinGecko API
COINGECKO_API_KEY=""
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "✅ Created .env.local file!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npx prisma db push" -ForegroundColor White
Write-Host "   2. Run: npx prisma studio (to verify)" -ForegroundColor White
Write-Host "   3. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
