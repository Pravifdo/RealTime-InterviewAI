# 🚀 Ngrok Setup Guide for Project Demonstration

## Problem
When using ngrok to expose your app over HTTPS, the frontend (served via ngrok HTTPS) cannot connect to the backend (local HTTP) due to **Mixed Content** security restrictions in browsers.

## Solution
Run **TWO ngrok tunnels** - one for frontend, one for backend.

---

## 📋 Step-by-Step Setup

### **Step 1: Start Backend Server**
```powershell
cd backend\node
npm run dev
```
Backend should be running on: `http://localhost:5000`

### **Step 2: Start Frontend Server**
```powershell
cd frontend
npm start
```
Frontend should be running on: `http://localhost:3000`

### **Step 3: Create Ngrok Tunnel for Backend**
Open a **NEW PowerShell terminal** and run:
```powershell
ngrok http 5000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### **Step 4: Update Frontend Environment**
Create/Update `frontend\.env.local`:
```properties
REACT_APP_BACKEND_URL=https://abc123.ngrok-free.app
```
Replace with YOUR actual ngrok backend URL.

### **Step 5: Restart Frontend**
Stop the frontend (Ctrl+C) and restart:
```powershell
cd frontend
npm start
```

### **Step 6: Create Ngrok Tunnel for Frontend**
Open **ANOTHER PowerShell terminal** and run:
```powershell
ngrok http 3000
```

You'll see:
```
Forwarding   https://xyz789.ngrok-free.app -> http://localhost:3000
```

**This is your demo URL!** Share this with your supervisor and for the participant device.

---

## 🎯 Demo URLs

### **Interviewer (Supervisor Device):**
```
https://xyz789.ngrok-free.app/joinInterview
```

### **Participant (Your Device):**
```
https://xyz789.ngrok-free.app/joinParticipant?room=ROOM_ID
```
(Copy the room ID from interviewer page)

---

## ⚡ Quick Start Script

Create `start-demo.ps1`:
```powershell
# Start Backend
Start-Process powershell -ArgumentList "cd backend\node; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "cd frontend; npm start"

# Wait for frontend to start
Start-Sleep -Seconds 5

# Instructions
Write-Host "✅ Servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run: ngrok http 5000  (in new terminal)" -ForegroundColor Yellow
Write-Host "2. Copy the HTTPS URL and update frontend\.env.local" -ForegroundColor Yellow
Write-Host "3. Restart frontend (Ctrl+C and npm start)" -ForegroundColor Yellow
Write-Host "4. Run: ngrok http 3000  (in another new terminal)" -ForegroundColor Yellow
Write-Host "5. Use that URL for your demo!" -ForegroundColor Yellow
```

---

## 🔧 Troubleshooting

### Issue: "Mixed Content" errors
**Solution:** Make sure `REACT_APP_BACKEND_URL` in `frontend\.env.local` starts with `https://` (ngrok URL)

### Issue: Socket.IO connection fails
**Solution:** Backend CORS is already configured to accept all origins (`*`). Ensure ngrok tunnel is running.

### Issue: Ngrok tunnel expires
**Free ngrok tunnels** expire after 2 hours. You'll need to:
1. Restart ngrok tunnels
2. Update `frontend\.env.local` with new backend URL
3. Restart frontend

### Issue: "Failed to fetch templates"
**Solution:** 
1. Verify backend ngrok tunnel is running
2. Check `frontend\.env.local` has correct ngrok backend URL
3. Restart frontend after changing .env

---

## 💡 Pro Tips

1. **Use `.env.local` for ngrok URLs** - This file is gitignored, so your ngrok URLs won't be committed
2. **Keep terminals organized** - You'll have 4 terminals running:
   - Backend server
   - Frontend server
   - Backend ngrok
   - Frontend ngrok
3. **Test locally first** - Make sure everything works on `localhost` before using ngrok
4. **Ngrok authentication** - Free tier allows 1 tunnel at a time unless you authenticate. Run: `ngrok authtoken YOUR_TOKEN`

---

## 📱 Testing on Multiple Devices

### Device 1 (Supervisor - Interviewer):
1. Open: `https://YOUR-FRONTEND-NGROK-URL.ngrok-free.app/joinInterview`
2. Create interview room
3. Copy participant link

### Device 2 (Your Device - Participant):
1. Open the participant link copied from Device 1
2. Should be able to see/hear each other via WebRTC!

---

## ✅ Verification Checklist

Before demo:
- [ ] Backend running on localhost:5000
- [ ] Frontend running on localhost:3000
- [ ] Backend ngrok tunnel active (https://xxx.ngrok-free.app)
- [ ] Frontend .env.local updated with backend ngrok URL
- [ ] Frontend restarted after .env.local update
- [ ] Frontend ngrok tunnel active (https://yyy.ngrok-free.app)
- [ ] Templates can be loaded (no Mixed Content errors)
- [ ] Socket.IO connects successfully
- [ ] Can create interview room
- [ ] Participant can join via link
- [ ] Video/audio works between devices

---

## 🎬 Alternative: Using Ngrok Config File

Create `ngrok.yml`:
```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  backend:
    proto: http
    addr: 5000
  frontend:
    proto: http
    addr: 3000
```

Then run both tunnels at once:
```powershell
ngrok start --all --config ngrok.yml
```

This starts both tunnels simultaneously!
