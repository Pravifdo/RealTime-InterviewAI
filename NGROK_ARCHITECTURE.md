# 🌐 Ngrok Architecture for 2-Device Demo

## Current Problem (What's NOT working)

```
Device 1 (Your Computer)                    Device 2 (Supervisor)
┌─────────────────────┐                    ┌──────────────────┐
│  Backend (HTTP)     │                    │   Browser        │
│  localhost:5000     │                    │   (HTTPS)        │
└─────────────────────┘                    └──────────────────┘
         ↑                                          ↓
         │                                          │
┌─────────────────────┐                    ┌──────────────────┐
│  Frontend (HTTP)    │─────ngrok HTTPS───→│  Frontend Load   │
│  localhost:3000     │                    │  ✅ Works!        │
└─────────────────────┘                    └──────────────────┘
                                                    ↓
                                           ❌ Mixed Content Error!
                                           (HTTPS → HTTP blocked)
                                                    ↓
                                           Tries to fetch from:
                                           http://10.4.2.1:5000
                                           ❌ BLOCKED by browser!
```

**Problem:** Frontend served via HTTPS (ngrok) cannot connect to HTTP backend

---

## Solution (What WILL work)

```
Device 1 (Your Computer)
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  Backend        │◄────────│  ngrok tunnel   │           │
│  │  localhost:5000 │         │  Port: 5000     │           │
│  └─────────────────┘         └─────────────────┘           │
│         ↑                             ↓                     │
│         │                     https://abc-123.ngrok-free.app │
│         │                                                    │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  Frontend       │◄────────│  ngrok tunnel   │           │
│  │  localhost:3000 │         │  Port: 3000     │           │
│  └─────────────────┘         └─────────────────┘           │
│         ↑                             ↓                     │
│         │                     https://xyz-789.ngrok-free.app │
│         │                                                    │
│  Frontend .env.local:                                        │
│  REACT_APP_BACKEND_URL=https://abc-123.ngrok-free.app       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  │ Both URLs use HTTPS ✅
                                  ↓
┌─────────────────────────────────────────────────────────────┐
│  Device 2 (Supervisor)                                       │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │  Browser                                 │               │
│  │  https://xyz-789.ngrok-free.app          │               │
│  └──────────────────────────────────────────┘               │
│                    ↓                                         │
│           Frontend Loads ✅                                  │
│                    ↓                                         │
│           Fetches from Backend:                              │
│           https://abc-123.ngrok-free.app ✅                  │
│                    ↓                                         │
│           Socket.IO connects ✅                              │
│                    ↓                                         │
│           WebRTC video/audio ✅                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Solution:** Both frontend and backend exposed via HTTPS ngrok tunnels

---

## Data Flow During Demo

```
Interviewer (Device 1)                 Participant (Device 2)
┌─────────────────────┐                ┌─────────────────────┐
│ Opens:              │                │ Opens:              │
│ xyz-789.../         │                │ xyz-789.../         │
│ joinInterview       │                │ joinParticipant     │
└─────────────────────┘                └─────────────────────┘
         │                                      │
         │  1. Creates Room                    │
         │     room-abc123                     │
         │                                     │
         │  2. Shares Link ─────────────────→  │
         │                                     │
         │                                     │  3. Joins Room
         │  ◄──────────────────────────────────│     room-abc123
         │                                     │
         │                                     │
         │  4. Sends Question                  │
         │  ──────────────────────────────────→│
         │                                     │
         │                                     │  5. Answers Question
         │  ◄──────────────────────────────────│
         │                                     │
         │  6. AI Evaluates                    │
         │     (on backend)                    │
         │                                     │
         │  7. Shows Score/Feedback            │
         │     (real-time)                     │
         │                                     │
         └─────────────────────────────────────┘

All communication via:
- Backend: https://abc-123.ngrok-free.app (Socket.IO, REST API)
- Frontend: https://xyz-789.ngrok-free.app (UI)
```

---

## Setup Timeline

```
Preparation Phase (Before Demo Day)
────────────────────────────────────
│
├─ Install Dependencies
│  ├─ backend: npm install
│  └─ frontend: npm install
│
├─ Test Locally
│  ├─ Backend: http://localhost:5000
│  └─ Frontend: http://localhost:3000
│
└─ Verify Features
   ├─ Templates load
   ├─ Questions/Keywords work
   └─ Camera/Mic permissions OK

