@echo off
REM Simple Chrome launcher for interview participant
REM Double-click this file to start Chrome with media access

echo.
echo ==========================================
echo   Interview - Chrome Launcher
echo ==========================================
echo.

REM Close existing Chrome instances
echo Checking for running Chrome instances...
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Chrome is running. Closing all Chrome windows...
    taskkill /F /IM chrome.exe >NUL 2>&1
    timeout /t 2 >NUL
    echo Chrome closed.
)

echo.
echo Starting Chrome with special settings...
echo.

REM Set paths
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "USER_DATA=%LOCALAPPDATA%\ChromeDevSession"

REM Check if Chrome exists
if not exist "%CHROME_PATH%" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

if not exist "%CHROME_PATH%" (
    echo ERROR: Chrome not found!
    echo Please install Google Chrome from: https://www.google.com/chrome/
    echo.
    pause
    exit /b
)

REM Get interview link from user
set /p INTERVIEW_URL="Enter the interview link: "

if "%INTERVIEW_URL%"=="" (
    echo ERROR: No link provided!
    pause
    exit /b
)

REM Start Chrome
echo.
echo Opening Chrome...
echo.

start "" "%CHROME_PATH%" --unsafely-treat-insecure-origin-as-secure="%INTERVIEW_URL%" --user-data-dir="%USER_DATA%" "%INTERVIEW_URL%"

echo.
echo ==========================================
echo Chrome started successfully!
echo ==========================================
echo.
echo NEXT STEPS:
echo 1. Chrome should open with the interview page
echo 2. Click "Join Interview Room" button
echo 3. Allow camera and microphone when asked
echo 4. You should connect to the video call!
echo.
echo If you see any errors, take a screenshot.
echo.
pause
