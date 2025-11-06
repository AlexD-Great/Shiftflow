# ShiftFlow Setup Script for Windows PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ShiftFlow - Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install engine dependencies
Write-Host "Installing engine dependencies..." -ForegroundColor Yellow
Set-Location packages/engine
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install engine dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ../..
Write-Host "✓ Engine dependencies installed" -ForegroundColor Green
Write-Host ""

# Install SDK dependencies
Write-Host "Installing SDK dependencies..." -ForegroundColor Yellow
Set-Location packages/sdk
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install SDK dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ../..
Write-Host "✓ SDK dependencies installed" -ForegroundColor Green
Write-Host ""

# Check for .env file
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env and add your SideShift credentials!" -ForegroundColor Yellow
    Write-Host "   Get them from: https://sideshift.ai/account" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Check for engine .env
if (!(Test-Path "packages/engine/.env")) {
    Write-Host "Creating engine .env file..." -ForegroundColor Yellow
    Copy-Item "packages/engine/.env.example" "packages/engine/.env"
    Write-Host "✓ Engine .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ Engine .env file already exists" -ForegroundColor Green
}
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env and add your SideShift credentials" -ForegroundColor White
Write-Host "2. Run the demo:" -ForegroundColor White
Write-Host "   cd packages/engine" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more info, see QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
