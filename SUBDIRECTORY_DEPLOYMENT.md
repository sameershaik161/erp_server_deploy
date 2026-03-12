# Deployment Steps for /skillflux Subdirectory

## Changes Made
1. ✅ Added `base: '/skillflux/'` to `vite.config.js`
2. ✅ Added `basename="/skillflux"` to BrowserRouter in `App.jsx`
3. ✅ Created nginx configuration example
4. ✅ Updated `.env.production` with Ubuntu server URLs (`http://160.187.169.41/skillflux/api`)

## What You Need to Do Now

### 1. Rebuild the Frontend
The `.env.production` file is now configured with your server IP `http://160.187.169.41/skillflux/api`

```bash
cd frontend/skillflux
npm run build
```

This will create a production build using the URLs from `.env.production`

### 2. Copy Build Files to Server
Copy the `frontend/skillflux/dist` folder to your Ubuntu server:
```bash
# On your local machine
scp -r frontend/skillflux/dist username@your-server-ip:/path/to/deployment/
```

### 3. Configure Nginx on Ubuntu Server

**Option A: Create a new site configuration**
```bash
sudo nano /etc/nginx/sites-available/skillflux
# Paste the content from nginx-skillflux.conf
# Update the paths and domain/IP

sudo ln -s /etc/nginx/sites-available/skillflux /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Option B: Add to existing nginx config**
```bash
sudo nano /etc/nginx/sites-available/default
# Add the location blocks from nginx-skillflux.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Update Backend API URLs
Your backend is already deployed at: `http://160.187.169.41/skillflux/api/health`

The frontend is now configured to use this URL. Make sure your backend is:
- Running on port 5000 (or update nginx config if different)
- Properly configured with environment variables

On your Ubuntu server, create/update `.env` file in backend directory:
```env
NODE_ENV=production
PORT=5000
# Add your other environment variables
```

### 5. Start/Restart Backend
```bash
cd backend
npm install
# Using PM2 (recommended)
pm2 start server.js --name erp-backend
pm2 save

# Or using systemd service (better for production)
# Create a systemd service file
```

### 6. Verify Deployment
- Go to `http://your-server-ip/skillflux`
- The app should load without 404
- Click "Go to Home" - it should stay at `/skillflux/`
- Test API connections (login, register, etc.)

## Troubleshooting

### Issue: Still getting 404
- Check nginx error logs: `sudo tail -f /var/nginx/error.log`
- Verify the alias path in nginx points to correct dist folder
- Ensure nginx has read permissions: `sudo chmod -R 755 /path/to/dist`

### Issue: API not connecting
- Check if backend is running: `pm2 status` or `netstat -tlnp | grep 5000`
- Check backend logs: `pm2 logs erp-backend`
- Verify firewall allows port 5000: `sudo ufw status`

### Issue: Assets/Images not loading
- Check browser console for 404 errors
- Verify Vite base path is set correctly
- Rebuild the frontend after changes

### Issue: Routes not working (404 on refresh)
- Nginx `try_files` directive must redirect to `/skillflux/index.html`
- Verify the nginx configuration matches the example

## Important Notes
1. Always rebuild frontend after changing `vite.config.js`
2. The `basename` in BrowserRouter must match the nginx location path
3. Clear browser cache after deploying new build
4. Use environment variables for API URLs (don't hardcode production URLs)
