# 🌐 StriveTrack 2.1 - Custom Domain Setup Guide

## Domain: `strivetrackapp.com` Configuration

### 📋 Overview
Setting up StriveTrack 2.1 on your custom domain `strivetrackapp.com` with complete Cloudflare integration.

### 🎯 Final Domain Structure
- **Main App**: `https://strivetrackapp.com`
- **API Endpoints**: `https://api.strivetrackapp.com` 
- **Alternative API**: `https://strivetrackapp.com/api/*`
- **Media CDN**: `https://media.strivetrackapp.com` (optional)

---

## 📖 Step-by-Step Setup Process

### Step 1: Deploy Application to Cloudflare Pages

First, deploy your application to get the Cloudflare infrastructure ready:

```bash
cd /home/user/webapp

# Run pre-deployment checks
npm run preflight

# Deploy to Cloudflare Pages (initially on *.pages.dev)
npm run deploy

# Deploy the Worker API
npm run deploy:worker
```

### Step 2: Add Custom Domain in Cloudflare Pages

1. **Log into Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** section

2. **Select Your Project**
   - Click on `strivetrackapp2-0` project

3. **Add Custom Domain**
   - Go to **Custom domains** tab
   - Click **Set up a custom domain**
   - Enter: `strivetrackapp.com`
   - Click **Continue**

4. **Add WWW Subdomain** (Recommended)
   - Add another custom domain: `www.strivetrackapp.com`
   - Set up redirect from www to apex domain

### Step 3: DNS Configuration

Configure these DNS records in your domain registrar or Cloudflare DNS:

#### 🔧 Required DNS Records

```dns
# Main site (apex domain)
Type: CNAME
Name: strivetrackapp.com (or @)
Target: strivetrackapp2-0.pages.dev
Proxy: ✅ Proxied (Orange Cloud)

# WWW subdomain  
Type: CNAME
Name: www
Target: strivetrackapp2-0.pages.dev
Proxy: ✅ Proxied (Orange Cloud)

# API subdomain
Type: CNAME  
Name: api
Target: strivetrack-api.YOUR_ACCOUNT.workers.dev
Proxy: ✅ Proxied (Orange Cloud)

# Optional: Media CDN subdomain
Type: CNAME
Name: media  
Target: pub-YOUR_ACCOUNT.r2.dev
Proxy: ✅ Proxied (Orange Cloud)
```

#### 🔍 Find Your Account ID
```bash
npx wrangler whoami
# Look for: Account ID: abc123...
```

### Step 4: Update Worker Routes

After DNS is configured, update your Worker routes:

1. **Get Zone ID**
   ```bash
   # List your zones to find strivetrackapp.com zone ID
   npx wrangler zone list
   ```

2. **Update wrangler-worker.toml**
   - Open the generated `wrangler-worker.toml` file
   - Uncomment and update the routes section:
   ```toml
   [[routes]]
   pattern = "api.strivetrackapp.com/*"
   zone_id = "YOUR_ZONE_ID_HERE"
   
   # Optional: API at /api/* path
   [[routes]]
   pattern = "strivetrackapp.com/api/*" 
   zone_id = "YOUR_ZONE_ID_HERE"
   ```

3. **Redeploy Worker with Routes**
   ```bash
   npm run deploy:worker
   ```

### Step 5: SSL Certificate Verification

Cloudflare automatically provisions SSL certificates:

1. **Check Certificate Status**
   - In Cloudflare Dashboard → SSL/TLS → Edge Certificates
   - Verify certificate shows "Active" for your domain

2. **Enable Security Settings**
   - SSL/TLS encryption mode: **Full (strict)**
   - Always Use HTTPS: **On**
   - HTTP Strict Transport Security (HSTS): **Enable**

### Step 6: Update Application Configuration

Update your app to use the custom domain:

1. **Enable Custom Domain in wrangler.toml**
   ```toml
   # Uncomment these lines in wrangler.toml:
   [[route]]
   pattern = "strivetrackapp.com/*"
   zone_name = "strivetrackapp.com"

   [[route]]  
   pattern = "www.strivetrackapp.com/*"
   zone_name = "strivetrackapp.com"
   ```

