# Generate Shareable Link for Participant
# This creates the correct link with your IP address

param(
    [Parameter(Mandatory=$false)]
    [string]$RoomID
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Generate Participant Link" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get IP Address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
}

if (-not $ipAddress) {
    Write-Host "ERROR: Could not detect your IP address!" -ForegroundColor Red
    Write-Host "Please run 'ipconfig' manually" -ForegroundColor Yellow
    exit
}

Write-Host "Your IP Address: $ipAddress" -ForegroundColor Green
Write-Host ""

# Check if servers are running
Write-Host "Checking servers..." -ForegroundColor Yellow
$backend = netstat -ano | findstr ":5000.*LISTENING"
$frontend = netstat -ano | findstr ":3000.*LISTENING"

if ($backend) {
    Write-Host "[OK] Backend is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Backend is NOT running!" -ForegroundColor Red
    Write-Host "Run: cd backend\node; npm run dev" -ForegroundColor Yellow
}

if ($frontend) {
    Write-Host "[OK] Frontend is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Frontend is NOT running!" -ForegroundColor Red
    Write-Host "Run: cd frontend; npm start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LINKS TO SHARE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. INTERVIEWER PAGE (for you):" -ForegroundColor Yellow
$interviewerLink = "http://${ipAddress}:3000/JoinInterview"
Write-Host "   $interviewerLink" -ForegroundColor White
Write-Host ""

if ($RoomID) {
    Write-Host "2. PARTICIPANT LINK (for Anada):" -ForegroundColor Yellow
    $participantLink = "http://${ipAddress}:3000/joinParticipant?room=$RoomID"
    Write-Host "   $participantLink" -ForegroundColor Green
    Write-Host ""
    
    # Copy to clipboard
    Set-Clipboard -Value $participantLink
    Write-Host "[COPIED TO CLIPBOARD]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The participant link has been copied!" -ForegroundColor Green
    Write-Host "Just paste (Ctrl+V) it in WhatsApp/Email to send to Anada." -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "2. PARTICIPANT LINK (for Anada):" -ForegroundColor Yellow
    Write-Host "   http://${ipAddress}:3000/joinParticipant?room=YOUR_ROOM_ID" -ForegroundColor White
    Write-Host ""
    Write-Host "To generate the complete link:" -ForegroundColor Cyan
    Write-Host "1. Open the interviewer page above" -ForegroundColor White
    Write-Host "2. Click 'Generate Room ID' button" -ForegroundColor White
    Write-Host "3. Run this script again with the room ID:" -ForegroundColor White
    Write-Host "   .\generate-link.ps1 -RoomID room-abc123" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IMPORTANT REMINDERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Anada must be on the SAME Wi-Fi network as you" -ForegroundColor White
Write-Host "2. DO NOT share links with 'localhost' - always use IP address" -ForegroundColor White
Write-Host "3. Test the link on your own browser first" -ForegroundColor White
Write-Host "4. Firewall must allow ports 3000 and 5000" -ForegroundColor White
Write-Host ""

Write-Host "Test your setup by opening:" -ForegroundColor Cyan
Write-Host "http://${ipAddress}:3000" -ForegroundColor Yellow
Write-Host ""
