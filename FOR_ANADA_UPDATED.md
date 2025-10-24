# 🎥 HOW TO JOIN THE INTERVIEW - UPDATED INSTRUCTIONS

## Hi Anada! 👋

You were getting the error because browsers require **secure HTTPS connection** for camera/microphone when accessing from another computer.

Here's the **EASY FIX**:

---

## ✅ SOLUTION: Use Chrome with Special Settings

### Step 1: Download the Script

Ask the interviewer to send you this file:
```
start-chrome-for-participant.ps1
```

Save it on your Desktop.

### Step 2: Close ALL Chrome Windows

Make sure Chrome is completely closed (check taskbar).

### Step 3: Run the Script

1. Right-click on `start-chrome-for-participant.ps1`
2. Click **"Run with PowerShell"**

**Or** open PowerShell and run:
```powershell
cd Desktop
.\start-chrome-for-participant.ps1
```

### Step 4: Enter the Interview Link

The script will ask for the interview link. Paste:
```
http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr
```

Press Enter.

### Step 5: Join the Interview

1. Chrome will open automatically with the interview page
2. Click **"Join Interview Room"** button
3. Click **"Allow"** when asked for camera and microphone permissions
4. You're connected! 🎉

---

## 🔍 ALTERNATIVE METHOD (If Script Doesn't Work)

### Manual Chrome Start:

1. Close ALL Chrome windows

2. Press `Windows + R` to open Run dialog

3. Copy and paste this **entire line**:
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.107.175:3000" --user-data-dir="%LOCALAPPDATA%\ChromeDevSession"
   ```

4. Press Enter

5. In the Chrome that opens, go to:
   ```
   http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr
   ```

6. Join the interview as normal

---

## 📱 CHECKLIST BEFORE JOINING

- [ ] Connected to same Wi-Fi as interviewer
- [ ] Can ping interviewer: `ping 192.168.107.175` (should get replies)
- [ ] ALL Chrome windows closed
- [ ] Have the correct interview link (with IP, not localhost)
- [ ] Camera and microphone are working on your computer

---

## ⚠️ IMPORTANT NOTES

1. **This Chrome session is for testing only**
   - Use regular Chrome for normal browsing
   - This special Chrome uses separate profile

2. **Close after interview**
   - Exit this Chrome when interview is done
   - Open regular Chrome for other work

3. **Security is fine**
   - This is safe for your local network
   - Don't use this setting for public internet sites

---

## 🔧 TROUBLESHOOTING

### "Script execution is disabled"

PowerShell might block the script. Fix:

1. Open PowerShell **as Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` and press Enter
4. Try running the script again

### "Chrome not found"

If Chrome is installed elsewhere:

1. Open PowerShell
2. Run:
   ```powershell
   Get-ChildItem "C:\Program Files" -Filter "chrome.exe" -Recurse -ErrorAction SilentlyContinue
   ```
3. Note the path
4. Edit the script and update `$chromePath` variable

### Still getting camera error?

Try Firefox instead:

1. Open Firefox
2. Type in address bar: `about:config`
3. Click "Accept the Risk and Continue"
4. Search: `media.devices.insecure.enabled`
5. Click the toggle to set it to `true`
6. Open the interview link

---

## 🆘 STILL NOT WORKING?

Send the interviewer:

1. Screenshot of any error message
2. Screenshot of browser console (Press F12 → Console tab)
3. Result of: `ping 192.168.107.175`
4. Your Windows version and Chrome version

---

## 📝 SUMMARY

The issue is: **Browsers require HTTPS for camera/microphone over network**

The fix is: **Use Chrome with special flag that allows HTTP for testing**

**Steps:**
1. Close ALL Chrome windows
2. Run `start-chrome-for-participant.ps1` script
3. Enter interview link when asked
4. Allow camera/mic permissions
5. Join the interview!

---

## ✅ YOU'RE READY!

Once you complete the steps above, you should be able to join the interview successfully. The video and audio will work perfectly! 🎉

Good luck with your interview! 👍
