# 🚨 INSTRUCTIONS FOR ANADA (PARTICIPANT)

## ❌ ERROR: "localhost refused to connect"

### Why This Happens:
You received a link with `localhost` in it. **This is wrong!**
- `localhost` only works on the SAME computer
- You need a link with the interviewer's **IP address**

---

## ✅ CORRECT LINK FORMAT

You need a link that looks like this:

```
http://192.168.107.175:3000/joinParticipant?room=ROOM_ID
```

**NOT** like this:
```
❌ http://localhost:3000/joinParticipant?room=ROOM_ID
```

---

## 📋 STEPS TO JOIN THE INTERVIEW

### Step 1: Make Sure You're on the Same Wi-Fi
- Check that you're connected to the **SAME Wi-Fi network** as the interviewer
- Ask the interviewer which Wi-Fi network they are using
- Connect to that network on your laptop

### Step 2: Test Connection to Interviewer's Computer

Open **Command Prompt** or **PowerShell** and type:
```
ping 192.168.107.175
```

**Expected Result:**
```
Reply from 192.168.107.175: bytes=32 time=1ms TTL=128
Reply from 192.168.107.175: bytes=32 time=1ms TTL=128
```

**If you see "Request timed out":**
- You're not on the same network
- Or the interviewer's firewall is blocking you

### Step 3: Get the Correct Link

**Ask the interviewer to:**
1. Open this page on their computer: `http://192.168.107.175:3000/JoinInterview`
2. Click "Generate Room ID" button
3. Copy the **participant link** that appears on the screen
4. Send you that COMPLETE link

**The link should look exactly like:**
```
http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr
```

### Step 4: Open the Link in Your Browser

1. Copy the link the interviewer sent you
2. Open **Chrome** or **Microsoft Edge** browser (recommended)
3. Paste the complete link in the address bar
4. Press Enter

### Step 5: Join the Room

1. You should see a "Join Interview" page with the Room ID already filled
2. Click the **"Join Interview Room"** button
3. Allow camera and microphone permissions when browser asks
4. You should now be connected to the video call!

---

## 🔍 TROUBLESHOOTING

### Problem: "Can't reach this page"

**Solution 1: Check the Link**
- Make sure the link starts with `http://192.168.107.175:3000`
- NOT `http://localhost:3000`

**Solution 2: Verify Network**
```
ping 192.168.107.175
```
Should get replies. If not, you're on different networks.

**Solution 3: Try the Direct IP**
Just type this in your browser:
```
http://192.168.107.175:3000
```
If this works, you can manually go to "Join Participant" page.

### Problem: "Page loads but video doesn't work"

**Solution:**
1. Press **F12** to open Developer Tools
2. Look for errors in the Console tab
3. Take a screenshot and send to the interviewer

### Problem: "Connection failed"

**Check:**
- Camera/microphone permissions granted?
- Using Chrome or Edge browser?
- No VPN active on your computer?

---

## 📱 QUICK CHECKLIST

Before joining:
- [ ] Connected to same Wi-Fi as interviewer
- [ ] Can ping `192.168.107.175` successfully
- [ ] Have the correct link (with IP, not localhost)
- [ ] Using Chrome or Edge browser
- [ ] No VPN or proxy active

---

## 🆘 STILL NOT WORKING?

Contact the interviewer and tell them:

1. "I can ping your IP address" (yes/no)
2. "The page loads but..." (describe what you see)
3. Send screenshot of any error message
4. Send screenshot of browser console (F12 → Console tab)

---

## 📞 FOR THE INTERVIEWER

If participant still can't connect:

1. **Check your firewall:**
   ```powershell
   # Run as Administrator
   New-NetFirewallRule -DisplayName "Interview App - Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
   New-NetFirewallRule -DisplayName "Interview App - Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```

2. **Verify servers are running:**
   ```powershell
   netstat -ano | findstr ":5000 :3000"
   ```
   Should show LISTENING on both ports.

3. **Test from your own computer:**
   Open `http://192.168.107.175:3000` on your own browser
   Should work if everything is configured correctly.

---

**Remember:** The key is using `192.168.107.175` (IP address) instead of `localhost`!
