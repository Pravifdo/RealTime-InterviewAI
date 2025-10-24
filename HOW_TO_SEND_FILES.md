# 📤 HOW TO SEND FILES TO ANADA

## 🎯 You Need to Send Her These Files:

1. **`start-interview.bat`** - The main launcher (she double-clicks this)
2. **`QUICK_START_FOR_ANADA.md`** - Instructions (optional but helpful)
3. **The interview link** - In a message

---

## ✅ EASIEST METHODS

### **Method 1: Email** ⭐ RECOMMENDED

1. Open Gmail/Outlook
2. New email to Anada
3. Click "Attach files" (📎)
4. Select: `C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\start-interview.bat`
5. Type this message:

```
Hi Anada,

Download the attached file to join the interview.

STEPS:
1. Save "start-interview.bat" to your Desktop
2. Double-click it
3. Paste this link when asked:
   http://192.168.107.175:3000/joinParticipant?room=room-gmh12sxpr
4. Allow camera/mic
5. Join the interview!

Make sure you're on the same Wi-Fi!
```

6. Send!

---

### **Method 2: WhatsApp** 📱

1. Open WhatsApp on computer
2. Open Anada's chat
3. Click 📎 (attachment)
4. Choose "Document"
5. Select `start-interview.bat`
6. Send
7. Send follow-up message with interview link

---

### **Method 3: OneDrive Share Link** ☁️

Your project is already in OneDrive! Easy to share:

1. Open File Explorer
2. Go to: `C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI`
3. Right-click `start-interview.bat`
4. Click "Share" (OneDrive)
5. Click "Copy Link"
6. Send link to Anada via WhatsApp/Email

She clicks the link and downloads the file!

---

### **Method 4: Simple File Server** 🌐

Use the script I created:

```powershell
.\share-files.ps1
```

This will:
- Start a local file server
- Show you a URL like: `http://192.168.107.175:8080`
- Tell Anada to open that URL in her browser
- She can download the files directly

**Stop server:** Press Ctrl+C when done

---

## 📋 WHAT ANADA NEEDS TO DO

After receiving the file:

1. **Save** `start-interview.bat` to her Desktop
2. **Double-click** the file
3. **Enter** the interview link when asked
4. **Allow** camera/microphone
5. **Done!**

---

## 🔍 FILE LOCATIONS

The files are here:
```
C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\
├── start-interview.bat  ← Send this (main file)
├── QUICK_START_FOR_ANADA.md  ← Send this (instructions)
└── start-chrome-for-participant.ps1  ← Alternative
```

---

## 💡 QUICK TIP

**Simplest way:**
1. Right-click `start-interview.bat` in File Explorer
2. Click "Send to" → "Compressed (zipped) folder"
3. Email/WhatsApp the ZIP file
4. Anada extracts and double-clicks

---

## 🆘 ALTERNATIVE: She Can Create It Herself

If sending files is difficult, tell Anada to:

1. Open Notepad
2. Copy the content from `start-interview.bat`
3. Save as `start-interview.bat` (not .txt!)
4. Double-click to run

Or use the **Manual Chrome Command** from `QUICK_START_FOR_ANADA.md` (no file needed)

---

## ✅ RECOMMENDED: Email or WhatsApp

**Fastest:** Use email with file attachment - 2 minutes, works perfectly!

Just attach the .bat file and include the interview link in the message body.
