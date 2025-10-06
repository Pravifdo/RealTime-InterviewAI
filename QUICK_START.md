# 🚀 Quick Start Guide - Real-Time Interview System

## ✅ Prerequisites
- Node.js (v14+)
- Modern browser (Chrome/Firefox/Edge recommended)
- Camera and microphone

## 📦 Installation

### 1. Backend Setup
```powershell
cd backend/node
npm install
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
```

## ▶️ Running the Application

### Step 1: Start Backend Server
```powershell
cd backend/node
npm run dev
```
✅ Server should start on `http://localhost:5000`

### Step 2: Start Frontend
```powershell
cd frontend
npm start
```
✅ Frontend should open on `http://localhost:3000`

## 🎯 Using the Application

### Interviewer (Host)
1. Navigate to: `http://localhost:3000/join-interview`
2. **Allow camera/microphone permissions** when prompted
3. Wait for participant to join (you'll see "Connected" indicator)
4. Click **"Start Interview"** button to begin timer
5. Your camera appears on the left, participant's on the right
6. Use controls:
   - 🎤 Microphone toggle
   - 📹 Camera toggle
   - ⏱ View live timer
   - 📝 Send questions to participant
   - ⛔ End interview when done

### Participant (Candidate)
1. Navigate to: `http://localhost:3000/join-participant`
2. **Allow camera/microphone permissions** when prompted
3. Connection establishes automatically
4. Your camera appears on the left, interviewer's on the right
5. Use controls:
   - 🎤 Microphone toggle
   - 📹 Camera toggle
   - ⏱ View live timer
   - 📋 View questions from interviewer
   - ✍️ Send answers

## 🧪 Testing Bilateral Video

### Option 1: Two Browser Windows
1. Open **Chrome** → Navigate to interviewer page
2. Open **Firefox** → Navigate to participant page
3. Both should connect and see each other's video

### Option 2: Two Tabs (Same Browser)
1. Tab 1: `http://localhost:3000/join-interview`
2. Tab 2: `http://localhost:3000/join-participant`
3. Both tabs will connect (note: camera may be locked to one tab)

### Option 3: Two Devices
1. Device 1: Interviewer page
2. Device 2: Participant page (on same network)
3. Perfect real-world test scenario

## ✨ Features You Can Test

### 1. Video Streaming
- ✅ See yourself in the local video
- ✅ See remote participant in the remote video
- ✅ Both feeds run simultaneously

### 2. Camera Toggle
- ✅ Click camera button to turn off
- ✅ Video goes black locally
- ✅ Remote peer sees "Cam: ❌ Off" status

### 3. Microphone Toggle
- ✅ Click mic button to mute
- ✅ Remote peer sees "Mic: ❌ Off" status

### 4. Live Timer
- ✅ Interviewer starts meeting
- ✅ Timer updates every second
- ✅ Both sides show same time

### 5. Questions & Answers
- ✅ Interviewer types and sends question
- ✅ Participant receives and sees question
- ✅ Participant sends answer
- ✅ Real-time, no refresh needed

### 6. End Interview
- ✅ Interviewer clicks "End Interview"
- ✅ Both sides receive notification
- ✅ Timer stops and resets

## 🔧 Troubleshooting

### Camera/Mic Not Working
**Problem:** Permission denied error appears

**Solution:**
1. Click the 🔒 lock icon in browser address bar
2. Set Camera and Microphone to "Allow"
3. Refresh the page

### Videos Not Connecting
**Problem:** "Connected" indicator doesn't appear

**Solution:**
1. Check if both users opened their pages
2. Wait 5-10 seconds for WebRTC negotiation
3. Check browser console for errors (F12)
4. Ensure backend is running on port 5000

### Timer Not Starting
**Problem:** Timer stays at 00:00

**Solution:**
1. Click "Start Interview" button as interviewer
2. Check backend terminal for "Meeting started" message
3. Verify Socket.IO connection in browser console

### Port Already in Use
**Problem:** Backend won't start - "EADDRINUSE"

**Solution:**
```powershell
# Kill process using port 5000
taskkill /F /IM node.exe

# Or change port in backend/.env
PORT = 5001
```

## 📱 Browser Compatibility

### ✅ Fully Supported
- Chrome 80+
- Firefox 75+
- Edge 80+
- Safari 14+

### ⚠️ Limited Support
- Older browser versions may have WebRTC issues
- Mobile browsers work but may have permission issues

## 🔒 Security Notes

### Development Mode
- ✅ Works on localhost
- ✅ HTTP is allowed for localhost

### Production Deployment
- ⚠️ **HTTPS is REQUIRED** for WebRTC
- Get SSL certificate (Let's Encrypt)
- Configure secure Socket.IO connection

## 🎓 What Happens Behind the Scenes

```
1. User opens page
   └─ Requests camera/microphone access

2. Permission granted
   └─ Local video stream created

3. Join room via Socket.IO
   └─ Both users in "interview-room"

4. WebRTC Negotiation
   ├─ Interviewer creates offer
   ├─ Participant creates answer
   └─ ICE candidates exchanged

5. Direct P2P Connection Established
   └─ Video/audio flows directly between users

6. Real-time State Sync
   ├─ Camera toggles → Socket.IO broadcast
   ├─ Mic toggles → Socket.IO broadcast
   └─ Timer updates → Socket.IO broadcast
```

## 🎉 Success Indicators

You know it's working when you see:
- ✅ Green "● Connected" badge appears
- ✅ Both video feeds are live
- ✅ Toggling camera shows immediate update
- ✅ Timer counts up in real-time
- ✅ Questions/answers appear instantly

## 📊 Expected Performance

- **Latency:** < 500ms (local network)
- **Video Quality:** 720p @ 30fps (depends on camera)
- **Audio Quality:** 48kHz stereo
- **CPU Usage:** Moderate (5-15% per video stream)

## 🆘 Still Having Issues?

1. Check browser console (F12) for errors
2. Check backend terminal for connection logs
3. Verify firewall isn't blocking port 5000
4. Try incognito/private mode
5. Clear browser cache and cookies

## 🎯 Next Steps

Once basic video works, you can:
1. Add screen sharing
2. Implement session recording
3. Add authentication
4. Deploy to production
5. Add analytics/monitoring

---

**Enjoy your Zoom-like interview system! 🎊**
