# Testing Guide - Interview System

## 🧪 How to Test Your Interview System

### Prerequisites
- ✅ MongoDB running
- ✅ Gemini API key configured in `.env`
- ✅ Backend server running (`npm start`)
- ✅ Frontend running (`npm start`)

---

## 📝 Step-by-Step Testing

### Test 1: Template Selection

1. **Open Interviewer Page**
   - Navigate to `http://localhost:3000/joinInterview`
   - You should see the Room ID generated

2. **Load Template**
   - You'll see "Load Interview Template" section
   - **Option A**: Click on a template card from the grid
   - **Option B**: Enter a template ID manually and click "Load Template"

3. **Verify Template Loaded**
   - You should see an alert: "✅ Template Loaded!"
   - Shows template title and number of questions
   - Check browser console: Look for template data

**Expected Result**: ✅ Template loaded with questions and expected keywords

---

### Test 2: Start Interview

1. **Copy Room ID**
   - Click "Copy Room ID" button on interviewer page
   - Verify "Copied!" message appears

2. **Join as Participant**
   - Open new browser tab/window (or incognito)
   - Navigate to `http://localhost:3000/joinParticipant`
   - Paste Room ID and click "Join Interview Room"

3. **Start Meeting**
   - On interviewer page, click "Start Meeting"
   - Verify timer starts (00:00, 00:01, etc.)
   - Verify participant sees "Meeting Started"

**Expected Result**: ✅ Both parties connected and meeting active

---

### Test 3: Ask Question (Voice-to-Text)

**Method 1: Voice Recognition**

1. On interviewer page, click "Start Speaking" button
2. Speak a question clearly (e.g., "What is closure?")
3. Watch text appear in the question box
4. Click "Stop Speaking"
5. Click "Send Question" button

**Method 2: Type Manually**

1. Type question in the text box
2. Click "Send Question" button

**Verify on Participant Side**:
- Question should appear immediately
- Check the "Interview Questions" panel
- Question text should match what was sent

**Check Console Logs**:
- Interviewer console: "📤 Question sent to participant in room: room-xxx"
- Backend console: "📨 New question:", "✅ Question saved to template"
- Participant console: "📝 New question received:"

**Expected Result**: ✅ Question sent and displayed on participant screen

---

### Test 4: Submit Answer (Voice or Text)

**On Participant Side**:

**Method 1: Voice Recognition**

1. Click "Start Speaking" button
2. Speak your answer (e.g., "A closure is when a function remembers its outer scope...")
3. Watch text appear in answer box
4. Click "Stop Speaking"
5. Click "Send Answer"

**Method 2: Type Manually**

1. Type answer in the text box
2. Click "Send Answer"

**Verify Submission**:
- Answer box clears after submission
- Check console: "📤 Submitting answer:", "📤 Answer submitted for question X"

**Expected Result**: ✅ Answer submitted to backend

---

### Test 5: Gemini AI Evaluation

**On Backend Console**, watch for:

```
📥 Answer submission received: {
  roomId: 'room-xxx',
  questionIndex: 0,
  templateId: 'xxx',
  hasAnswer: true
}
🔍 Looking up template by ID: xxx
🤖 Starting AI evaluation for Q1...
✨ AI Evaluation complete for Q1: {
  score: 85,
  type: 'AI',
  concepts: 2
}
✅ Evaluation saved to database
```

**On Interviewer Side**, verify:

1. Answer appears in "Interview Questions & Answers" section
2. Score badge displayed (e.g., "Score: 85%")
3. AI Feedback shown below answer
4. Green badge for high score (70+), yellow for medium (50-69), red for low (<50)

**Expected Result**: ✅ Answer evaluated by Gemini AI and displayed with score

---

### Test 6: Verify Database Storage

**Check MongoDB**:

1. **InterviewTemplate Collection**
   ```javascript
   db.interviewtemplates.find({ roomId: "room-xxx" })
   
   // Should show:
   {
     roomId: "room-xxx",
     questions: [
       {
         question: "What is closure?",
         expectedKeywords: ["closure", "function", "scope"],
         // ...
       }
     ],
     status: "in-progress"
   }
   ```

