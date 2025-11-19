# 🚀 QUICK DEPLOYMENT STEPS

## You're running the app ON Digital Ocean Server (178.128.59.218)

---

## ⚡ Fast Deploy (Copy & Paste These Commands)

### 1. SSH into Your Digital Ocean Server
```bash
ssh root@178.128.59.218
# or
ssh your-username@178.128.59.218
```

### 2. Navigate to Project Directory
```bash
cd /home/RealTime-InterviewAI
```

### 3. Update Backend Configuration
```bash
cd backend/node

# Create .env file
cat > .env << 'EOF'
PORT=5000
MONGO_URI=mongodb://localhost:27017/interview-app
JWT_SECRET=super_secret_key_change_in_production
GEMINI_API_KEY=your_key_if_you_have_one
EOF

# Install and start
npm install
pm2 delete interview-backend
pm2 start server.js --name interview-backend
pm2 save
```

### 4. Update Frontend Configuration & Build
```bash
cd ../../frontend

# Create production .env
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=http://178.128.59.218:5000
EOF

# Build and serve
npm install
npm run build
pm2 delete interview-frontend
pm2 serve build 3000 --name interview-frontend --spa
pm2 save
```

### 5. Configure Firewall (First Time Only)
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 5000  # Backend
sudo ufw allow 3000  # Frontend
sudo ufw enable
```

---

## 🌐 Access From Any Device

Open in browser on **any device** (phone, laptop, tablet):

**Main App:**
```
http://178.128.59.218:3000
```

**Interviewer:**
```
http://178.128.59.218:3000/joinInterview
```

**Participant:**
```
http://178.128.59.218:3000/joinParticipant?room=ROOM_ID
```

---

## 🔍 Check If Everything is Running

```bash
# View all processes
pm2 list

# Check backend logs
pm2 logs interview-backend

# Check frontend logs
pm2 logs interview-frontend

# Check if ports are open
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3000
```

---

## 🔄 When You Make Code Changes

### If you change backend code:
```bash
cd /home/RealTime-InterviewAI/backend/node
git pull  # if using git
pm2 restart interview-backend
```

### If you change frontend code:
```bash
cd /home/RealTime-InterviewAI/frontend
git pull  # if using git
npm run build
pm2 restart interview-frontend
```

---

## ❌ Common Issues & Fixes

### Issue 1: "ERR_CONNECTION_REFUSED"
**Cause:** Backend not running

**Fix:**
```bash
pm2 restart interview-backend
# or
cd /home/RealTime-InterviewAI/backend/node
pm2 start server.js --name interview-backend
```

### Issue 2: "ERR_CONNECTION_TIMED_OUT" 
**Cause:** Firewall blocking ports

**Fix:**
```bash
sudo ufw allow 5000
sudo ufw allow 3000
sudo ufw status
```

### Issue 3: Frontend shows but can't connect to backend
**Cause:** Frontend was built with wrong backend URL

**Fix:**
```bash
cd /home/RealTime-InterviewAI/frontend
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=http://178.128.59.218:5000
EOF
npm run build
pm2 restart interview-frontend
```

### Issue 4: MongoDB connection error
**Fix:**
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

**OR** Use MongoDB Atlas (cloud):
```bash
# Update backend .env with Atlas connection string
nano /home/RealTime-InterviewAI/backend/node/.env
# Change MONGO_URI to your Atlas connection string
pm2 restart interview-backend
```

---

## 📋 Verification Checklist

Before testing on multiple devices:

- [ ] SSH into 178.128.59.218 ✓
- [ ] Backend running: `pm2 list` shows "interview-backend" online ✓
- [ ] Frontend running: `pm2 list` shows "interview-frontend" online ✓
- [ ] Ports open: `sudo ufw status` shows 3000 and 5000 allowed ✓
- [ ] Backend responds: `curl http://178.128.59.218:5000` ✓
- [ ] Frontend loads: Open `http://178.128.59.218:3000` in browser ✓
- [ ] No console errors in browser (F12) ✓

---

## 🎯 Testing on Multiple Devices

### Device 1 (Your Phone):
1. Connect to any WiFi/mobile data
2. Open: `http://178.128.59.218:3000/joinInterview`
3. Create room, copy participant link

### Device 2 (Friend's Laptop):
1. Connect to any internet
2. Open the participant link
3. Should connect instantly!

### Device 3, 4, 5... (Unlimited):
Same - just open the participant link!

---

## 💡 Pro Tips

1. **Keep PM2 running after reboot:**
   ```bash
   pm2 startup
   pm2 save
   ```

2. **Monitor in real-time:**
   ```bash
   pm2 monit
   ```

3. **View logs in real-time:**
   ```bash
   pm2 logs
   ```

4. **Restart all services:**
   ```bash
   pm2 restart all
   ```

5. **Update from Git:**
   ```bash
   cd /home/RealTime-InterviewAI
   git pull
   ./deploy-to-digitalocean.sh
   ```

---

## 🚨 IMPORTANT NOTES

1. **The React app needs to be REBUILT** every time you change the backend URL
2. Run `npm run build` in the frontend folder after ANY .env changes
3. The built files are in `frontend/build/` - that's what PM2 serves
4. Your local machine doesn't run anything - it just connects to the server

---

Good luck! 🎉
