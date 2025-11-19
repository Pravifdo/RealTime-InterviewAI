# 🚀 Digital Ocean Deployment Guide

## Server Information
- **IP Address**: 178.128.59.218
- **Backend Port**: 5000
- **Frontend Port**: 3000

---

## 📋 Prerequisites on Digital Ocean Server

### 1. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x
```

### 2. Install MongoDB (if not using Atlas)
If using MongoDB Atlas, skip this step.

```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 4. Configure Firewall
```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22

# Allow backend port
sudo ufw allow 5000

# Allow frontend port
sudo ufw allow 3000

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## 📦 Deploy Your Application

### Step 1: Upload Code to Server

**Option A - Using Git (Recommended):**
```bash
# On Digital Ocean server
cd /home
git clone https://github.com/Pravifdo/RealTime-InterviewAI.git
cd RealTime-InterviewAI
```

**Option B - Using SCP (from your local machine):**
```powershell
# Compress project
Compress-Archive -Path "C:\Users\prave\OneDrive\Desktop\RealTime-InterviewAI" -DestinationPath "RealTime-InterviewAI.zip"

# Upload (replace 'root' with your username)
scp RealTime-InterviewAI.zip root@178.128.59.218:/home/

# On server, extract
ssh root@178.128.59.218
cd /home
unzip RealTime-InterviewAI.zip
```

### Step 2: Setup Backend

```bash
cd /home/RealTime-InterviewAI/backend/node

# Install dependencies
npm install

# Create .env file
nano .env
```

Add this to `.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_if_you_have_one
```

Save and exit (Ctrl+X, then Y, then Enter)

```bash
# Test the backend
npm run dev

# If it works, stop it (Ctrl+C) and run with PM2
pm2 start server.js --name interview-backend
pm2 save
pm2 startup
```

### Step 3: Setup Frontend

```bash
cd /home/RealTime-InterviewAI/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with PM2
pm2 serve build 3000 --name interview-frontend --spa
pm2 save
```

---

## 🌐 Access Your Application

### From Any Device:

**Frontend (Main App):**
```
http://178.128.59.218:3000
```

**Interviewer Dashboard:**
```
http://178.128.59.218:3000/joinInterview
```

**Participant Join:**
```
http://178.128.59.218:3000/joinParticipant?room=ROOM_ID
```

**Template Management:**
```
http://178.128.59.218:3000/templates
```

**Backend API:**
```
http://178.128.59.218:5000
```

---

## 🔧 Useful PM2 Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs interview-backend
pm2 logs interview-frontend

# Restart services
pm2 restart interview-backend
pm2 restart interview-frontend

# Stop services
pm2 stop interview-backend
pm2 stop interview-frontend

# Delete services
pm2 delete interview-backend
pm2 delete interview-frontend

# Monitor
pm2 monit
```

---

## 🔍 Troubleshooting

### Backend won't start?
```bash
# Check if port 5000 is in use
sudo lsof -i :5000

# Check logs
pm2 logs interview-backend

# Check MongoDB connection
sudo systemctl status mongod
```

### Frontend won't start?
```bash
# Check if port 3000 is in use
sudo lsof -i :3000

# Check logs
pm2 logs interview-frontend

# Rebuild
cd /home/RealTime-InterviewAI/frontend
npm run build
pm2 restart interview-frontend
```

### Can't access from other devices?
```bash
# Check firewall
sudo ufw status

# Check if server is listening on all interfaces
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3000
```

### CORS errors?
The backend is already configured with `cors: { origin: "*" }`, so this should work.

---

## 🔐 Optional: Setup HTTPS with Nginx

If you want HTTPS (recommended for production):

### 1. Install Nginx
```bash
sudo apt-get install nginx
```

### 2. Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
```

### 3. Get Domain Name
Point a domain (e.g., interview-app.yourdomain.com) to 178.128.59.218

### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/interview-app
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Enable and Get SSL
```bash
sudo ln -s /etc/nginx/sites-available/interview-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📱 Testing on Multiple Devices

### Device 1 (Interviewer):
1. Open browser
2. Go to: `http://178.128.59.218:3000/joinInterview`
3. Create interview room
4. Copy participant link

### Device 2 (Participant):
1. Open browser
2. Open the participant link
3. Should connect to same interview room

### Device 3, 4, 5... (More devices):
Same process - just open the participant link!

---

## 🎯 Quick Deploy Script

Save this as `deploy.sh` on your Digital Ocean server:

```bash
#!/bin/bash

echo "🚀 Deploying Interview App..."

# Pull latest code
cd /home/RealTime-InterviewAI
git pull

# Backend
echo "📦 Updating backend..."
cd backend/node
npm install
pm2 restart interview-backend

# Frontend
echo "🎨 Building frontend..."
cd ../../frontend
npm install
npm run build
pm2 restart interview-frontend

echo "✅ Deployment complete!"
pm2 list
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 💡 Tips

1. **Keep PM2 processes running after reboot:**
   ```bash
   pm2 startup
   pm2 save
   ```

2. **Monitor resources:**
   ```bash
   pm2 monit
   ```

3. **Update from local machine:**
   - Commit changes to GitHub
   - On server: `cd /home/RealTime-InterviewAI && git pull`
   - Run deploy script

4. **Backup MongoDB:**
   ```bash
   mongodump --out /home/backups/$(date +%Y%m%d)
   ```

---

Good luck with your deployment! 🚀
