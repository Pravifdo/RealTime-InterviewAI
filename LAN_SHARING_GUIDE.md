# 🔗 How to Share Interview Links with Participants on Another Computer

## Problem Identified
When you share `http://localhost:3000/joinParticipant?room=room-gmh12sxpr` to another laptop, it doesn't work because:
- **`localhost`** only works on YOUR computer
- Other computers can't connect to "localhost" - they need your **network IP address**

---

## ✅ SOLUTION: Share Links Using Your IP Address

### Step 1: Find Your IP Address

Open PowerShell or Command Prompt and run:
```powershell
ipconfig
```

Look for **IPv4 Address** under your active network adapter (usually Wi-Fi or Ethernet).
Example: `192.168.107.175`

### Step 2: Update Frontend Configuration

**Option A: Edit `.env` file (Recommended)**

1. Open `frontend/.env` file
2. Comment out the localhost line:
   ```
   # REACT_APP_BACKEND_URL=http://localhost:5000
   ```
3. Uncomment and update the IP line:
   ```
   REACT_APP_BACKEND_URL=http://192.168.107.175:5000
   ```
   (Replace with YOUR actual IP address)

**Option B: Edit directly (Quick test)**
You can directly edit the files, but `.env` is cleaner.

### Step 3: Restart Frontend Server

**IMPORTANT:** You MUST restart the React app for `.env` changes to take effect!

```powershell
# Stop the current frontend server (Ctrl+C in the terminal)
# Then restart it:
cd frontend
npm start
```

### Step 4: Update Firewall Rules (Windows)

Allow Node.js through Windows Firewall:

**Automatic (Recommended):**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
New-NetFirewallRule -DisplayName "React Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**Manual:**
1. Open **Windows Defender Firewall** → Advanced Settings
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → **TCP** → Enter **5000** and **3000**
4. Allow the connection → Apply to all profiles → Name it "Interview App"

### Step 5: Share the Correct Link

**Instead of:**
```
❌ http://localhost:3000/joinParticipant?room=room-gmh12sxpr
```

**Share this:**
```
✅ http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr
```
(Replace `192.168.107.175` with YOUR IP address)

---

## 📋 Complete Testing Checklist

### On Your Computer (Host):
- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] You can access `http://localhost:3000/JoinInterview` (interviewer page)
- [ ] Firewall allows ports 3000 and 5000

### On Anada's Computer (Participant):
- [ ] Both computers are on the **same Wi-Fi network**
- [ ] Can ping your computer: `ping 192.168.107.175`
- [ ] Can access: `http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr`
- [ ] Can see the join screen and video feed

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to the server"

**Check 1: Network Connectivity**
```powershell
# On Anada's laptop, test if your computer is reachable:
ping 192.168.107.175
```

**Check 2: Backend is Running**
```powershell
# On your computer:
netstat -ano | findstr :5000
```
Should show LISTENING on port 5000.

**Check 3: Firewall**
- Temporarily disable Windows Firewall to test
- If it works, add firewall rules as shown above

### Issue: "Page loads but video doesn't work"

**Check Browser Console (F12):**
- Look for Socket.IO connection errors
- Look for WebRTC errors

**Common Causes:**
- Backend URL mismatch in `.env`
- CORS issues (already configured in `server.js`)
- Camera/microphone permissions denied

### Issue: "Different Room IDs"

Make sure:
- You generate the Room ID on the **interviewer page** (`/JoinInterview`)
- You copy the EXACT Room ID to share
- The participant uses the COMPLETE link with `?room=` parameter

---

## 🚀 Quick Start Commands

### Start Backend (in one terminal):
```powershell
cd backend\node
npm run dev
```

### Start Frontend (in another terminal):
```powershell
cd frontend
npm start
```

### Generate Share Link:
1. Open `http://YOUR_IP:3000/JoinInterview` on your browser
2. Click "Generate Room ID"
3. Copy the participant link shown on screen
4. Share that link with Anada

---

## 📱 Network Requirements

Both computers MUST be on the **same network**:
- Same Wi-Fi network, OR
- Connected via LAN cable to same router

**Will NOT work if:**
- One computer uses mobile hotspot and other uses Wi-Fi
- Different Wi-Fi networks
- VPN is active on either computer
- Guest network isolation is enabled

---

## 🔐 Security Notes

- This setup works on **Local Area Network (LAN)** only
- For internet access (WAN), you would need:
  - Port forwarding on your router
  - Dynamic DNS or static IP
  - HTTPS with SSL certificates
  - STUN/TURN servers for WebRTC

---

## Example Workflow

### Your Computer (192.168.107.175):
1. Start backend: `cd backend\node && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Open: `http://192.168.107.175:3000/JoinInterview`
4. Generate Room ID: `room-gmh12sxpr`
5. Copy participant link: `http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr`
6. Share this link with Anada

### Anada's Computer:
1. Receive link: `http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr`
2. Click the link in browser
3. Click "Join Interview Room"
4. Video call should connect!

---

## Files Changed

✅ `frontend/.env` - Backend URL configuration
✅ `frontend/src/pages/joinParticipant.js` - Dynamic backend URL
✅ `frontend/src/pages/JoinInterview.js` - Dynamic backend URL

All files now use `process.env.REACT_APP_BACKEND_URL` which reads from `.env` file.

---

## Need More Help?

If you still have issues, share:
1. Your IP address from `ipconfig`
2. Backend terminal output
3. Frontend terminal output
4. Browser console errors (F12) from Anada's computer
