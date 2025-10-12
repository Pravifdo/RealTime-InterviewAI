# 🔍 Quick Debug Guide - Remote Video Not Showing

## Current Situation:
✅ Socket.IO working (you see mute status updates)
❌ Remote video not displaying
✅ Local video working

This means WebRTC media stream is not flowing properly.

---

## 🚀 FASTEST FIX (Try This First):

### Option 1: Kill Node Processes Properly

**Windows Command Prompt (Run as Administrator):**
```cmd
taskkill /F /IM node.exe /T
```

**Then restart in this EXACT order:**

**Terminal 1 - Backend:**
```powershell
cd C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\backend\node
npm run dev
```
Wait for: `🚀 Server running on http://localhost:5000`

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\frontend
npm start
```
Wait for: `Compiled successfully!`

**Browser:**
1. Close ALL browser tabs
2. Clear cache: `Ctrl + Shift + Delete` → Check "Cached images and files" → Clear
3. Open Chrome: `http://localhost:3000/join-interview` → Allow camera/mic → **WAIT 5 seconds**
4. Open Firefox: `http://localhost:3000/join-participant` → Allow camera/mic → **WAIT 10 seconds**
5. Press F12 on both → Check Console

---

## 🔍 What to Look For in Console:

### ✅ GOOD - You should see ALL of these:
```
🎬 Local stream ready, creating peer connection
Creating peer connection...
Adding local tracks to peer connection
Adding track: video
Adding track: audio
Joining room: interview-room
User joined: [socket-id]
Sending offer (or Received offer)
🎥 Received remote track: video
🎥 Received remote track: audio
Setting remote stream
Remote stream tracks: [MediaStreamTrack, MediaStreamTrack]
Connection state: connected
```

### ❌ BAD - Problems to identify:

**Problem 1: No "🎬 Local stream ready"**
```
Missing: "🎬 Local stream ready, creating peer connection"
```
**Meaning:** Camera not initialized
**Fix:** Refresh page and allow camera permissions

---

**Problem 2: No "🎥 Received remote track"**
```
Missing: "🎥 Received remote track: video"
```
**Meaning:** WebRTC peer connection not receiving tracks
**Fix:** Check backend logs for "joined room" messages. If missing, restart backend.

---

**Problem 3: "Connection state: failed"**
```
Connection state: failed
ICE connection state: failed
```
**Meaning:** Network/NAT traversal issue
**Fix:** Both users must be on same WiFi network, or disable firewall temporarily

---

**Problem 4: Remote stream is null**
```
Remote stream updated: null
```
**Meaning:** ontrack event not firing or stream not being set
**Fix:** Peer connection created too late. Already fixed in latest code - just need to restart servers.

---

## 🎯 Common Causes & Solutions:

### Cause 1: Stale Server Process
**Symptom:** "EADDRINUSE: address already in use :::5000"
**Solution:**
```powershell
# Kill all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Or use Task Manager:
# Ctrl+Shift+Esc → Details → Find "node.exe" → End Task (for all)
```

### Cause 2: Browser Cache
**Symptom:** Old code running even after changes
**Solution:**
```
1. Close all browser tabs
2. Press Ctrl+Shift+Delete
3. Select "Cached images and files"
4. Click "Clear data"
5. Close browser completely
6. Reopen and try again
```

### Cause 3: Wrong Page Order
**Symptom:** Participant joins before interviewer
**Solution:**
```
ALWAYS open pages in this order:
1. Interviewer page FIRST (wait for local video)
2. Participant page SECOND (after 5 seconds)
```

### Cause 4: Peer Connection Created Too Late
**Symptom:** ontrack handler not set up when tracks arrive
**Solution:** Already fixed in latest `useWebRTC.js`! Just restart servers.

---

## 📊 Full Diagnostic Checklist:

### Backend Checks:
- [ ] Backend running on port 5000 (no EADDRINUSE error)
- [ ] See "MongoDB connected" message
- [ ] See "Socket.io is running" message
- [ ] See "User connected: [socket-id]" when page loads
- [ ] See "Socket [id] joined room interview-room" messages

### Frontend Checks (Interviewer):
- [ ] Page loads without errors
- [ ] Camera permission granted (not blocked)
- [ ] Local video showing your face
- [ ] Console shows "🎬 Local stream ready"
- [ ] Console shows "Creating peer connection"
- [ ] Console shows "Joining room: interview-room"
- [ ] Console shows "User joined" after participant connects
- [ ] Console shows "Sending offer"
- [ ] Console shows "🎥 Received remote track: video"
- [ ] Console shows "Setting remote stream"
- [ ] "● Connected" badge visible
- [ ] Remote video element exists in DOM
- [ ] Remote video shows participant's face

