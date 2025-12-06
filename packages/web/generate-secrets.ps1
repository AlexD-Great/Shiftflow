# Generate Secrets for ShiftFlow Wave 3

Write-Host ""
Write-Host "🔐 ShiftFlow Wave 3 - Secret Generator" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Generate NEXTAUTH_SECRET
Write-Host "Generating NEXTAUTH_SECRET..." -ForegroundColor Yellow
$nextAuthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "✅ NEXTAUTH_SECRET:" -ForegroundColor Green
Write-Host $nextAuthSecret -ForegroundColor White
Write-Host ""

# Generate CRON_SECRET
Write-Host "Generating CRON_SECRET..." -ForegroundColor Yellow
$cronSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "✅ CRON_SECRET:" -ForegroundColor Green
Write-Host $cronSecret -ForegroundColor White
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Copy these secrets to your .env.local file" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create .env.local file in packages/web/" -ForegroundColor White
Write-Host "2. Copy the template from SECRETS_TEMPLATE.txt" -ForegroundColor White
Write-Host "3. Paste the secrets above" -ForegroundColor White
Write-Host "4. Add your Vercel Postgres DATABASE_URL" -ForegroundColor White
Write-Host "5. Add your SideShift credentials" -ForegroundColor White
Write-Host "6. Run: npx prisma db push" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
Write-Host ""
