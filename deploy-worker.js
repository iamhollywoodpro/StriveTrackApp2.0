#!/usr/bin/env node

/**
 * StriveTrack 2.1 - Cloudflare Worker Deployment Script
 * Deploys the backend API as a Cloudflare Worker with D1 and R2 bindings
 */

const { execSync } = require('child_process');
const fs = require('fs');

class WorkerDeployer {
  constructor() {
    this.workerName = 'strivetrack-api';
    this.logPrefix = '[Worker Deploy]';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${this.logPrefix} [${timestamp}] ${message}${colors.reset}`);
  }

  async createWorkerConfig() {
    this.log('Creating Worker-specific wrangler configuration...', 'info');
    
    const workerConfig = `name = "strivetrack-api"
compatibility_date = "2024-01-01"
main = "src/worker.js"

# D1 Database Bindings
[[d1_databases]]
binding = "DB"
database_name = "strivetrack_d1"

# R2 Storage Bindings  
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "strivetrack-media"

# KV Namespace for Sessions
[[kv_namespaces]]
binding = "SESSIONS"
id = ""
preview_id = ""

# Environment Variables
[vars]
ENVIRONMENT = "production"
CUSTOM_DOMAIN = "strivetrackapp.com"
R2_PUBLIC_URL = "https://pub-ACCOUNT_ID.r2.dev"
CORS_ORIGIN = "https://strivetrackapp.com"

# Custom Domain Routes (uncomment after DNS setup)
# [[routes]]
# pattern = "api.strivetrackapp.com/*"
# zone_id = "YOUR_ZONE_ID_HERE"

# Alternative API route (recommended)
# [[routes]]
# pattern = "strivetrackapp.com/api/*"
# zone_id = "YOUR_ZONE_ID_HERE"`;

    fs.writeFileSync('wrangler-worker.toml', workerConfig);
    this.log('✓ Worker configuration created', 'success');
  }

  async deployWorker() {
    this.log('Deploying Cloudflare Worker...', 'info');
    
    try {
      const deployCommand = 'npx wrangler deploy --config wrangler-worker.toml';
      
      this.log('Executing worker deployment...', 'info');
      const output = execSync(deployCommand, { encoding: 'utf8', stdio: 'pipe' });
      
      // Extract worker URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+\.workers\.dev/);
      if (urlMatch) {
        this.log(`✓ Worker deployed successfully!`, 'success');
        this.log(`🌐 Worker URL: ${urlMatch[0]}`, 'success');
        return urlMatch[0];
      } else {
        this.log('✓ Worker deployment completed', 'success');
        return `https://strivetrack-api.ACCOUNT_ID.workers.dev`;
      }
    } catch (error) {
      this.log(`✗ Worker deployment failed: ${error.message}`, 'error');
      
      if (error.stdout) {
        this.log('Deployment output:', 'info');
        console.log(error.stdout);
      }
      if (error.stderr) {
        this.log('Deployment errors:', 'error');
        console.log(error.stderr);
      }
      
      throw error;
    }
  }

  async setupD1Database() {
    this.log('Setting up D1 database bindings...', 'info');
    
    try {
      // List existing databases
      const listOutput = execSync('npx wrangler d1 list', { encoding: 'utf8' });
      
      if (listOutput.includes('strivetrack_d1')) {
        this.log('✓ D1 database "strivetrack_d1" already exists', 'success');
      } else {
        this.log('Creating D1 database "strivetrack_d1"...', 'info');
        execSync('npx wrangler d1 create strivetrack_d1', { stdio: 'inherit' });
        this.log('✓ D1 database created', 'success');
      }
    } catch (error) {
      this.log(`⚠ D1 setup note: ${error.message}`, 'warning');
      this.log('Please ensure D1 database exists in Cloudflare Dashboard', 'info');
    }
  }

  async setupR2Bucket() {
    this.log('Setting up R2 bucket bindings...', 'info');
    
    try {
      // List existing buckets
      const listOutput = execSync('npx wrangler r2 bucket list', { encoding: 'utf8' });
      
      if (listOutput.includes('strivetrack-media')) {
        this.log('✓ R2 bucket "strivetrack-media" already exists', 'success');
      } else {
        this.log('Creating R2 bucket "strivetrack-media"...', 'info');
        execSync('npx wrangler r2 bucket create strivetrack-media', { stdio: 'inherit' });
        this.log('✓ R2 bucket created', 'success');
      }
    } catch (error) {
      this.log(`⚠ R2 setup note: ${error.message}`, 'warning');
      this.log('Please ensure R2 bucket exists in Cloudflare Dashboard', 'info');
    }
  }

  async run() {
    try {
      this.log('🚀 Starting Cloudflare Worker deployment...', 'info');
      
      await this.createWorkerConfig();
      await this.setupD1Database();
      await this.setupR2Bucket();
      
      const workerUrl = await this.deployWorker();
      
      this.log('🎉 Worker deployment completed successfully!', 'success');
      this.log(`📋 Next steps:`, 'info');
      this.log(`1. Update frontend API base URL to: ${workerUrl}`, 'info');
      this.log(`2. Configure D1 database ID in wrangler-worker.toml`, 'info');
      this.log(`3. Set up KV namespace for sessions`, 'info');
      this.log(`4. Test API endpoints`, 'info');
      
    } catch (error) {
      this.log(`💥 Worker deployment failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const deployer = new WorkerDeployer();
  deployer.run().catch(console.error);
}

module.exports = WorkerDeployer;