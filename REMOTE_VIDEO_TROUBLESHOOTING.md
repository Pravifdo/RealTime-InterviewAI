# 🔧 Remote Video Not Showing - Troubleshooting Guide

## Issue Description
- Local video shows ✅
- Remote video is black/not showing ❌
- But you can see status updates (mute/unmute) ✅

This means:
- ✅ Socket.IO is working (state sync works)
- ❌ WebRTC video stream is not displaying

---

## 🎯 Quick Fix

### Solution 1: Restart Both Servers (Most Common Fix)

**Step 1: Stop Both Servers**
```powershell
# In both terminal windows, press: Ctrl + C
```

**Step 2: Clear Browser Cache**
```
Press: Ctrl + Shift + R (hard refresh)
Or: Ctrl + Shift + Delete → Clear cache
```

**Step 3: Restart Backend**
```powershell
cd backend/node
npm run dev
```

Wait for:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

**Step 4: Restart Frontend**
```powershell
cd frontend
npm start
```

**Step 5: Open in Browsers**
1. Interviewer: `http://localhost:3000/join-interview`
2. Participant: `http://localhost:3000/join-participant`
3. Allow camera/mic on both

---

## 🔍 Debugging Steps

### Check Browser Console

**Open DevTools** (F12) and look for these messages:

#### ✅ What You SHOULD See:
```
Creating peer connection...
Adding local tracks to peer connection
Adding track: video
Adding track: audio
Socket ljKnKo2h joined room interview-room
User joined: xyz123
Starting call as initiator
Sending offer
Received offer
Sending answer
🎥 Received remote track: video
🎥 Received remote track: audio
Remote streams: [MediaStream]
Setting remote video stream to element
Remote stream tracks: [MediaStreamTrack, MediaStreamTrack]
Connection state: connected
```

#### ❌ Problems to Look For:

**Problem 1: No local stream**
```
No local stream available when creating peer connection!
```
**Fix:** Local stream not ready. Wait and retry.

**Problem 2: No remote track received**
```
// Missing: "🎥 Received remote track"
```
**Fix:** WebRTC connection failed. Check network/firewall.

**Problem 3: Connection failed**
```
Connection state: failed
ICE connection state: failed
```
**Fix:** NAT/firewall issue. Try on same network.

---

## 🛠️ Solutions by Error Type

### Error Type 1: "Waiting for local stream..."

**Cause:** Local camera not ready when WebRTC starts

**Fix:**
1. Close both pages
2. Refresh browser (Ctrl + Shift + R)
3. Open Participant page FIRST
4. Wait 2 seconds
5. Then open Interviewer page
6. Allow camera/mic on both

### Error Type 2: No "Received remote track" message

**Cause:** WebRTC negotiation failed

**Fix:**
```powershell
# Check backend terminal for:
Socket xyz joined room interview-room
```

If you DON'T see "joined room", then:
1. Restart backend server
2. Hard refresh browser pages

### Error Type 3: "Remote stream is null"

**Cause:** Peer connection not established

**Fix:**
1. Make sure BOTH users are in the SAME room
2. Check backend logs for room joining
3. Verify both pages show "● Connected" badge

---

## 📋 Step-by-Step Debug Process

### Step 1: Check Local Video
- [ ] Interviewer sees their own video?
- [ ] Participant sees their own video?

If NO → Camera permission issue. Fix permissions first.

### Step 2: Check Socket Connection
- [ ] Backend shows "User connected: xyz"?
- [ ] Backend shows "joined room interview-room"?

If NO → Socket.IO connection issue. Restart backend.

### Step 3: Check WebRTC Logs
- [ ] Console shows "Creating peer connection"?
- [ ] Console shows "Adding track: video"?
- [ ] Console shows "Sending offer" or "Received offer"?

If NO → WebRTC not starting. Check local stream is ready.

### Step 4: Check Remote Stream
- [ ] Console shows "🎥 Received remote track"?
- [ ] Console shows "Setting remote video stream to element"?

If NO → Tracks not being sent. Check peer connection.

### Step 5: Check Video Element
- [ ] Remote video element exists in DOM?
- [ ] srcObject is set?

If NO → React rendering issue. Refresh page.

---

## 🎯 Most Common Issues & Quick Fixes

### Issue #1: Order of Operations
**Problem:** Participant joins before interviewer

**Fix:**
```
1. Close both pages
2. Open INTERVIEWER page first
3. Wait for local video
4. Then open PARTICIPANT page
5. Wait for connection
```

### Issue #2: Stale WebRTC Connection
**Problem:** Previous connection not cleaned up

