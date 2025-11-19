# 🎯 QUICK DEMO SETUP - 5 MINUTES

## Before Demo Day

### 1️⃣ Start Both Servers
```powershell
.\start-servers.ps1
```
This opens 2 windows:
- Backend on port 5000
- Frontend on port 3000

### 2️⃣ Run Setup Script
```powershell
.\setup-ngrok-demo.ps1
```
Follow the prompts to enter your ngrok URLs.

---

## On Demo Day - Quick Steps

### Terminal 1: Backend Ngrok
```powershell
ngrok http 5000
```
Copy the HTTPS URL (e.g., `https://abc-123.ngrok-free.app`)

### Terminal 2: Update Frontend Config
Run setup script and paste backend URL:
```powershell
.\setup-ngrok-demo.ps1
```

### Terminal 3: Restart Frontend
In the frontend terminal:
1. Press `Ctrl+C`
2. Run `npm start`

### Terminal 4: Frontend Ngrok
```powershell
ngrok http 3000
```
Copy this URL - **this is your demo URL!**

---

## 📱 Share with Supervisor

**Interviewer URL:**
```
https://YOUR-FRONTEND-NGROK-URL/joinInterview
```

**Participant URL:**
```
https://YOUR-FRONTEND-NGROK-URL/joinParticipant?room=ROOM_ID
```
(Get ROOM_ID from interviewer page)

---

## ⚠️ Common Issues

**"Mixed Content" error?**
→ Make sure frontend `.env.local` has HTTPS backend URL

**"Failed to fetch templates"?**
→ Check both ngrok tunnels are running

**Socket.IO won't connect?**
→ Restart frontend after changing .env.local

**Ngrok "session limit"?**
→ Free tier = 1 tunnel. Get authtoken: `ngrok authtoken YOUR_TOKEN`

---

## 🔍 Verify Setup

Open frontend ngrok URL and check console:
- ✅ No "Mixed Content" errors
- ✅ Templates load successfully
- ✅ Socket.IO connected
- ✅ Room ID generated

Good luck with your demo! 🚀
