# 🚀 QUICK START - Join Interview (For Anada)

## ⚠️ You're seeing an error about HTTPS, right?

**This is normal!** Your browser needs special permission to use camera over HTTP.

---

## ✅ SIMPLE FIX (2 Minutes)

### Option 1: Use the PowerShell Script (EASIEST)

1. **Download** the file: `start-chrome-for-participant.ps1` (the interviewer should send it)

2. **Save it** on your Desktop

3. **Close ALL Chrome windows** completely

4. **Right-click** on the file → **"Run with PowerShell"**
   
   Or open PowerShell and run:
   ```powershell
   cd Desktop
   .\start-chrome-for-participant.ps1
   ```

5. **Enter the interview link** when asked:
   ```
   http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr
   ```

6. **Allow camera/mic** when Chrome asks

7. **Click "Join Interview Room"**

8. **Done!** ✅

---

### Option 2: Manual Chrome Command (If script doesn't work)

1. **Close ALL Chrome windows**

2. **Press `Windows + R`** (Run dialog)

3. **Copy and paste this ENTIRE line:**
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.107.175:3000" --user-data-dir="%LOCALAPPDATA%\ChromeDevSession" "http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr"
   ```

4. **Press Enter**

5. **Allow camera/mic** when Chrome asks

6. **Done!** ✅

---

### Option 3: Use Firefox (Alternative)

1. **Open Firefox**

2. **Type in address bar:** `about:config`

3. **Click** "Accept the Risk and Continue"

4. **Search for:** `media.devices.insecure.enabled`

5. **Toggle it to:** `true` (double-click it)

6. **Open the interview link:**
   ```
   http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr
   ```

7. **Allow camera/mic** permissions

8. **Done!** ✅

---

## 🎯 WHY THIS IS NEEDED

Browsers require **HTTPS** (secure connection) for camera/microphone when accessing from another computer. The methods above tell your browser to allow camera access for this specific testing site.

**This is safe** - it only affects this one website for testing purposes.

---

## ⚠️ TROUBLESHOOTING

### "Script execution is disabled"

Run this in PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then try the script again.

### "Chrome not found at that path"

Your Chrome might be in a different location. Try:
```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
```
Or ask the interviewer for help.

### Still not working?

**Check:**
1. Are you on the **same Wi-Fi** as the interviewer?
2. Can you ping them? `ping 192.168.107.175`
3. Did you **close ALL Chrome windows** before running?

---

## 📱 QUICK CHECKLIST

Before running the fix:
- [ ] Same Wi-Fi network as interviewer
- [ ] ALL Chrome windows closed
- [ ] Have the interview link ready

After running the fix:
- [ ] Chrome opens automatically (or you opened Firefox)
- [ ] Page loads with "Join Interview" screen
- [ ] Allow camera/mic permissions
- [ ] Click "Join Interview Room"
- [ ] Video call connects! 🎉

---

## 🆘 NEED HELP?

Send the interviewer:
- Screenshot of the error
- Which method you tried (Script/Manual/Firefox)
- Any messages you see

---

**TL;DR:** Use **Option 1** (PowerShell script) - it's the easiest! Just run it and paste the interview link. 🚀
