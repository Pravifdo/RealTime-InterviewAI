# Script for Anada to Start Chrome with HTTP Media Access
# This allows camera/microphone over HTTP for testing

param(
    [string]$InterviewUrl = ""
)

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Chrome - HTTP Media Access" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Chrome path
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

if (-not (Test-Path $chromePath)) {
    Write-Host "ERROR: Chrome not found!" -ForegroundColor Red
    Write-Host "Please install Google Chrome or update the path in this script." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

# User data directory
$userData = "$env:LOCALAPPDATA\ChromeDevSession"

# Check if Chrome is running
$chromeProcesses = Get-Process -Name chrome -ErrorAction SilentlyContinue
if ($chromeProcesses) {
    Write-Host "WARNING: Chrome is currently running." -ForegroundColor Yellow
    Write-Host "For this to work properly, ALL Chrome windows must be closed." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to close all Chrome windows now? (Y/N)"
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "Closing Chrome..." -ForegroundColor Yellow
        Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "Chrome closed." -ForegroundColor Green
    } else {
        Write-Host "Please close Chrome manually and run this script again." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit
    }
}

# Get URL if not provided
if (-not $InterviewUrl) {
    Write-Host "Enter the interview link you received:" -ForegroundColor Yellow
    Write-Host "(Should look like: http://192.168.107.175:3000/joinParticipant?room=...)" -ForegroundColor Gray
    Write-Host ""
    $InterviewUrl = Read-Host "Link"
    
    if (-not $InterviewUrl) {
        Write-Host "ERROR: No URL provided!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit
    }
}

# Extract origin from URL
if ($InterviewUrl -match '^(https?://[^/]+)') {
    $origin = $matches[1]
} else {
    Write-Host "ERROR: Invalid URL format!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Starting Chrome with special settings..." -ForegroundColor Cyan
Write-Host "Origin: $origin" -ForegroundColor Gray
Write-Host "URL: $InterviewUrl" -ForegroundColor Gray
Write-Host ""

# Start Chrome
try {
    & $chromePath `
        --unsafely-treat-insecure-origin-as-secure="$origin" `
        --user-data-dir="$userData" `
        "$InterviewUrl"
    
    Write-Host "Chrome started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT:" -ForegroundColor Yellow
    Write-Host "1. When Chrome opens, you'll see the interview page" -ForegroundColor White
    Write-Host "2. Click 'Join Interview Room' button" -ForegroundColor White
    Write-Host "3. Allow camera and microphone when browser asks" -ForegroundColor White
    Write-Host "4. You should connect to the video call!" -ForegroundColor White
    Write-Host ""
    Write-Host "If you see any errors, press F12 and take a screenshot of the Console tab." -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "ERROR starting Chrome: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