Demo Day (5-10 minutes before presentation)
───────────────────────────────────────────
│
├─ [1 min] Start Backend
│  └─ cd backend\node; npm run dev
│
├─ [1 min] Start Frontend
│  └─ cd frontend; npm start
│
├─ [2 min] Setup Ngrok Tunnels
│  ├─ Terminal 1: ngrok http 5000
│  │  └─ Copy: https://abc-123.ngrok-free.app
│  │
│  ├─ Create frontend\.env.local
│  │  └─ REACT_APP_BACKEND_URL=https://abc-123.ngrok-free.app
│  │
│  ├─ Restart Frontend (Ctrl+C, npm start)
│  │
│  └─ Terminal 2: ngrok http 3000
│     └─ Copy: https://xyz-789.ngrok-free.app
│
├─ [1 min] Verify Setup
│  ├─ Open: https://xyz-789.ngrok-free.app/templates
│  ├─ Check: No "Mixed Content" errors
│  └─ Test: Create/load template
│
└─ [Ready!] Share URLs
   ├─ Interviewer: https://xyz-789.ngrok-free.app/joinInterview
   └─ Participant: https://xyz-789.ngrok-free.app/joinParticipant?room=ID
```

---

## Terminal Windows Layout

```
┌─────────────────────────┐  ┌─────────────────────────┐
│ Terminal 1: Backend     │  │ Terminal 2: Frontend    │
│ ───────────────────────│  │ ───────────────────────│
│ PS> cd backend\node     │  │ PS> cd frontend         │
│ PS> npm run dev         │  │ PS> npm start           │
│                         │  │                         │
│ ✅ MongoDB connected    │  │ Compiled successfully!  │
│ 🚀 Server on :5000      │  │ localhost:3000          │
│                         │  │                         │
│ [Keep running]          │  │ [Keep running]          │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ Terminal 3: Backend     │  │ Terminal 4: Frontend    │
│            Ngrok        │  │            Ngrok        │
│ ───────────────────────│  │ ───────────────────────│
│ PS> ngrok http 5000     │  │ PS> ngrok http 3000     │
│                         │  │                         │
│ Forwarding:             │  │ Forwarding:             │
│ https://abc-123.ngrok   │  │ https://xyz-789.ngrok   │
│       ↓                 │  │       ↓                 │
│ localhost:5000          │  │ localhost:3000          │
│                         │  │                         │
│ [Keep running]          │  │ [Keep running]          │
└─────────────────────────┘  └─────────────────────────┘
```

---

## Environment Files Explained

```
frontend\.env (committed to git)
────────────────────────────────
# For local development
REACT_APP_BACKEND_URL=http://10.4.2.1:5000

Use when:
- Testing on same computer
- Testing on same WiFi network
- NOT for ngrok/HTTPS demo


frontend\.env.local (NOT committed - in .gitignore)
───────────────────────────────────────────────────
# For ngrok demo
REACT_APP_BACKEND_URL=https://abc-123.ngrok-free.app

Use when:
- Demo with 2 devices via internet
- Supervisor presentation
- HTTPS required

Note: .env.local overrides .env
Create this file ONLY for ngrok demos
Delete after demo to go back to local development
```

---

## Checklist Format

```
✅ = Done/Working
❌ = Error/Not working  
⏳ = In progress
⚠️ = Warning/Check this

Before Demo:
[ ] Backend running
[ ] Frontend running
[ ] Backend ngrok tunnel active
[ ] Frontend .env.local created
[ ] Frontend restarted
[ ] Frontend ngrok tunnel active

Test on same device:
[ ] Open frontend ngrok URL
[ ] No Mixed Content errors (F12)
[ ] Templates load
[ ] Socket.IO connected
[ ] Room ID generates

Test on 2nd device:
[ ] Participant link works
[ ] Video/audio visible
[ ] Questions received
[ ] Answers submitted
[ ] Scores displayed
```

---

## Quick Fix Commands

```bash
# Kill all node processes (if servers stuck)
Get-Process node | Stop-Process -Force

# Check if ports are in use
netstat -ano | Select-String ":5000"
netstat -ano | Select-String ":3000"

# Restart backend
cd backend\node
npm run dev

# Restart frontend
cd frontend
npm start

# Start ngrok for backend
ngrok http 5000

# Start ngrok for frontend
ngrok http 3000

# View frontend .env files
cat frontend\.env
cat frontend\.env.local

# Create/edit frontend .env.local
notepad frontend\.env.local
```