**Fix:**
```
1. Close all browser tabs
2. Restart backend (Ctrl+C, then npm run dev)
3. Hard refresh frontend (Ctrl+Shift+R)
4. Open pages in new tabs
```

### Issue #3: Browser Cache
**Problem:** Old JavaScript code cached

**Fix:**
```
1. Press F12 (DevTools)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

### Issue #4: Firewall/Network
**Problem:** WebRTC ports blocked

**Fix:**
```
1. Disable firewall temporarily
2. Or ensure both on same WiFi network
3. Or use localhost (same computer, different browsers)
```

---

## 🔄 Complete Reset Procedure

If nothing works, do a complete reset:

### Step 1: Stop Everything
```powershell
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)
# Close all browser tabs
```

### Step 2: Clear Everything
```powershell
# In backend/node directory:
rm -rf node_modules
npm install

# In frontend directory:
rm -rf node_modules
npm install
```

### Step 3: Clear Browser
```
1. Press Ctrl + Shift + Delete
2. Clear "Cached images and files"
3. Clear "Cookies and site data"
4. Close browser completely
```

### Step 4: Fresh Start
```powershell
# Terminal 1:
cd backend/node
npm run dev

# Terminal 2:
cd frontend
npm start

# Open browser in incognito mode
# Test with two different browsers (Chrome + Firefox)
```

---

## 🎥 Expected Flow (When Working)

### Interviewer Opens First:
```
1. Page loads
2. Camera permission requested
3. User allows
4. Local video shows ✅
5. "Waiting for participant..."
6. Participant joins
7. Backend: "User joined"
8. Interviewer: Creates offer
9. WebRTC: Exchange ICE candidates
10. Remote video appears ✅
11. "● Connected" badge shows
```

### Participant Opens Second:
```
1. Page loads
2. Camera permission requested
3. User allows
4. Local video shows ✅
5. Backend: "User joined"
6. Receives offer from interviewer
7. Creates answer
8. WebRTC: Exchange ICE candidates
9. Remote video appears ✅
10. "● Connected" badge shows
```

---

## 📊 Debug Checklist

Use this checklist to diagnose:

**Backend:**
- [ ] Server running on port 5000
- [ ] MongoDB connected
- [ ] Socket.IO initialized
- [ ] Seeing "User connected" messages
- [ ] Seeing "joined room interview-room" messages

**Frontend (Interviewer):**
- [ ] Page loads without errors
- [ ] Camera permission granted
- [ ] Local video showing
- [ ] Console: "Creating peer connection"
- [ ] Console: "Adding track: video"
- [ ] Console: "User joined"
- [ ] Console: "Sending offer"
- [ ] Console: "🎥 Received remote track"
- [ ] Remote video showing
- [ ] "● Connected" badge visible

**Frontend (Participant):**
- [ ] Page loads without errors
- [ ] Camera permission granted
- [ ] Local video showing
- [ ] Console: "Creating peer connection"
- [ ] Console: "Adding track: video"
- [ ] Console: "Received offer"
- [ ] Console: "Sending answer"
- [ ] Console: "🎥 Received remote track"
- [ ] Remote video showing
- [ ] "● Connected" badge visible

---

## 🎯 Quick Test

### Minimal Test (Same Computer):

1. **Open Chrome:**
   - Go to: `http://localhost:3000/join-interview`
   - Allow camera
   - See your video

2. **Open Firefox:**
   - Go to: `http://localhost:3000/join-participant`
   - Allow camera
   - See your video

3. **Wait 3-5 seconds**

4. **Check:**
   - Chrome should show Firefox's video
   - Firefox should show Chrome's video
   - Both should show "● Connected"

If this works → System is working!  
If not → Check console logs for errors

---

## 🆘 Still Not Working?

### Last Resort Fixes:

1. **Try Different Browsers:**
   - Chrome + Firefox ✅
   - Chrome + Edge ✅
   - Same browser, different profiles ✅

2. **Check Code Changes:**
   - Make sure all files are saved
   - Check if useWebRTC.js exists
   - Verify imports are correct

3. **Network Issues:**
   - Both on same WiFi
   - No VPN active
   - Firewall allows localhost

4. **Browser Issues:**
   - Update to latest version
   - Clear all data
   - Try incognito mode

---

## 📝 Report Issue

If still failing, collect this info:

```
Browser: [Chrome/Firefox/Edge]
Console Errors: [copy error messages]
Backend Logs: [copy terminal output]
Network Tab: [check WebSocket connection]

Paste in issue or send for help!
```

---

**Most issues are fixed by restarting servers + hard refresh! 🔄**