2. **Evaluation Collection**
   ```javascript
   db.evaluations.find({ roomId: "room-xxx" })
   
   // Should show:
   {
     roomId: "room-xxx",
     questionsAnswers: [
       {
         question: "What is closure?",
         expectedKeywords: ["closure", "function", "scope"],
         participantAnswer: "A closure is when...",
         score: 85,
         aiFeedback: "Good understanding...",
         aiStrengths: ["Mentioned scope", "Explained function"],
         aiImprovements: ["Add examples"],
         matchedKeywords: ["function", "scope"],
         evaluationType: "AI",
         timestamp: ISODate("...")
       }
     ],
     averageScore: 85
   }
   ```

**Expected Result**: ✅ Both template and evaluation saved in database

---

### Test 7: Multiple Questions

1. **Repeat Test 3-5** for additional questions
2. Each question should:
   - Be saved to template
   - Be displayed to participant
   - Accept answer
   - Be evaluated by AI
   - Show results to interviewer

**Verify**:
- Questions appear in order (Q1, Q2, Q3...)
- Answers match correct question index
- Scores calculated individually
- Average score updates

**Expected Result**: ✅ Multiple Q&A pairs working correctly

---

### Test 8: End Interview

1. On interviewer page, click "End Meeting"
2. Confirm the dialog
3. Verify participant sees "Interview ended" message
4. Verify both redirected to their respective dashboards

**Check Database**:
- Template status changed to "completed"
- Evaluation status changed to "completed"
- End time recorded

**Expected Result**: ✅ Interview properly ended and saved

---

## 🔍 Troubleshooting

### ❌ Template Not Loading

**Check**:
- Is MongoDB running?
- Do templates exist in database?
- Check backend console for errors
- Verify API endpoint: `GET /api/interviews/templates`

**Fix**:
```bash
# Create a test template
node backend/node/seedTemplates.js
```

---

### ❌ Questions Not Reaching Participant

**Check**:
- Are both in same room?
- Check Room ID matches
- Verify socket connection (console should show "✅ User connected")
- Check backend logs for socket events

**Fix**:
- Refresh both pages
- Verify BACKEND_URL in frontend `.env`

---

### ❌ Gemini AI Not Working

**Check**:
- Is `GEMINI_API_KEY` set in backend `.env`?
- Check backend console for AI errors
- Verify internet connection

**Fix**:
```bash
# In backend/.env
GEMINI_API_KEY=your_actual_api_key_here
```

**Fallback**: System will use keyword matching if AI fails

---

### ❌ Voice Recognition Not Working

**Check**:
- Browser supports Web Speech API (Chrome, Edge)
- Microphone permissions granted
- Check console for speech recognition errors

**Fallback**: Type questions/answers manually

---

## ✅ Complete Test Checklist

- [ ] Backend server running
- [ ] Frontend running
- [ ] MongoDB connected
- [ ] Gemini API key configured
- [ ] Template loads successfully
- [ ] Room ID generated and copied
- [ ] Participant joins with Room ID
- [ ] Meeting starts
- [ ] Voice-to-text works for questions
- [ ] Question displays on participant screen
- [ ] Voice-to-text works for answers
- [ ] Answer submits successfully
- [ ] Gemini AI evaluates answer
- [ ] Score and feedback display on interviewer screen
- [ ] Data saves to MongoDB
- [ ] Multiple Q&A pairs work
- [ ] Interview ends properly

---

## 📊 Expected Console Output

### Backend Console
```
✅ Connected to MongoDB
✅ Socket.io is running
Server running on port 5000

✅ User connected: socket-id-123
📨 New question: {question: "What is closure?", roomId: "room-xxx"}
✅ Question saved to template (Q1, ID: template-id)
📥 Answer submission received: {roomId: "room-xxx", questionIndex: 0}
🤖 Starting AI evaluation for Q1...
✨ AI Evaluation complete for Q1: {score: 85, type: 'AI'}
✅ Evaluation saved to database
```

### Frontend Console (Interviewer)
```
🔑 NEW INTERVIEW ROOM CREATED
📋 Room ID: room-xxx
📤 Question sent to participant in room: room-xxx
✅ Participant submitted answer for Q1
📊 Answer evaluated: {questionIndex: 0, score: 85}
```

### Frontend Console (Participant)
```
🔗 Room ID detected in URL: room-xxx
✅ Auto-joining room: room-xxx
🔗 Joined Room: room-xxx
📝 New question received: {questionIndex: 0, question: "What is closure?"}
📤 Submitting answer: {questionIndex: 0, hasAnswer: true}
✅ Answer submitted successfully
```

---

**Test systematically and verify each step before moving to the next!** 🧪
