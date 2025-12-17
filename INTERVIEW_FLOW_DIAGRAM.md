# Interview System Flow - Visual Diagram

## 🔄 Complete Interview Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TEMPLATE-BASED INTERVIEW SYSTEM                       │
│                    (With Gemini AI Evaluation)                           │
└─────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 1: INTERVIEWER SELECTS TEMPLATE                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┐
│  INTERVIEWER   │
│                │
│ [Template List]│ ← Available templates from database
│  ☑ JS Template │
│  ☐ Python Temp │
│  ☐ React Temp  │
│                │
│ [Select] ✓     │ ← Clicks on template
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│        Template Data Loaded                 │
│                                            │
│  Title: "JavaScript Interview"             │
│  Questions: [                              │
│    {                                       │
│      question: "What is closure?",         │
│      expectedKeywords: [                   │
│        "function",                         │
│        "scope",                            │
│        "lexical",                          │
│        "variables"                         │
│      ]  ← ✅ CORRECT ANSWER KEY           │
│    }                                       │
│  ]                                         │
└────────┬───────────────────────────────────┘
         │
         ▼
    ✅ Saved to MongoDB
    (InterviewTemplate collection)


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 2: INTERVIEW STARTS                                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┐
│  INTERVIEWER   │
│                │
│ [Start Meeting]│ ← Clicks button
└───────┬────────┘
        │
        ▼
┌────────────────────────┐         ┌────────────────┐
│   Backend Server       │────────→│  PARTICIPANT   │
│   meeting-started      │         │  Meeting active│
└────────────────────────┘         └────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 3: INTERVIEWER ASKS QUESTION (Voice-to-Text)                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┐
│  INTERVIEWER   │
│                │
│  🎤 "What is   │ ← Speaks into microphone
│     closure?"  │
│                │
│  [Question box]│ ← Voice → Text
│  What is       │
│  closure?      │
│                │
│  [Send] ✓      │ ← Clicks send
└───────┬────────┘
        │
        │ socket.emit('new-question', {question, roomId})
        ▼
┌─────────────────────────────────────────┐
│        Backend Server                    │
│                                         │
│  1. Receives question                   │
│  2. Extracts keywords:                  │
│     ["closure", "function", "scope"]    │
│  3. Saves to template:                  │
│     {                                   │
│       question: "What is closure?",     │
│       expectedKeywords: [...]  ← For AI │
│     }                                   │
│  4. ✅ Keywords ready for Gemini AI    │
└─────────┬───────────────────────────────┘
          │
          │ emit('receive-question')
          ▼
    ┌────────────────┐
    │  PARTICIPANT   │
    │                │
    │ 📝 Question:   │ ← Question displayed
    │ "What is       │
    │  closure?"     │
    └────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 4: PARTICIPANT ANSWERS (Voice or Text)                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    ┌────────────────┐
    │  PARTICIPANT   │
    │                │
    │  🎤 OR ⌨️     │ ← Voice or text input
    │                │
    │  [Answer box]  │
    │  "A closure is │
    │  when a function│
    │  remembers its │
    │  outer scope..." │
    │                │
    │  [Send] ✓      │ ← Submits answer
    └────────┬───────┘
             │
             │ socket.emit('submit-answer', {
             │   answer, questionIndex, templateId, roomId
             │ })
             ▼


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 5: GEMINI AI EVALUATES ANSWER AGAINST TEMPLATE                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────────────────────────────────────────────┐
│             Backend Server                              │
│                                                         │
│  1. Fetch template by templateId                       │
│     template = InterviewTemplate.findById(templateId)  │
│                                                         │
│  2. Get question and EXPECTED KEYWORDS from template   │
│     question = template.questions[questionIndex]       │
│     expectedKeywords = question.expectedKeywords       │
│     // ✅ ["function", "scope", "lexical", "variables"]│
│                                                         │
│  3. Send to Gemini AI:                                 │
│     ┌──────────────────────────────────────┐          │
│     │    Gemini AI (gemini-pro)             │          │
│     │                                       │          │
│     │  Prompt:                              │          │
│     │  Question: "What is closure?"         │          │
│     │  Expected Keywords: [function, scope, │          │
│     │     lexical, variables]  ← FROM TEMPLATE         │
│     │  Answer: "A closure is when..."      │          │
│     │                                       │          │
│     │  ✨ AI Analyzes:                     │          │
│     │  - Correctness vs expected keywords   │          │
│     │  - Completeness of answer            │          │
│     │  - Clarity of explanation            │          │
│     │                                       │          │
│     │  Returns:                             │          │
│     │  {                                    │          │
│     │    score: 85,                         │          │
│     │    feedback: "Good understanding...", │          │
│     │    strengths: ["Mentioned scope",     │          │
│     │                "Explained function"], │          │
│     │    improvements: ["Add examples"],    │          │
│     │    matched_concepts: ["function",     │          │
│     │                      "scope"]         │          │
│     │  }                                    │          │
│     └──────────────────────────────────────┘          │
│                                                         │
│  4. Save evaluation to database:                       │
│     session.questionsAnswers[questionIndex] = {        │
│       question: "What is closure?",                    │
│       expectedKeywords: ["function", "scope"...],      │
│       participantAnswer: "A closure is when...",       │
│       score: 85,              ← AI Score               │
│       aiFeedback: "Good...",  ← AI Feedback            │
│       aiStrengths: [...],     ← AI Analysis            │
│       aiImprovements: [...],  ← AI Suggestions         │
│       matchedKeywords: ["function", "scope"],          │
│       evaluationType: "AI",                            │
│       timestamp: Date.now()                            │
│     }                                                   │
│     ✅ Saved to MongoDB (Evaluation collection)        │
└─────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 6: INTERVIEWER SEES ANSWER + AI EVALUATION                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        │
        │ emit('answer-evaluated', {answer, score, feedback})
        ▼
