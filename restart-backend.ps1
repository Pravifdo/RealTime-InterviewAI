# Kill process on port 5000 and restart backend
Write-Host "🔍 Finding process on port 5000..." -ForegroundColor Cyan

$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        if ($pid -gt 0) {
            Write-Host "❌ Killing PID: $pid" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 5000 freed!" -ForegroundColor Green
} else {
    Write-Host "✅ Port 5000 is already free" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Set-Location "C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\backend\node"
npm run dev
