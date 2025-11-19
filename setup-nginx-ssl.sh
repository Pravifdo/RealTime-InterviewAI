#!/bin/bash
# SSL Setup Script for project.praveenruchira.me
# Run this on your Digital Ocean server (142.93.220.168)

echo "🔒 Setting up HTTPS with Nginx + Let's Encrypt"
echo "=============================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use: sudo bash setup-nginx-ssl.sh)"
    exit 1
fi

# Update system
echo ""
echo "📦 Updating system packages..."
apt update

# Install nginx and certbot
echo ""
echo "📦 Installing Nginx and Certbot..."
apt install nginx certbot python3-certbot-nginx -y

# Stop nginx temporarily
systemctl stop nginx

# Create nginx config
echo ""
echo "📝 Creating nginx configuration..."
cat > /etc/nginx/sites-available/interview-app << 'EOF'
# Nginx Configuration for project.praveenruchira.me
# Initial HTTP-only config (SSL will be added by certbot)

server {
    listen 80;
    listen [::]:80;
    server_name project.praveenruchira.me;

    # Frontend - Serve React app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API - Proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO - WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeout settings
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Increase body size for file uploads
    client_max_body_size 50M;
}
EOF

# Enable the site
echo "🔗 Enabling site configuration..."
ln -sf /etc/nginx/sites-available/interview-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo ""
echo "🧪 Testing nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Start nginx
echo ""
echo "🚀 Starting nginx..."
systemctl start nginx
systemctl enable nginx

# Check if DNS is ready
echo ""
echo "🔍 Checking DNS for project.praveenruchira.me..."
DNS_IP=$(dig +short project.praveenruchira.me | tail -n1)

if [ -z "$DNS_IP" ]; then
    echo "⚠️  WARNING: DNS not found for project.praveenruchira.me"
    echo ""
    echo "Before continuing:"
    echo "1. Go to your DNS provider (Namecheap, GoDaddy, etc.)"
    echo "2. Add A record: project -> 142.93.220.168"
    echo "3. Wait 5-10 minutes for DNS to propagate"
    echo "4. Run this command to check: dig +short project.praveenruchira.me"
    echo ""
    echo "Once DNS is ready, run this to get SSL certificate:"
    echo "sudo certbot --nginx -d project.praveenruchira.me"
    exit 0
elif [ "$DNS_IP" != "142.93.220.168" ]; then
    echo "⚠️  WARNING: DNS points to $DNS_IP but should be 142.93.220.168"
    echo "Update your DNS settings and wait for propagation before getting SSL"
    exit 0
fi

echo "✅ DNS is correctly configured!"

# Get SSL certificate
echo ""
echo "🔒 Getting SSL certificate from Let's Encrypt..."
echo "You'll need to provide an email address."
echo ""

certbot --nginx -d project.praveenruchira.me --non-interactive --agree-tos --redirect || {
    echo ""
    echo "⚠️  Certbot failed. This might be because:"
    echo "1. DNS is not fully propagated yet (wait 10 more minutes)"
    echo "2. Port 80/443 is not open in firewall"
    echo ""
    echo "To retry manually:"
    echo "sudo certbot --nginx -d project.praveenruchira.me"
    exit 1
}

# Setup auto-renewal
echo ""
echo "🔄 Setting up SSL certificate auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Reload nginx
systemctl reload nginx

echo ""
echo "✅ SSL SETUP COMPLETE!"
echo "=============================================="
echo ""
echo "🎉 Your app is now available at:"
echo "   https://project.praveenruchira.me"
echo ""
echo "🔍 Verify SSL:"
echo "   https://www.ssllabs.com/ssltest/analyze.html?d=project.praveenruchira.me"
echo ""
echo "📋 Useful commands:"
echo "   sudo nginx -t                    # Test nginx config"
echo "   sudo systemctl reload nginx      # Reload nginx"
echo "   sudo certbot renew --dry-run     # Test SSL renewal"
echo "   sudo certbot certificates        # View certificates"
echo ""
