# Start all servers for local development
Write-Host "🚀 Starting Interview App Servers..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend\node'; npm run dev"

# Wait for backend
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

# Wait for frontend
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Servers starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Local URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "🌐 For demo with 2 devices, run: .\setup-ngrok-demo.ps1" -ForegroundColor Yellow
Write-Host ""
