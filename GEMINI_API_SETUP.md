# 🤖 How to Get Your FREE Google Gemini API Key

## Step 1: Go to Google AI Studio
Visit: **https://aistudio.google.com/app/apikey**

## Step 2: Sign in with Google Account
- Use your Gmail account
- Accept terms and conditions

## Step 3: Create API Key
1. Click **"Create API Key"** button
2. Select **"Create API key in new project"** 
3. Copy the API key that appears

It looks like: `AIzaSyC-abcd1234efgh5678ijkl9012mnop3456`

## Step 4: Add to .env File
Open: `backend/node/.env`

Replace this line:
```
GEMINI_API_KEY = YOUR_GEMINI_API_KEY_HERE
```

With your actual key:
```
GEMINI_API_KEY = AIzaSyC-abcd1234efgh5678ijkl9012mnop3456
```

## Step 5: Restart Backend Server
```powershell
# Stop current server (Ctrl+C in terminal)
# Then restart:
cd backend\node
npm run dev
```

## ✅ Done!

Your system will now use AI for intelligent answer evaluation!

---

## 🆓 Free Tier Limits:
- **60 requests per minute**
- **1,500 requests per day**
- **Perfect for testing!**

For production (more than 1,500 interviews per day), you can upgrade later.

---

## 🧪 Test AI Evaluation:

1. Create a template with questions
2. Start an interview
3. Ask a question
4. Give an answer
5. Watch AI provide:
   - Score (0-100)
   - Detailed feedback
   - Strengths
   - Areas for improvement
   - Matched concepts

**Example:**
```
Question: What is React?

Answer: "React is a popular JavaScript library created by Facebook 
for building interactive user interfaces, especially for single-page 
applications."

AI Evaluation:
✅ Score: 92%
💬 Feedback: "Excellent answer! Correctly identified React as a 
   library (not a framework), mentioned Facebook origin, and key 
   use case for SPAs."

✅ Strengths:
- Accurately described React as a library
- Mentioned Facebook as creator
- Identified primary use case (SPAs)

📈 Improvements:
- Could mention component-based architecture
- Virtual DOM could be referenced

Covered Concepts: javascript, library, facebook, ui, spa
```

---

## 🔐 Security Note:
- Never commit `.env` file to Git
- Keep your API key private
- Regenerate if accidentally exposed

---

**Need help?** Check: https://ai.google.dev/gemini-api/docs
