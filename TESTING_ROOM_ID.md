# 🚀 Quick Start - Testing Room ID System

## How to Test the New Room ID Feature

### **Terminal Display Feature**

Every time you run the application, a **new unique Room ID** is generated and displayed in the browser console.

---

## 📝 Step-by-Step Testing

### **1. Start Backend Server**

```powershell
cd backend/node
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:5000
Socket.io is running
```

---

### **2. Start Frontend (Interviewer)**

```powershell
cd frontend
npm start
```

The app will open in your browser automatically.

---

### **3. Open Interviewer Page**

1. Navigate to: `http://localhost:3000/JoinInterview`
2. **Look for the GREEN BANNER at the top:**
   ```
   🔑 Room ID: room-abc123xyz  [Copy] 📋 Share this ID with the participant
   ```
3. **Open Browser Console (F12)** and you'll see:
   ```
   🔑 NEW ROOM ID GENERATED: room-abc123xyz
   📋 Share this Room ID with the participant to join
   ```

4. **Click the "Copy" button** - it will turn blue and say "Copied!"

---

### **4. Open Participant Page (Same or Different Device)**

#### **Option A: Same Computer (New Tab)**
1. Open a new browser tab
2. Navigate to: `http://localhost:3000/joinParticipant`
3. You'll see the **"Join Interview" screen**

#### **Option B: Different Device (Phone/Laptop)**
1. Make sure both devices are on the **same WiFi network**
2. On the participant device, go to: `http://[YOUR-IP]:3000/joinParticipant`
   - Find your IP: Run `ipconfig` in PowerShell
   - Look for "IPv4 Address" (e.g., `192.168.1.100`)
   - Full URL: `http://192.168.1.100:3000/joinParticipant`

---

### **5. Participant Joins the Room**

1. **Paste the Room ID** into the input field (or type it)
   - Example: `room-abc123xyz`
2. **Press Enter** or click **"Join Interview Room"**
3. You'll see:
   - Blue banner: `🔗 Connected to Room: room-abc123xyz`
   - The participant dashboard with video feeds

**Console Output:**
```
🔗 Attempting to join room: room-abc123xyz
🔗 Joined Room: room-abc123xyz
```

---

### **6. Allow Camera/Microphone Permissions**

Both interviewer and participant will be asked to allow camera/mic access.

**Click "Allow"** on both sides.

---

### **7. Verify Connection**

✅ **You should now see:**
- Interviewer sees their own camera + participant's camera
- Participant sees their own camera + interviewer's camera
- Both can hear each other
- Video streams in real-time

**Green "● LIVE" indicators** should appear on both video feeds.

---

## 🔄 Testing Multiple Rooms

To test multiple simultaneous interviews:

### **Setup**

1. **Open Interviewer 1** in Browser 1
   - Room ID: `room-abc123`
   
2. **Open Interviewer 2** in Browser 2 (Incognito/Private mode)
   - Room ID: `room-xyz789`

3. **Open Participant 1** in Browser 3
   - Join: `room-abc123`

4. **Open Participant 2** in Browser 4
   - Join: `room-xyz789`

### **Expected Result**

✅ Two completely separate interview sessions:
- Interview 1: Interviewer 1 ↔ Participant 1 (room-abc123)
- Interview 2: Interviewer 2 ↔ Participant 2 (room-xyz789)
- They cannot see/hear each other

---

## 📱 Testing on Phone

### **Interviewer on Laptop + Participant on Phone**

1. **Laptop (Interviewer):**
   - Open: `http://localhost:3000/JoinInterview`
   - Copy Room ID

2. **Find Your Computer's IP:**
   ```powershell
   ipconfig
   ```
   Look for: `IPv4 Address: 192.168.1.100` (example)

3. **Phone (Participant):**
   - Connect to **same WiFi**
   - Open browser
   - Go to: `http://192.168.1.100:3000/joinParticipant`
   - Enter the Room ID
   - Join!

---

## 🖥️ Console Outputs to Watch

### **Interviewer Console (F12)**
```javascript
🔑 NEW ROOM ID GENERATED: room-abc123xyz
📋 Share this Room ID with the participant to join
🎬 Local stream ready, creating peer connection
Creating peer connection...
Joining room: room-abc123xyz
User joined: [participant-socket-id]
Starting call as initiator
Sending offer
✅ Setting remote video stream to element
▶️ Remote video started playing
```

### **Participant Console (F12)**
```javascript
🔗 Attempting to join room: room-abc123xyz
🔗 Joined Room: room-abc123xyz
Joining room: room-abc123xyz
Received offer
Sending answer
✅ Setting remote video stream to element
▶️ Remote video started playing
```

---

## ✅ Verification Checklist

**Interviewer Side:**
- [ ] Green banner shows Room ID
- [ ] Copy button works
- [ ] Room ID logged in console
- [ ] Local camera shows
- [ ] Participant's camera appears when they join
- [ ] Audio works
- [ ] Can send questions

**Participant Side:**
- [ ] Join screen appears
- [ ] Can enter Room ID
- [ ] Join button works
- [ ] Blue banner shows after joining
- [ ] Room ID logged in console
- [ ] Local camera shows
- [ ] Interviewer's camera appears
- [ ] Audio works
- [ ] Can send answers

**Both Sides:**
- [ ] Mic mute/unmute works
- [ ] Camera on/off works
- [ ] Visual indicators sync (Camera Off overlay, Mic Muted badge)
- [ ] Interview timer works
- [ ] Connection status shows "Connected"

---

## 🐛 Common Issues

### **"Room ID not showing"**
- Refresh the page
- Check console for errors

### **"Participant can't connect"**
- Verify Room ID is correct (no typos)
- Both must use same Room ID exactly
- Check if backend server is running

### **"No video/audio"**
- Allow camera/mic permissions
- Check if devices are working
- Try refreshing both pages

### **"Different device not connecting"**
- Verify both on same network
- Use correct IP address
- Check firewall settings

---

## 🎯 Expected Terminal Output

### **Backend Terminal (Node Server)**
```
User connected: [socket-id-1]
Socket [socket-id-1] joined room room-abc123xyz
User connected: [socket-id-2]
Socket [socket-id-2] joined room room-abc123xyz
Interviewer updated { camOn: true, micOn: true }
Participant updated { camOn: true, micOn: true }
Meeting started
```

### **Frontend Terminal (React)**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

---

## 📊 Success Indicators

✅ **New Room ID generated every time** - Check console  
✅ **Room ID visible in UI** - Green banner for interviewer  
✅ **Copy functionality works** - Button turns blue  
✅ **Participant can join** - Enter Room ID and connect  
✅ **Video streams working** - Both cameras visible  
✅ **Audio transmission** - Can hear each other  
✅ **Multiple rooms possible** - Different Room IDs = separate sessions  

---

## 🎉 You're All Set!

The Room ID system is now working! Each interview gets a unique room, and you can run multiple interviews simultaneously.

**Happy Testing!** 🚀🎥

---

**Need Help?**
- Check browser console for detailed logs
- Verify all services are running
- Test with simple room IDs first (e.g., "test123")