2. **Redeploy Application**
   ```bash
   npm run deploy
   ```

---

## ✅ Verification Checklist

After setup, verify these work:

### 🌐 Domain Access
- [ ] `https://strivetrackapp.com` loads the app
- [ ] `https://www.strivetrackapp.com` redirects to apex domain  
- [ ] `http://strivetrackapp.com` redirects to HTTPS
- [ ] SSL certificate shows valid (green lock icon)

### 🔌 API Endpoints
- [ ] `https://api.strivetrackapp.com/health` returns JSON
- [ ] API calls from frontend work correctly
- [ ] CORS headers configured properly

### 📱 App Functionality  
- [ ] Login/authentication works
- [ ] Dashboard loads with data
- [ ] Media upload functions correctly
- [ ] Admin panel accessible
- [ ] Social features operational

---

## 🚀 Performance Optimizations

### Cloudflare Speed Settings
Enable these in Cloudflare Dashboard:

1. **Speed Tab**
   - Auto Minify: CSS, JavaScript, HTML ✅
   - Brotli Compression: ✅ 
   - Early Hints: ✅

2. **Caching Tab**
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours (or longer)

3. **Network Tab**  
   - HTTP/3: ✅ Enabled
   - 0-RTT Connection Resumption: ✅ Enabled
   - gRPC: ✅ Enabled

### Page Rules (Optional)
Create page rules for better caching:

```
Pattern: strivetrackapp.com/static/*
Settings: 
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### ❌ "Domain not found" or 404 errors
**Solution**: Check DNS propagation
```bash
# Check DNS resolution
nslookup strivetrackapp.com
dig strivetrackapp.com

# Wait up to 48 hours for full DNS propagation
```

#### ❌ SSL Certificate issues  
**Solution**: Verify domain ownership
- Ensure DNS records point to Cloudflare
- Check certificate status in SSL/TLS tab
- Try "Full" SSL mode instead of "Full (strict)"

#### ❌ API endpoints not working
**Solution**: Check Worker routes
- Verify zone_id is correct
- Ensure Worker is deployed after route configuration
- Check CORS headers in Worker code

#### ❌ Mixed content warnings
**Solution**: Update all URLs to HTTPS
- Check `.env.production` file
- Verify API base URL uses HTTPS
- Update any hardcoded HTTP URLs

### Debug Commands

```bash
# Check Wrangler configuration
npx wrangler whoami
npx wrangler zone list  

# Test API endpoints
curl https://api.strivetrackapp.com/health
curl https://strivetrackapp.com/api/health

# Check deployment status
npx wrangler pages deployment list --project-name strivetrackapp2-0
```

---

## 📊 Monitoring & Analytics

### Set up monitoring:

1. **Cloudflare Analytics**
   - Dashboard → Analytics & Logs
   - Monitor traffic, performance, security

2. **Worker Analytics** 
   - Monitor API endpoint usage
   - Track response times and errors

3. **Page Speed Insights**
   - Test: `https://strivetrackapp.com`
   - Optimize based on Core Web Vitals

---

## 🎉 Completion Summary

Once setup is complete, you'll have:

✅ **Production URLs:**
- Main App: `https://strivetrackapp.com`
- API: `https://api.strivetrackapp.com`  
- Media: Cloudflare R2 with custom domain

✅ **Features:**
- SSL/HTTPS with automatic renewal
- Global CDN with edge caching  
- DDoS protection and security
- 99.9% uptime guarantee
- Superior performance worldwide

✅ **Enterprise Infrastructure:**
- Cloudflare Pages hosting
- Cloudflare Workers API  
- Cloudflare D1 database
- Cloudflare R2 storage
- Custom domain with SSL

**Your StriveTrack 2.1 app is now live on a professional custom domain!** 🎊

---

*Setup Date: ${new Date().toLocaleDateString()}*
*Domain: strivetrackapp.com*  
*Status: Ready for Production*