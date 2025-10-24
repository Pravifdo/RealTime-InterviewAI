# Show Share Links Script
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RealTime InterviewAI - Share Links" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ip = "192.168.107.175"

Write-Host "YOUR IP ADDRESS: $ip" -ForegroundColor Green
Write-Host ""

Write-Host "LINKS TO SHARE:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Interviewer Page (for you):" -ForegroundColor White
Write-Host "   http://$ip`:3000/JoinInterview" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Participant Link (for Anada):" -ForegroundColor White
Write-Host "   http://$ip`:3000/joinParticipant?room=YOUR_ROOM_ID" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEPS:" -ForegroundColor Yellow
Write-Host "1. Open the Interviewer Page on YOUR computer" -ForegroundColor White
Write-Host "2. Click 'Generate Room ID' button" -ForegroundColor White
Write-Host "3. Copy the participant link that appears" -ForegroundColor White
Write-Host "4. Send that link to Anada" -ForegroundColor White
Write-Host ""

Write-Host "EXAMPLE:" -ForegroundColor Yellow
Write-Host "If Room ID is: room-gmh12sxpr" -ForegroundColor White
Write-Host "Share this link: http://$ip`:3000/joinParticipant?room=room-gmh12sxpr" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "- Both computers must be on SAME Wi-Fi network" -ForegroundColor White
Write-Host "- Frontend must be restarted after updating .env file" -ForegroundColor White
Write-Host "- Firewall should allow ports 3000 and 5000" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
