# InterviewAI - Navigation Flow Diagram

## 🗺️ Complete Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Home Page (/)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Welcome to InterviewAI                              │   │
│  │  - AI-Powered Interview Platform                     │   │
│  │  - Real-time Evaluation & Feedback                   │   │
│  │                                                       │   │
│  │  ┌──────────┐              ┌──────────┐             │   │
│  │  │  Login   │              │ Register │             │   │
│  │  └────┬─────┘              └────┬─────┘             │   │
│  └───────┼──────────────────────────┼───────────────────┘   │
└──────────┼──────────────────────────┼───────────────────────┘
           │                          │
           ▼                          ▼
    ┌──────────────┐          ┌──────────────┐
    │ Login Page   │          │ Register     │
    │ (/login)     │◄─────────┤ Page         │
    │              │ After    │ (/register)  │
    │ • Select Role│ Success  │              │
    │ • Email      │          │ • Select Role│
    │ • Password   │          │ • Name       │
    └──────┬───────┘          │ • Email      │
           │                  │ • Password   │
           │                  │ • Confirm    │
           │                  └──────────────┘
           │
           ▼
    ┌─────────────────────────────┐
    │   Authentication Check       │
    │   (Token stored in          │
    │    localStorage)            │
    └──────────┬──────────────────┘
               │
         ┌─────┴─────┐
         │           │
    ┌────▼────┐ ┌───▼─────┐
    │Partici- │ │Inter-   │
    │pant     │ │viewer   │
    └────┬────┘ └───┬─────┘
         │          │
         ▼          ▼
┌────────────────────────────────────────────┐
│    Participant Dashboard (/participant)    │
├────────────────────────────────────────────┤
│ Sidebar:                                   │
│  • 📊 Overview                             │
│  • 🎤 My Interviews                        │
│  • 📈 Performance                          │
│  • 🚪 Logout                               │
├────────────────────────────────────────────┤
│ Main Content:                              │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Final Score  │  │ Hours        │       │
│  │    85%       │  │ Practiced    │       │
│  └──────────────┘  │  120 hrs     │       │
│                    └──────────────┘       │
│  ┌─────────────────────────────┐          │
│  │  🚀 Join Interview          │──────┐   │
│  └─────────────────────────────┘      │   │
│  ┌─────────────────────────────┐      │   │
│  │  ➕ Schedule Interview       │      │   │
│  └─────────────────────────────┘      │   │
└────────────────────────────────────────┼───┘
                                         │
                                         ▼
                        ┌────────────────────────────┐
                        │ Join Interview Session     │
                        │ (/join-participant)        │
                        ├────────────────────────────┤
                        │ • Participant Video        │
                        │ • Interviewer Video        │
                        │ • Mic/Camera Controls      │
                        │ • Answer Submission        │
                        │ • Timer                    │
                        │ • End Interview Button     │
                        └────────────────────────────┘

┌────────────────────────────────────────────┐
│    Interviewer Dashboard (/interviewer)    │
├────────────────────────────────────────────┤
│ Sidebar:                                   │
│  • 📊 Overview                             │
│  • 👨‍🎓 Participants                        │
│  • 📝 Reviews                              │
│  • 🚪 Logout                               │
├────────────────────────────────────────────┤
│ Main Content:                              │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Interviews   │  │ Participants │       │
│  │ Conducted    │  │ Rated        │       │
│  │    15        │  │     12       │       │
│  └──────────────┘  └──────────────┘       │
│                                            │
│  ┌─────────────────────────────┐          │
│  │  Manage Participants        │          │
│  └─────────────────────────────┘          │
└────────────────────────────────────────────┘
```

## 🔐 Protected Routes

Routes that require authentication:
- `/participant` - Participant Dashboard
- `/interviewer` - Interviewer Dashboard
- `/join-participant` - Interview Session

**Protection Mechanism:**
```javascript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
  }
}, [navigate]);
```

## 🔄 State Management Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ API: POST /auth/login   │
└──────┬──────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ Store in localStorage:            │
│  • token                          │
│  • role (participant/interviewer) │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Redirect based on role:  │
│  • participant → /participant │
│  • interviewer → /interviewer │
└──────────────────────────┘
```

## 📊 Component Hierarchy

```
App
├── Router
    ├── Home
    │   ├── Button (Login)
    │   └── Button (Register)
    │
    ├── Login
    │   ├── TextField (Email)
    │   ├── TextField (Password)
    │   ├── ToggleButtonGroup (Role)
    │   └── Button (Submit)
    │
    ├── Register
    │   ├── TextField (Name)
    │   ├── TextField (Email)
    │   ├── TextField (Password)
    │   ├── TextField (Confirm)
    │   ├── ToggleButtonGroup (Role)
    │   └── Button (Submit)
    │
    ├── ParticipantDashboard
    │   ├── Sidebar
    │   │   ├── Menu Items
    │   │   └── Logout Button
    │   └── Main Content
    │       ├── Card (Score)
    │       ├── Card (Hours)
    │       └── Buttons (Join/Schedule)
    │
    ├── InterviewerDashboard
    │   ├── Sidebar
    │   │   ├── Menu Items
    │   │   └── Logout Button
    │   └── Main Content
    │       ├── Card (Interviews)
    │       └── Card (Participants)
    │
    └── JoinInterview
        ├── Participant Video Panel
        │   ├── Video Feed
        │   └── Controls (Mic/Cam)
        ├── Interviewer Video Panel
        │   ├── Video Feed
        │   └── Controls (Mic/Cam)
        └── Answer Section
            ├── Answer List
            ├── Textarea
            └── Buttons (Send/End)
```

## 🎯 User Journey Examples

### Participant Journey:
1. **Landing**: Visit Home page
2. **Register**: Create account as Participant
3. **Login**: Authenticate
4. **Dashboard**: View overview and stats
5. **Join Interview**: Click "Join Interview"
6. **Session**: Complete interview with video/audio
7. **Logout**: End session

### Interviewer Journey:
1. **Landing**: Visit Home page
2. **Login**: Authenticate as Interviewer
3. **Dashboard**: View conducted interviews
4. **Manage**: Access participants and reviews
5. **Logout**: End session

## 🔗 API Integration Points

```
┌──────────────────┐
│   Frontend       │
│   Components     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  API Service     │
│  (api.js)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Axios Instance  │
│  with Token      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Backend API     │
│  (Port 5000)     │
└──────────────────┘
```

**API Endpoints Used:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/sessions` - Get interview sessions
- `POST /api/sessions` - Create session
- `GET /api/evaluation` - Get evaluations
- `POST /api/evaluation` - Submit evaluation
