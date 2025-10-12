# Quick Restart Script for RealTime-InterviewAI
# Run this script to properly restart both servers

Write-Host "🔄 Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "✅ All Node processes stopped" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
Write-Host "Opening new terminal for backend..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\backend\node'; npm run dev"

Write-Host "⏳ Waiting 5 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "Opening new terminal for frontend..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\frontend'; npm start"

Write-Host ""
Write-Host "✅ Both servers starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for backend to show: '🚀 Server running on http://localhost:5000'" -ForegroundColor White
Write-Host "2. Wait for frontend to show: 'Compiled successfully!'" -ForegroundColor White
Write-Host "3. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "4. Open Chrome: http://localhost:3000/join-interview" -ForegroundColor White
Write-Host "5. Open Firefox: http://localhost:3000/join-participant" -ForegroundColor White
Write-Host "6. Press F12 on both to check console logs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
