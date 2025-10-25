# Setup Windows Firewall Rules for Interview App
# Run this script as Administrator

Write-Host "🔥 Setting up Windows Firewall rules..." -ForegroundColor Cyan

# Remove old rules if they exist
Write-Host "Removing old rules (if any)..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "Interview App Backend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Interview App Frontend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Node.js Interview Backend" -ErrorAction SilentlyContinue

# Add rule for Backend (Port 5000)
Write-Host "Adding firewall rule for Backend (Port 5000)..." -ForegroundColor Green
New-NetFirewallRule -DisplayName "Interview App Backend" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5000 `
    -Action Allow `
    -Profile Any `
    -Description "Allow inbound connections to Interview App backend server on port 5000"

# Add rule for Frontend (Port 3000)
Write-Host "Adding firewall rule for Frontend (Port 3000)..." -ForegroundColor Green
New-NetFirewallRule -DisplayName "Interview App Frontend" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3000 `
    -Action Allow `
    -Profile Any `
    -Description "Allow inbound connections to Interview App frontend server on port 3000"

# Add rule for Node.js executable (for WebSocket connections)
Write-Host "Adding firewall rule for Node.js..." -ForegroundColor Green
$nodePath = (Get-Command node).Source
if ($nodePath) {
    New-NetFirewallRule -DisplayName "Node.js Interview Backend" `
        -Direction Inbound `
        -Program $nodePath `
        -Action Allow `
        -Profile Any `
        -Description "Allow Node.js for Interview App WebSocket connections"
    Write-Host "Node.js path: $nodePath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Firewall rules configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To verify, run: Get-NetFirewallRule -DisplayName '*Interview*' | Format-Table -Property DisplayName, Enabled, Action" -ForegroundColor Cyan
