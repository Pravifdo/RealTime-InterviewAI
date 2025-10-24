# Quick Setup Script for LAN Access
# Run this script to configure your app for network access

Write-Host "🔧 RealTime InterviewAI - LAN Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

# Get IP Address
Write-Host "📡 Detecting your IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "✅ Your IP Address: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "❌ Could not detect IP address!" -ForegroundColor Red
    Write-Host "Please run 'ipconfig' manually and check IPv4 Address" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "🔧 Updating frontend configuration..." -ForegroundColor Yellow

# Update .env file
$envPath = "frontend\.env"
$envContent = @"
# Backend Server Configuration
# For localhost (same computer): use localhost
# For LAN access (other computers on same network): use your IP address

# Default for localhost (commented out for LAN access)
# REACT_APP_BACKEND_URL=http://localhost:5000

# LAN Access - Auto-configured
REACT_APP_BACKEND_URL=http://${ipAddress}:5000
"@

Set-Content -Path $envPath -Value $envContent
Write-Host "[OK] Updated $envPath" -ForegroundColor Green

Write-Host ""
Write-Host "🔥 Checking Firewall Rules..." -ForegroundColor Yellow

# Check if rules exist
$rule5000 = Get-NetFirewallRule -DisplayName "Node.js Backend - Interview App" -ErrorAction SilentlyContinue
$rule3000 = Get-NetFirewallRule -DisplayName "React Frontend - Interview App" -ErrorAction SilentlyContinue

if (-not $rule5000) {
    Write-Host "Adding firewall rule for port 5000..." -ForegroundColor Yellow
    try {
        New-NetFirewallRule -DisplayName "Node.js Backend - Interview App" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -ErrorAction Stop | Out-Null
        Write-Host "✅ Firewall rule added for port 5000" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not add firewall rule. Please run as Administrator or add manually." -ForegroundColor Red
    }
} else {
    Write-Host "✅ Firewall rule for port 5000 already exists" -ForegroundColor Green
}

if (-not $rule3000) {
    Write-Host "Adding firewall rule for port 3000..." -ForegroundColor Yellow
    try {
        New-NetFirewallRule -DisplayName "React Frontend - Interview App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -ErrorAction Stop | Out-Null
        Write-Host "✅ Firewall rule added for port 3000" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not add firewall rule. Please run as Administrator or add manually." -ForegroundColor Red
    }
} else {
    Write-Host "✅ Firewall rule for port 3000 already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your frontend server (Ctrl+C and run 'npm start' again)" -ForegroundColor White
Write-Host "2. Make sure backend is running in another terminal" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Share these links with participants:" -ForegroundColor Cyan
Write-Host "   Interviewer:  http://${ipAddress}:3000/JoinInterview" -ForegroundColor Yellow
Write-Host "   Participant:  http://${ipAddress}:3000/joinParticipant?room=YOUR_ROOM_ID" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  Important:" -ForegroundColor Red
Write-Host "   - Both computers must be on the SAME Wi-Fi network" -ForegroundColor White
Write-Host "   - The participant should replace YOUR_ROOM_ID with actual room ID" -ForegroundColor White
Write-Host ""

Write-Host "For detailed instructions, see: LAN_SHARING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
