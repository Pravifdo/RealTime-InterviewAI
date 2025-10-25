# 🎯 Template-Based Interview System - Complete Guide

## ✅ What's New?

Instead of manually adding questions before each interview, you now:
1. **Load a pre-saved template by ID** (like 1, 2, 3, etc.)
2. **System automatically pulls all questions and keywords**
3. **Start the interview immediately!**

---

## 🚀 Quick Start

### **Step 1: Fix MongoDB Connection** (One-time setup)

Your MongoDB Atlas is blocking your IP address. Fix it:

1. Go to: https://cloud.mongodb.com/
2. Login to your account
3. Click on **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"** (or add your current IP)
6. Click **"Confirm"**
7. Wait 2-3 minutes for changes to apply

### **Step 2: Create Sample Templates**

Once MongoDB is connected, run this command:

```powershell
cd c:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI\backend\node
node seedTemplates.js
```

This will create 3 ready-to-use templates:
- **Template 1:** Frontend Developer Interview (5 questions)
- **Template 2:** Backend Developer Interview (5 questions)
- **Template 3:** Full Stack Developer Interview (4 questions)

You'll see output like:
```
✅ Inserted 3 templates

📋 Template IDs:
   1. Frontend Developer Interview
      ID: 673a5f8c9d1e2f3a4b5c6d7e
      Questions: 5

   2. Backend Developer Interview
      ID: 673a5f8c9d1e2f3a4b5c6d7f
      Questions: 5

   3. Full Stack Developer Interview
      ID: 673a5f8c9d1e2f3a4b5c6d80
      Questions: 4
```

**SAVE THESE IDs!** You'll use them to start interviews.

---

## 📝 How to Use (Interviewer Flow)

### **Open Interview Page:**
```
http://localhost:3000/joinInterview
```

### **You'll See:**
```
📚 Load Interview Template
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Card 1]                    [Card 2]                    [Card 3]
#1                          #2                          #3
Frontend Developer          Backend Developer           Full Stack Developer
📝 5 Questions             📝 5 Questions              📝 4 Questions
✅ Ready                   ✅ Ready                    ✅ Ready
[Select Template]           [Select Template]           [Select Template]

────── OR ──────

Enter Template ID Manually
[Input: 673a5f8c9d1e2f3a4b5c6d7e]  [🚀 Load Template]
```

### **Select a Template:**
- **Option 1:** Click on a card (e.g., "#1 Frontend Developer")
- **Option 2:** Copy/paste the template ID and click "Load Template"

### **After Loading:**
```
📊 Live Evaluation Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Average Score: 0%

Interview Questions (5 total)
0 / 5 asked

Q1: What is React and why is it popular?  [📢 Ask]
Q2: Explain closures in JavaScript       [📢 Ask]
Q3: What are React Hooks?                [📢 Ask]
Q4: ...                                  [📢 Ask]
Q5: ...                                  [📢 Ask]

▶️ Ask Next Question
```

### **During Interview:**
1. Click **"Ask"** button or **"Ask Next Question"**
2. Question sent to participant (keywords stay hidden)
3. Participant answers
4. Score appears automatically!

```
Q1: What is React and why is it popular? [85%] ✅ Excellent
  Matched Keywords: javascript, library, component
  Participant Keywords: javascript, library, react, component, ui
  Match: 60%
```

---

## 👥 Participant Flow (No Changes)

Participant experience remains the same:
1. Receives shareable link: `http://192.168.107.175:3000/joinParticipant?room=ROOM_ID`
2. Sees questions one by one
3. Answers with voice or text
4. No knowledge of expected keywords!

---

## 🎓 Sample Interview Templates

### **Template 1: Frontend Developer**
```
Q1: What is React and why is it popular?
Keywords: javascript, library, component, ui, virtual dom, facebook

Q2: Explain closures in JavaScript
Keywords: function, scope, variable, lexical, inner, outer

Q3: What are React Hooks?
Keywords: state, lifecycle, functional, component, usestate, useeffect

Q4: Explain promises in JavaScript
Keywords: asynchronous, callback, resolve, reject, pending, then, catch

Q5: Difference between let, const, and var
Keywords: scope, hoisting, block, reassign, temporal dead zone
```

### **Template 2: Backend Developer**
```
Q1: What is Node.js?
Keywords: javascript, runtime, v8, event, loop, non-blocking, asynchronous

Q2: Explain REST API principles
Keywords: http, get, post, put, delete, stateless, resource, endpoint

Q3: What is MongoDB?
Keywords: nosql, document, json, flexible, schema, scalable, collection

Q4: Explain middleware in Express.js
Keywords: function, request, response, next, pipeline, authentication

Q5: What is JWT?
Keywords: token, authentication, json, signature, header, payload, secret
```

### **Template 3: Full Stack Developer**
```
Q1: What is the MERN stack?
Keywords: mongodb, express, react, node, javascript, fullstack

Q2: Explain authentication vs authorization
Keywords: identity, login, permission, access, token, role

Q3: What is CORS?
Keywords: cross-origin, security, browser, http, header, policy

Q4: Explain WebSocket
Keywords: real-time, bidirectional, connection, socket, persistent, chat
```

---

## 🛠️ Creating Your Own Templates

### **Method 1: Using MongoDB Directly**
Add to `seedTemplates.js` and run again.

### **Method 2: Using API (Recommended)**
Open `create-templates.html` in browser and click "Create Templates"

### **Method 3: Manual Database Insert**
Use MongoDB Compass or Atlas web interface.

---

## 🔍 Troubleshooting

### **"Template not found" error:**
- Check if MongoDB is connected (look for ✅ in terminal)
- Verify template ID is correct
- Run seedTemplates.js again

### **"No templates found":**
- MongoDB not connected
- Templates not created yet
- Run: `node seedTemplates.js`

### **MongoDB connection failed:**
- Update IP whitelist in MongoDB Atlas
- Check internet connection
- Verify .env file has correct MONGO_URI

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────┐
│           MongoDB Database                       │
│  ┌────────────────────────────────────────┐    │
│  │  InterviewTemplate Collection          │    │
│  │  - ID: 673a5f8c9d1e2f3a4b5c6d7e       │    │
│  │  - Title: "Frontend Developer"         │    │
│  │  - Questions: [...]                    │    │
│  │  - Keywords: [...]   (HIDDEN)          │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│            Backend Server                        │
│  - Load template by ID                           │
│  - Send questions to participant                 │
│  - Auto-evaluate answers                         │
│  - Calculate scores                              │
└─────────────────────────────────────────────────┘
        ↓                              ↓
┌──────────────────┐        ┌──────────────────┐
│   Interviewer    │        │   Participant    │
│   Dashboard      │        │   Page           │
│                  │        │                  │
│ - Load template  │        │ - Receive Q      │
│ - Ask questions  │        │ - Answer         │
│ - See live scores│        │ - Auto-scored    │
└──────────────────┘        └──────────────────┘
```

---

## ✨ Key Benefits

✅ **No manual setup** - just enter ID and go!
✅ **Reusable** - use same template for multiple interviews
✅ **Consistent** - every candidate gets same questions
✅ **Fast** - start interviews in seconds
✅ **Secure** - keywords hidden from interviewer during session
✅ **Automated** - scoring happens automatically

---

## 🎯 Next Steps

1. **Fix MongoDB connection** (update IP whitelist)
2. **Run seedTemplates.js** to create sample templates
3. **Copy template IDs** from output
4. **Start an interview** using template ID
5. **Test the system** with a sample interview

---

**Ready to go! 🚀**
