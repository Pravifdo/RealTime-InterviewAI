# Quick File Share Script
# Creates a simple HTTP server to share files with Anada

Write-Host "Starting File Share Server..." -ForegroundColor Cyan
Write-Host ""

# Get IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"} | Select-Object -First 1).IPAddress
if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
}

Write-Host "Your IP: $ip" -ForegroundColor Green
Write-Host ""

# Create a temporary folder with files
$shareFolder = "$env:TEMP\InterviewShare"
if (Test-Path $shareFolder) {
    Remove-Item $shareFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $shareFolder | Out-Null

# Copy files to share
Copy-Item "start-interview.bat" -Destination $shareFolder
Copy-Item "QUICK_START_FOR_ANADA.md" -Destination $shareFolder

Write-Host "Files ready to share:" -ForegroundColor Yellow
Write-Host "- start-interview.bat" -ForegroundColor White
Write-Host "- QUICK_START_FOR_ANADA.md" -ForegroundColor White
Write-Host ""

Write-Host "Tell Anada to open this URL in her browser:" -ForegroundColor Cyan
Write-Host "http://$ip`:8080" -ForegroundColor Green
Write-Host ""
Write-Host "She can download the files from there." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Gray
Write-Host ""

# Start simple HTTP server
cd $shareFolder
python -m http.server 8080 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Python not found. Trying alternative method..." -ForegroundColor Yellow
    
    # Check if Node.js http-server is available
    $httpServer = Get-Command http-server -ErrorAction SilentlyContinue
    if ($httpServer) {
        npx http-server -p 8080
    } else {
        Write-Host ""
        Write-Host "ERROR: No HTTP server available." -ForegroundColor Red
        Write-Host "Please use Email or WhatsApp to send the files." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Files are located at:" -ForegroundColor Cyan
        Write-Host $shareFolder -ForegroundColor White
    }
}