### Frontend Checks (Participant):
- [ ] Page loads without errors
- [ ] Camera permission granted
- [ ] Local video showing
- [ ] Console shows "🎬 Local stream ready"
- [ ] Console shows "Creating peer connection"
- [ ] Console shows "Joining room: interview-room"
- [ ] Console shows "Received offer"
- [ ] Console shows "Sending answer"
- [ ] Console shows "🎥 Received remote track: video"
- [ ] Console shows "Setting remote stream"
- [ ] "● Connected" badge visible
- [ ] Remote video shows interviewer's face

---

## 🛠️ Advanced Debugging:

### Check if remote stream object exists:

**Add this temporarily to `JoinInterview.js` after line 60:**
```javascript
useEffect(() => {
  console.log('=== REMOTE STREAM DEBUG ===');
  console.log('remoteStream:', remoteStream);
  if (remoteStream) {
    console.log('remoteStream.id:', remoteStream.id);
    console.log('remoteStream.active:', remoteStream.active);
    console.log('Video tracks:', remoteStream.getVideoTracks());
    console.log('Audio tracks:', remoteStream.getAudioTracks());
    remoteStream.getVideoTracks().forEach(track => {
      console.log('Video track enabled:', track.enabled);
      console.log('Video track muted:', track.muted);
      console.log('Video track readyState:', track.readyState);
    });
  }
  console.log('remoteVideoRef.current:', remoteVideoRef.current);
  if (remoteVideoRef.current) {
    console.log('Video element srcObject:', remoteVideoRef.current.srcObject);
  }
  console.log('=== END DEBUG ===');
}, [remoteStream]);
```

**Expected output if working:**
```
=== REMOTE STREAM DEBUG ===
remoteStream: MediaStream {id: "xyz123", active: true}
remoteStream.id: xyz123
remoteStream.active: true
Video tracks: [MediaStreamTrack {kind: "video", enabled: true}]
Audio tracks: [MediaStreamTrack {kind: "audio", enabled: true}]
Video track enabled: true
Video track muted: false
Video track readyState: live
remoteVideoRef.current: <video>
Video element srcObject: MediaStream {id: "xyz123"}
=== END DEBUG ===
```

---

## 🎥 Test the Fix I Made:

The fix I applied ensures the peer connection is created **as soon as the local stream is ready**, not after joining the room. This means:

1. ✅ Local tracks added immediately
2. ✅ `ontrack` handler set up and listening
3. ✅ When remote peer joins, tracks are caught
4. ✅ Remote video displays

**To test:**
1. Kill all Node processes completely
2. Restart backend + frontend
3. Clear browser cache (Ctrl+Shift+R)
4. Open interviewer page → wait for local video
5. Open participant page → wait 10 seconds
6. Check F12 console for "🎥 Received remote track"

---

## 🆘 If Still Not Working:

### Nuclear Option (Complete Reset):

```powershell
# 1. Stop everything
taskkill /F /IM node.exe /T

# 2. Clear npm cache
cd backend/node
npm cache clean --force

cd ../../frontend
npm cache clean --force

# 3. Reinstall dependencies (optional, only if desperate)
cd ../backend/node
rm -r node_modules
npm install

cd ../../frontend
rm -r node_modules
npm install

# 4. Clear browser completely
# Close browser → Clear all data → Restart computer

# 5. Fresh start
cd ../backend/node
npm run dev

# New terminal:
cd ../../frontend
npm start
```

---

## 📝 Report Back:

After restarting servers, copy these console logs:

**From Interviewer page (F12 Console):**
```
[Paste all console.log messages here]
```

**From Participant page (F12 Console):**
```
[Paste all console.log messages here]
```

**From Backend terminal:**
```
[Paste backend logs here]
```

This will help identify exactly where the WebRTC flow is breaking!

---

## ✅ Success Indicators:

You'll know it's working when:
1. ✅ Both videos show on interviewer page
2. ✅ Both videos show on participant page
3. ✅ "● Connected" badge appears on both
4. ✅ Mute/unmute updates in real-time
5. ✅ Timer syncs on both pages
6. ✅ No console errors

**The fix is already in the code - you just need to restart fresh!** 🚀