┌────────────────────────────────────────────┐
│           INTERVIEWER                       │
│                                            │
│  Q1: "What is closure?"                    │
│                                            │
│  ✅ Answer Received:                       │
│  ┌──────────────────────────────────────┐│
│  │ "A closure is when a function        ││
│  │  remembers its outer scope..."       ││
│  │                                      ││
│  │ 📊 Score: 85%  (AI Evaluated)       ││
│  │                                      ││
│  │ 💬 AI Feedback:                      ││
│  │ "Good understanding of closures.     ││
│  │  Mentioned key concepts like scope   ││
│  │  and function. Could add practical   ││
│  │  examples for better explanation."   ││
│  │                                      ││
│  │ ✨ Strengths:                        ││
│  │  - Mentioned lexical scope           ││
│  │  - Explained function concept        ││
│  │                                      ││
│  │ 📈 Improvements:                     ││
│  │  - Add practical use cases           ││
│  │  - Explain closure patterns          ││
│  └──────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

## 📊 Data Flow Summary

```
┌──────────────┐
│   Template   │ ← Contains correct answer keys
│  (Database)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Interviewer  │────→│   Question   │────→│ Participant  │
│  (Voice/Text)│     │   (Sent)     │     │  (Receives)  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                   │
                                                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Interviewer  │←────│ Gemini AI    │←────│   Answer     │
│  (Sees Result)│     │  Evaluation  │     │  (Submitted) │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Database   │
                     │  (Saved Q&A  │
                     │   + Score)   │
                     └──────────────┘
```

## 🎯 Key Points

1. ✅ **Template = Correct Answer Key**: Each question has `expectedKeywords`
2. ✅ **Gemini AI Uses Template**: Evaluation based on template's keywords
3. ✅ **One Question at a Time**: Sequential Q&A with individual evaluation
4. ✅ **Everything Saved**: Template, questions, answers, scores all in database
5. ✅ **Real-time Display**: Both parties see updates instantly
6. ✅ **Voice Supported**: Both interviewer and participant can use voice-to-text

---

**Your system is fully functional and working as described!** 🎉
