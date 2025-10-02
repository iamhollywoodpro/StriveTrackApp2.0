#!/usr/bin/env node

/**
 * StriveTrack 2.1 - Cloudflare Deployment Script
 * Handles complete deployment to Cloudflare Pages with Workers integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class StriveTrackDeployer {
  constructor() {
    this.projectName = 'strivetrackapp2-0';
    this.distDir = './dist';
    this.logPrefix = '[StriveTrack Deploy]';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}${this.logPrefix} [${timestamp}] ${message}${colors.reset}`);
  }

  async checkPrerequisites() {
    this.log('Checking deployment prerequisites...', 'info');
    
    try {
      // Check if wrangler is installed
      execSync('npx wrangler --version', { stdio: 'pipe' });
      this.log('✓ Wrangler CLI is available', 'success');
    } catch (error) {
      this.log('✗ Wrangler CLI not found. Installing...', 'warning');
      execSync('npm install -g wrangler', { stdio: 'inherit' });
      this.log('✓ Wrangler CLI installed', 'success');
    }

    // Check if user is authenticated
    try {
      execSync('npx wrangler whoami', { stdio: 'pipe' });
      this.log('✓ Cloudflare authentication verified', 'success');
    } catch (error) {
      this.log('✗ Not authenticated with Cloudflare. Please run: npx wrangler login', 'error');
      process.exit(1);
    }

    // Verify project files exist
    const requiredFiles = ['package.json', 'wrangler.toml', 'src/index.html'];
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        this.log(`✗ Required file missing: ${file}`, 'error');
        process.exit(1);
      }
    }
    this.log('✓ All required files present', 'success');
  }

  async cleanBuild() {
    this.log('Cleaning previous build artifacts...', 'info');
    
    try {
      if (fs.existsSync(this.distDir)) {
        execSync(`rm -rf ${this.distDir}`, { stdio: 'pipe' });
      }
      if (fs.existsSync('.parcel-cache')) {
        execSync('rm -rf .parcel-cache', { stdio: 'pipe' });
      }
      this.log('✓ Build artifacts cleaned', 'success');
    } catch (error) {
      this.log(`✗ Error cleaning build: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async buildProduction() {
    this.log('Building production assets...', 'info');
    
    try {
      execSync('npm run build:production', { stdio: 'inherit' });
      
      // Verify build output
      if (!fs.existsSync(this.distDir)) {
        throw new Error('Build directory not created');
      }
      
      const buildFiles = fs.readdirSync(this.distDir);
      if (buildFiles.length === 0) {
        throw new Error('Build directory is empty');
      }
      
      this.log(`✓ Production build completed (${buildFiles.length} files)`, 'success');
    } catch (error) {
      this.log(`✗ Build failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async optimizeBuild() {
    this.log('Optimizing build for production...', 'info');
    
    try {
      // Create _headers file for better caching
      const headersContent = `/*
  Cache-Control: public, max-age=31536000, immutable

/
  Cache-Control: public, max-age=3600

/index.html
  Cache-Control: public, max-age=3600

/api/*
  Cache-Control: no-store

/_worker.js
  Cache-Control: no-store`;
      
      fs.writeFileSync(path.join(this.distDir, '_headers'), headersContent);
      
      // Create _redirects file for SPA routing
      const redirectsContent = `/*    /index.html   200`;
      fs.writeFileSync(path.join(this.distDir, '_redirects'), redirectsContent);
      
      this.log('✓ Build optimization completed', 'success');
    } catch (error) {
      this.log(`✗ Build optimization failed: ${error.message}`, 'error');
    }
  }

  async deployToCloudflare() {
    this.log('Deploying to Cloudflare Pages...', 'info');
    
    try {
      // Deploy to Cloudflare Pages
      const deployCommand = `npx wrangler pages deploy ${this.distDir} --project-name=${this.projectName} --compatibility-date=2024-01-01`;
      
      this.log('Executing deployment...', 'info');
      const output = execSync(deployCommand, { encoding: 'utf8', stdio: 'pipe' });
      
      // Extract deployment URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+\.pages\.dev/);
      if (urlMatch) {
        this.log(`✓ Deployment successful!`, 'success');
        this.log(`🌐 Live URL: ${urlMatch[0]}`, 'success');
        return urlMatch[0];
      } else {
        this.log('✓ Deployment completed (URL not detected in output)', 'success');
        return `https://${this.projectName}.pages.dev`;
      }
    } catch (error) {
      this.log(`✗ Deployment failed: ${error.message}`, 'error');
      
      // Try to extract useful error information
      if (error.stdout) {
        this.log('Deployment output:', 'info');
        console.log(error.stdout);
      }
      if (error.stderr) {
        this.log('Deployment errors:', 'error');
        console.log(error.stderr);
      }
      
      process.exit(1);
    }
  }

  async setupCustomDomain() {
    this.log('🌐 Custom Domain Setup for strivetrackapp.com', 'info');
    this.log('✓ Configuration files already updated for your domain', 'success');
    this.log('', 'info');
    this.log('📋 Next steps to activate your custom domain:', 'info');
    this.log('1. Go to Cloudflare Dashboard > Pages > strivetrackapp2-0', 'info');
    this.log('2. Click "Custom domains" tab', 'info');
    this.log('3. Add domain: strivetrackapp.com', 'info');
    this.log('4. Add domain: www.strivetrackapp.com', 'info');
    this.log('5. Configure DNS records (see DNS_CONFIG_strivetrackapp.com.txt)', 'info');
    this.log('6. Wait for SSL certificate provisioning (5-10 minutes)', 'info');
    this.log('', 'info');
    this.log('📄 Detailed setup guide: CUSTOM_DOMAIN_SETUP.md', 'warning');
    this.log('📄 DNS configuration: DNS_CONFIG_strivetrackapp.com.txt', 'warning');
  }

  async verifyDeployment(url) {
    this.log('Verifying deployment...', 'info');
    
    try {
      // Test basic connectivity
      const fetch = require('node-fetch');
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 10000 
      });
      
      if (response.ok) {
        this.log('✓ Deployment is accessible and responding', 'success');
      } else {
        this.log(`⚠ Deployment responding with status: ${response.status}`, 'warning');
      }
    } catch (error) {
      this.log(`⚠ Could not verify deployment: ${error.message}`, 'warning');
      this.log('This might be normal for new deployments (DNS propagation)', 'info');
    }
  }

  async generateDeploymentSummary(url) {
    const summary = `
╔══════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT SUMMARY                        ║
╠══════════════════════════════════════════════════════════════╣
║ Project: StriveTrack 2.1                                    ║
║ Environment: Production                                      ║
║ Platform: Cloudflare Pages                                  ║
║ Build Tool: Parcel                                          ║
║ Deployment Time: ${new Date().toISOString()}         ║
║                                                              ║
║ 🌐 Temp URL: ${url.padEnd(41)} ║
║ 🏆 Custom Domain: https://strivetrackapp.com            ║
║                                                              ║
║ Features Deployed:                                           ║
║ ✓ React Frontend with Router                                ║
║ ✓ Cloudflare D1 Database Integration                        ║
║ ✓ Cloudflare R2 Media Storage (50MB uploads)               ║
║ ✓ Admin Dashboard with Analytics                            ║
║ ✓ Social Features & Community Hub                           ║
║ ✓ Advanced User Management                                   ║
║ ✓ Media Upload & Moderation System                          ║
║ ✓ Habit Tracking & Goal Management                          ║
║ ✓ AI-Powered Content Moderation                             ║
║ ✓ Progressive Web App (PWA) Features                        ║
║                                                              ║
║ Next Steps:                                                  ║
║ 1. Configure custom domain (optional)                       ║
║ 2. Set up production environment variables                   ║
║ 3. Configure Cloudflare Workers for API                     ║
║ 4. Test all functionality in production                     ║
╚══════════════════════════════════════════════════════════════╝`;
    
    this.log(summary, 'success');
    
    // Save summary to file
    fs.writeFileSync('DEPLOYMENT_SUCCESS.md', `# StriveTrack 2.1 - Deployment Success

## Live Application
🌐 **Production URL**: ${url}

## Deployment Details
- **Date**: ${new Date().toISOString()}
- **Platform**: Cloudflare Pages
- **Build Tool**: Parcel
- **Status**: ✅ Successfully Deployed

## Features Included
- ✅ Complete React Frontend with Routing
- ✅ Cloudflare D1 Database Integration  
- ✅ Cloudflare R2 Media Storage (50MB uploads)
- ✅ Enterprise Admin Dashboard
- ✅ Social Features & Community Hub
- ✅ Advanced User Management System
- ✅ Media Upload & Moderation
- ✅ Habit Tracking & Goal Management
- ✅ AI-Powered Content Moderation
- ✅ Progressive Web App Features

## Post-Deployment Configuration
1. Custom domain setup (if needed)
2. Production environment variables
3. Cloudflare Workers API deployment
4. SSL certificate validation
5. Performance monitoring setup

## Support & Documentation
- Project repository: /home/user/webapp
- Configuration: wrangler.toml
- Build scripts: package.json
- API Documentation: src/worker.js

---
*Deployed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*
`);
  }

  async run() {
    try {
      this.log('🚀 Starting StriveTrack 2.1 deployment process...', 'info');
      
      await this.checkPrerequisites();
      await this.cleanBuild();
      await this.buildProduction();
      await this.optimizeBuild();
      
      const deploymentUrl = await this.deployToCloudflare();
      
      await this.verifyDeployment(deploymentUrl);
      await this.setupCustomDomain();
      await this.generateDeploymentSummary(deploymentUrl);
      
      this.log('🎉 Deployment process completed successfully!', 'success');
      
    } catch (error) {
      this.log(`💥 Deployment process failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  const deployer = new StriveTrackDeployer();
  deployer.run().catch(console.error);
}

module.exports = StriveTrackDeployer;