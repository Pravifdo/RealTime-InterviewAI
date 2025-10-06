# InterviewAI Frontend

## 🎯 Overview

InterviewAI is a real-time AI-powered interview platform that helps participants practice interviews and allows interviewers to conduct and evaluate sessions efficiently.

### ✨ What's New in This Version

- ✅ New Home page with Login and Register buttons
- ✅ Register page for new user registration
- ✅ Improved Login page with better UI
- ✅ Standard React project architecture
- ✅ Reusable components (Button, Card, Sidebar)
- ✅ Centralized API service
- ✅ All routes properly integrated

## 🚀 Quick Start

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## 🗺️ Application Flow

### For New Users:
1. Open `http://localhost:3000` (Home page)
2. Click **"Register"** button
3. Fill in registration form and select role
4. Register and login with credentials
5. Redirected to role-based dashboard

### For Existing Users:
1. Click **"Login"** on Home page
2. Select role and enter credentials
3. Redirected to dashboard based on role

## 📍 Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with Login/Register buttons |
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |
| `/participant` | ParticipantDashboard | Participant's dashboard (protected) |
| `/interviewer` | InterviewerDashboard | Interviewer's dashboard (protected) |
| `/join-participant` | JoinInterview | Live interview session (protected) |

## 🎨 Features

- **Home Page**: Professional landing page with navigation
- **Authentication**: Login and Register with role selection
- **Dashboards**: Separate dashboards for participants and interviewers
- **Live Sessions**: Real-time video interview sessions
- **Responsive Design**: Works on all screen sizes

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Route components
│   ├── components/common/  # Reusable components
│   ├── services/           # API services
│   └── styles/             # CSS files
```

## 🔐 Authentication

- Token-based authentication
- Protected routes
- Role-based access control
- Automatic token management

## ⚙️ Backend Integration

Make sure the backend is running at `http://localhost:5000`

```bash
cd backend/node
npm install
npm start
```

## 📚 Documentation

- **Architecture**: See `ARCHITECTURE.md` for detailed architecture
- **Changes**: See `REFACTORING_SUMMARY.md` for refactoring details

## 📦 Technologies

- React 19
- React Router DOM
- Material-UI
- Axios
- CSS3

---

## Available Scripts (Create React App)

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
