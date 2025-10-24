# Quick Setup Script for LAN Access

Write-Host "RealTime InterviewAI - LAN Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get IP Address
Write-Host "Detecting your IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "Your IP Address: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "Could not detect IP address!" -ForegroundColor Red
    Write-Host "Please run 'ipconfig' manually" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Updating frontend configuration..." -ForegroundColor Yellow

# Update .env file
$envPath = "frontend\.env"
$envContent = "# Backend Server Configuration`r`n"
$envContent += "# Auto-configured for LAN access`r`n`r`n"
$envContent += "REACT_APP_BACKEND_URL=http://$ipAddress:5000`r`n"

Set-Content -Path $envPath -Value $envContent
Write-Host "Updated $envPath with IP: $ipAddress" -ForegroundColor Green

Write-Host ""
Write-Host "Checking Firewall Rules..." -ForegroundColor Yellow

# Try to add firewall rules
try {
    $rule5000 = Get-NetFirewallRule -DisplayName "Node.js Backend - Interview App" -ErrorAction SilentlyContinue
    if (-not $rule5000) {
        New-NetFirewallRule -DisplayName "Node.js Backend - Interview App" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -ErrorAction Stop | Out-Null
        Write-Host "Added firewall rule for port 5000" -ForegroundColor Green
    } else {
        Write-Host "Firewall rule for port 5000 already exists" -ForegroundColor Green
    }
    
    $rule3000 = Get-NetFirewallRule -DisplayName "React Frontend - Interview App" -ErrorAction SilentlyContinue
    if (-not $rule3000) {
        New-NetFirewallRule -DisplayName "React Frontend - Interview App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -ErrorAction Stop | Out-Null
        Write-Host "Added firewall rule for port 3000" -ForegroundColor Green
    } else {
        Write-Host "Firewall rule for port 3000 already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not add firewall rules automatically." -ForegroundColor Red
    Write-Host "Please run this script as Administrator or add rules manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. RESTART your frontend (Ctrl+C in npm start terminal, then run 'npm start' again)" -ForegroundColor White
Write-Host "2. Make sure backend is running on port 5000" -ForegroundColor White
Write-Host ""

Write-Host "SHARE THESE LINKS:" -ForegroundColor Cyan
Write-Host "Interviewer Page:  http://$ipAddress`:3000/JoinInterview" -ForegroundColor Yellow
Write-Host "Participant Link:  http://$ipAddress`:3000/joinParticipant?room=YOUR_ROOM_ID" -ForegroundColor Yellow
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "- Both computers must be on the SAME Wi-Fi network" -ForegroundColor White
Write-Host "- Replace YOUR_ROOM_ID with the actual room ID from interviewer page" -ForegroundColor White
Write-Host ""

Write-Host "See LAN_SHARING_GUIDE.md for detailed instructions" -ForegroundColor Cyan
