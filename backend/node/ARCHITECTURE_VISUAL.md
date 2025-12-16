# Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        server.js (68 lines)                  │
│  • Express setup                                             │
│  • Socket.IO configuration                                   │
│  • Route registration                                        │
│  • Server initialization                                     │
└───────────────┬─────────────────────────────────────────────┘
                │
                ├─────► connectDB() ────────────► MongoDB
                │
                ├─────► Routes
                │       ├── /api/auth (authController)
                │       ├── /api/interviews (interviewRoutes)
                │       └── /api/evaluation (evaluationRoutes)
                │
                └─────► initializeSocketHandlers(io)
                        │
                        └── src/sockets/index.js
                            │
                            ├── webrtcHandlers.js
                            │   ├── join-room
                            │   ├── offer
                            │   ├── answer
                            │   └── ice-candidate
                            │
                            ├── meetingHandlers.js
                            │   ├── start-meeting
                            │   ├── end-meeting
                            │   ├── interviewer-toggle
                            │   └── participant-toggle
                            │
                            ├── questionHandlers.js
                            │   ├── new-question
                            │   └── save-question
                            │
                            ├── answerHandlers.js
                            │   ├── submit-answer
                            │   └── new-answer
                            │
                            └── templateHandlers.js
                                ├── load-template-by-id
                                ├── save-interview-template
                                ├── get-interview-template
                                └── ask-question
```

## Data Flow

### Question Flow
```
Interviewer Dashboard
       │
       ▼
[new-question] event
       │
       ▼
questionHandlers.js
       │
       ├──► Save to MongoDB (InterviewTemplate)
       │    • status: 'in-progress'
       │    • ONE template per room
       │
       └──► Emit [receive-question]
              │
              ▼
       Participant Dashboard
```

### Answer Flow
```
Participant Dashboard
       │
       ▼
[submit-answer] event
       │
       ▼
answerHandlers.js
       │
       ├──► Find template by ID/roomId
       │    • status: 'in-progress' filter
       │
       ├──► AI Evaluation (Google Gemini)
       │    • Score (0-100)
       │    • Feedback
       │    • Strengths
       │    • Improvements
       │
       ├──► Save to MongoDB (Evaluation)
       │    • Calculate average score
       │
       └──► Emit [answer-evaluated]
              │
              ▼
       Interviewer Dashboard
```

### WebRTC Signaling Flow
```
Interviewer
    │
    ▼
[offer] ──────────► webrtcHandlers.js ──────────► [offer] ──────► Participant
                                                                        │
Interviewer ◄──────────── [answer] ◄─────── webrtcHandlers.js ◄────── ▼
    │
    ▼
[ice-candidate] ───► webrtcHandlers.js ───► [ice-candidate] ───► Participant
```

## Module Dependencies

```
server.js
  │
  ├── ./src/config/database.js
  │   └── mongoose
  │
  ├── ./src/routes/evaluation.js
  │   └── ../models/Evaluation
  │
  └── ./src/sockets/index.js
      │
      ├── ./webrtcHandlers.js
      │
      ├── ./meetingHandlers.js
      │
      ├── ./questionHandlers.js
      │   ├── ../models/InterviewTemplate
      │   ├── ../models/Evaluation
      │   └── ../utils/keywordExtractor
      │
      ├── ./answerHandlers.js
      │   ├── ../models/Evaluation
      │   ├── ../models/InterviewTemplate
      │   ├── ../utils/keywordExtractor
      │   └── ../utils/aiEvaluator
      │
      └── ./templateHandlers.js
          └── ../models/InterviewTemplate
```

## File Size Comparison

| File | Lines | Purpose |
|------|-------|---------|
| **Before Refactoring** |
| server.js | 722 | Everything |
| **After Refactoring** |
| server.js | 68 | Main entry point |
| src/config/database.js | 12 | DB connection |
| src/routes/evaluation.js | 52 | Evaluation API |
| src/sockets/index.js | 38 | Socket init |
| src/sockets/webrtcHandlers.js | 42 | WebRTC |
| src/sockets/meetingHandlers.js | 78 | Meeting controls |
| src/sockets/questionHandlers.js | 93 | Questions |
| src/sockets/answerHandlers.js | 227 | Answers & AI |
| src/sockets/templateHandlers.js | 148 | Templates |
| **Total** | **758** | **(+36 lines for better structure)** |

The slight increase in total lines is due to:
- Module exports/imports
- Improved documentation
- Better error handling
- Clearer code structure

**Net benefit**: 91% reduction in main file complexity
