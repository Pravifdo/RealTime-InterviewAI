# Frontend Architecture Documentation

## 📁 Project Structure

```
frontend/
├── public/                      # Static files
├── src/
│   ├── components/              # Reusable UI components
│   │   └── common/              # Common components (Button, Card, Sidebar)
│   │       ├── Button.js
│   │       ├── Button.css
│   │       ├── Card.js
│   │       ├── Card.css
│   │       ├── Sidebar.js
│   │       └── Sidebar.css
│   ├── pages/                   # Page components (route components)
│   │   ├── Home.js              # Landing page with Login/Register buttons
│   │   ├── Login.js             # Login page
│   │   ├── Register.js          # Registration page
│   │   ├── ParticipantDashboard.js
│   │   ├── InterviewerDashboard.js
│   │   └── JoinInterview.js
│   ├── services/                # API services and utilities
│   │   └── api.js               # Centralized API calls
│   ├── styles/                  # Page-specific CSS files
│   │   ├── Home.css
│   │   ├── Login.css
│   │   ├── Register.css
│   │   ├── ParticipantDashboard.css
│   │   ├── InterviewerDashboard.css
│   │   └── JoinInterview.css
│   ├── App.js                   # Main app component with routing
│   ├── App.css                  # Global app styles
│   └── index.js                 # Entry point
├── package.json
└── README.md
```

## 🎯 Architecture Principles

### 1. **Separation of Concerns**
- **Pages**: Route-level components that represent different views
- **Components**: Reusable UI components used across multiple pages
- **Services**: Business logic and API communication
- **Styles**: Page-specific and component-specific styling

### 2. **Component Organization**

#### Pages (`/src/pages/`)
Contains all page-level components that are directly referenced in routing:
- `Home.js` - Landing page with navigation to login/register
- `Login.js` - User authentication
- `Register.js` - New user registration
- `ParticipantDashboard.js` - Participant's dashboard
- `InterviewerDashboard.js` - Interviewer's dashboard
- `JoinInterview.js` - Live interview session

#### Components (`/src/components/`)
Reusable UI components organized by category:
- `common/` - Shared components like Button, Card, Sidebar

#### Services (`/src/services/`)
- `api.js` - Centralized API communication with axios interceptors

### 3. **Routing Structure**

```javascript
/ → Home (Landing page)
/login → Login page
/register → Registration page
/participant → Participant Dashboard (protected)
/interviewer → Interviewer Dashboard (protected)
/join-participant → Join Interview Session (protected)
```

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm start
```

### Build for Production
```bash
npm build
```

## 🔐 Authentication Flow

1. User visits Home page (`/`)
2. Clicks Login or Register button
3. After successful authentication:
   - Token stored in localStorage
   - Redirected to role-based dashboard (participant/interviewer)
4. Protected routes check for token and redirect to login if not authenticated

## 📦 Key Dependencies

- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **@mui/material**: Material-UI components
- **@emotion/react** & **@emotion/styled**: Styling for MUI

## 🎨 Styling Convention

- Component-specific styles are in the same folder as components
- Page-specific styles are in `/src/styles/`
- Use CSS modules or BEM naming convention for class names
- Material-UI components for consistent UI

## 🔄 API Service Usage

```javascript
import { authAPI } from '../services/api';

// Login
const response = await authAPI.login(email, password, role);

// Register
const response = await authAPI.register(name, email, password, role);

// Logout
authAPI.logout();
```

## 📝 Best Practices

1. **Keep components small and focused** - Single responsibility principle
2. **Use reusable components** - DRY (Don't Repeat Yourself)
3. **Centralize API calls** - All API logic in services folder
4. **Consistent naming** - Use PascalCase for components, camelCase for functions
5. **CSS organization** - Keep styles close to components
6. **State management** - Use React hooks (useState, useEffect)
7. **Route protection** - Check authentication in protected routes

## 🛠️ Future Enhancements

- Add Redux/Context API for global state management
- Implement more reusable components (Input, Modal, etc.)
- Add unit tests with Jest and React Testing Library
- Implement error boundaries
- Add loading states and error handling components
- Implement real-time features with WebSocket
