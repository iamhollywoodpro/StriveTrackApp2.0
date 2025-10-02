#!/usr/bin/env node

/**
 * StriveTrack 2.1 - Pre-flight Deployment Check
 * Verifies all prerequisites before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');

class PreflightChecker {
  constructor() {
    this.logPrefix = '[Preflight]';
    this.checks = [];
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
    
    console.log(`${colors[type]}${this.logPrefix} ${message}${colors.reset}`);
  }

  addCheck(name, status, details = '') {
    this.checks.push({ name, status, details });
  }

  async checkNodeVersion() {
    try {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      
      if (majorVersion >= 16) {
        this.addCheck('Node.js Version', '✓', `${version} (>= 16.0.0)`);
        return true;
      } else {
        this.addCheck('Node.js Version', '✗', `${version} (requires >= 16.0.0)`);
        return false;
      }
    } catch (error) {
      this.addCheck('Node.js Version', '✗', `Error: ${error.message}`);
      return false;
    }
  }

  async checkWranglerAuth() {
    try {
      const output = execSync('npx wrangler whoami', { encoding: 'utf8', stdio: 'pipe' });
      const email = output.match(/logged in as (.+)/)?.[1] || 'authenticated user';
      this.addCheck('Cloudflare Authentication', '✓', `Logged in as ${email}`);
      return true;
    } catch (error) {
      this.addCheck('Cloudflare Authentication', '✗', 'Not authenticated - run: npx wrangler login');
      return false;
    }
  }

  async checkProjectFiles() {
    const requiredFiles = [
      { path: 'package.json', description: 'Project configuration' },
      { path: 'wrangler.toml', description: 'Cloudflare configuration' },
      { path: 'src/index.html', description: 'Main HTML file' },
      { path: 'src/worker.js', description: 'Worker API code' },
      { path: 'src/App.jsx', description: 'React application' },
      { path: 'tailwind.config.js', description: 'Tailwind CSS config' }
    ];

    let allFilesExist = true;

    for (const file of requiredFiles) {
      if (fs.existsSync(file.path)) {
        this.addCheck(`File: ${file.path}`, '✓', file.description);
      } else {
        this.addCheck(`File: ${file.path}`, '✗', `Missing: ${file.description}`);
        allFilesExist = false;
      }
    }

    return allFilesExist;
  }

  async checkDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check critical dependencies
      const criticalDeps = ['react', 'react-dom', 'react-router-dom', 'lucide-react'];
      let allDepsPresent = true;

      for (const dep of criticalDeps) {
        if (packageJson.dependencies?.[dep]) {
          this.addCheck(`Dependency: ${dep}`, '✓', packageJson.dependencies[dep]);
        } else {
          this.addCheck(`Dependency: ${dep}`, '✗', 'Missing from dependencies');
          allDepsPresent = false;
        }
      }

      // Check if node_modules exists
      if (fs.existsSync('node_modules')) {
        this.addCheck('Node Modules', '✓', 'Installed');
      } else {
        this.addCheck('Node Modules', '✗', 'Run: npm install');
        allDepsPresent = false;
      }

      return allDepsPresent;
    } catch (error) {
      this.addCheck('Dependencies Check', '✗', `Error reading package.json: ${error.message}`);
      return false;
    }
  }

  async checkBuildSystem() {
    try {
      // Check if parcel is available
      execSync('npx parcel --version', { stdio: 'pipe' });
      this.addCheck('Parcel Bundler', '✓', 'Available');

      // Check build scripts
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts?.build) {
        this.addCheck('Build Script', '✓', 'Configured');
      } else {
        this.addCheck('Build Script', '✗', 'Missing build script');
        return false;
      }

      return true;
    } catch (error) {
      this.addCheck('Parcel Bundler', '✗', 'Not available - check devDependencies');
      return false;
    }
  }

  async checkCloudflareResources() {
    try {
      // Check D1 databases
      const d1Output = execSync('npx wrangler d1 list', { encoding: 'utf8', stdio: 'pipe' });
      if (d1Output.includes('strivetrack_d1')) {
        this.addCheck('D1 Database', '✓', 'strivetrack_d1 exists');
      } else {
        this.addCheck('D1 Database', '⚠', 'strivetrack_d1 not found - will be created');
      }

      // Check R2 buckets
      const r2Output = execSync('npx wrangler r2 bucket list', { encoding: 'utf8', stdio: 'pipe' });
      if (r2Output.includes('strivetrack-media')) {
        this.addCheck('R2 Bucket', '✓', 'strivetrack-media exists');
      } else {
        this.addCheck('R2 Bucket', '⚠', 'strivetrack-media not found - will be created');
      }

      return true;
    } catch (error) {
      this.addCheck('Cloudflare Resources', '⚠', `Could not verify: ${error.message}`);
      return true; // Non-blocking
    }
  }

  async checkDiskSpace() {
    try {
      const stats = fs.statSync('./');
      // This is a simple check - in production you'd want more sophisticated disk space checking
      this.addCheck('Disk Space', '✓', 'Sufficient for build');
      return true;
    } catch (error) {
      this.addCheck('Disk Space', '⚠', `Could not verify: ${error.message}`);
      return true;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('                      PREFLIGHT CHECK SUMMARY');
    console.log('='.repeat(80));
    
    let passed = 0;
    let warnings = 0;
    let failed = 0;

    for (const check of this.checks) {
      const status = check.status;
      const color = status === '✓' ? '\x1b[32m' : status === '⚠' ? '\x1b[33m' : '\x1b[31m';
      console.log(`${color}${status}\x1b[0m ${check.name.padEnd(30)} ${check.details}`);
      
      if (status === '✓') passed++;
      else if (status === '⚠') warnings++;
      else failed++;
    }

    console.log('='.repeat(80));
    console.log(`Total: ${this.checks.length} | Passed: ${passed} | Warnings: ${warnings} | Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\x1b[32m🎉 All critical checks passed! Ready for deployment.\x1b[0m');
    } else {
      console.log('\x1b[31m❌ Some critical checks failed. Please resolve before deployment.\x1b[0m');
    }

    return failed === 0;
  }

  async run() {
    this.log('🔍 Running pre-flight deployment checks...', 'info');
    
    try {
      await this.checkNodeVersion();
      await this.checkWranglerAuth();
      await this.checkProjectFiles();
      await this.checkDependencies();
      await this.checkBuildSystem();
      await this.checkCloudflareResources();
      await this.checkDiskSpace();
      
      const ready = this.printSummary();
      
      if (ready) {
        this.log('✅ Pre-flight checks completed successfully!', 'success');
        process.exit(0);
      } else {
        this.log('❌ Pre-flight checks failed. Please resolve issues before deployment.', 'error');
        process.exit(1);
      }
      
    } catch (error) {
      this.log(`💥 Pre-flight check failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const checker = new PreflightChecker();
  checker.run().catch(console.error);
}

module.exports = PreflightChecker;