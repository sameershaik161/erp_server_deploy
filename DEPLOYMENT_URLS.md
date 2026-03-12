# Deployment URLs Configuration

## Ubuntu Server Deployment

### Server Information
- **Server IP**: `160.187.169.41`
- **Base Path**: `/skillflux`

### Frontend URLs
- **Main App**: `http://160.187.169.41/skillflux`
- **Login**: `http://160.187.169.41/skillflux/login`
- **Register**: `http://160.187.169.41/skillflux/register`
- **Dashboard**: `http://160.187.169.41/skillflux/dashboard`

### Backend URLs
- **API Base**: `http://160.187.169.41/skillflux/api`
- **Health Check**: `http://160.187.169.41/skillflux/api/health`
- **Auth Login**: `http://160.187.169.41/skillflux/api/auth/login`
- **Auth Register**: `http://160.187.169.41/skillflux/api/auth/register`
- **File Uploads**: `http://160.187.169.41/skillflux/uploads`

### Environment Variables (.env.production)
```env
VITE_API_BASE_URL=http://160.187.169.41/skillflux/api
VITE_BACKEND_URL=http://160.187.169.41/skillflux
```

## Quick Test Commands

### Test Backend Health
```bash
curl http://160.187.169.41/skillflux/api/health
```

### Test Frontend Loading
```bash
curl http://160.187.169.41/skillflux
```

## After Deploying

1. Visit: `http://160.187.169.41/skillflux`
2. Check browser console for API connection logs
3. Test login/register functionality
4. Verify file uploads work correctly

## Note for SSL/HTTPS
If you add SSL certificate later, update `.env.production` URLs from `http://` to `https://`
