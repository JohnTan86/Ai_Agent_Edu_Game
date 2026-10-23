import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const commitMsg = process.argv.slice(2).join(' ') || `chore: update and deploy RoboFlow (${new Date().toISOString().slice(0, 19).replace('T', ' ')})`;

// Load .env.deploy.local if present
const envFile = path.join(rootDir, '.env.deploy.local');
const deployEnv = {};
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      deployEnv[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
}

console.log('====================================================');
console.log('🚀 Step 1/3: Building cPanel Production Bundle...');
console.log('====================================================');
execSync('node scripts/build-cpanel.mjs', { stdio: 'inherit' });

console.log('\n====================================================');
console.log('📤 Step 2/3: Committing & Pushing to GitHub...');
console.log('====================================================');
execSync('git add -A', { stdio: 'inherit' });
const status = execSync('git status --porcelain').toString().trim();
if (status) {
  execSync(`git commit -m ${JSON.stringify(commitMsg)}`, { stdio: 'inherit' });
} else {
  console.log('ℹ️ Working tree already clean.');
}
execSync('git push origin main', { stdio: 'inherit' });

console.log('\n====================================================');
console.log('🌐 Step 3/3: Triggering Live cPanel Sync on eduagent.makerkluang.com...');
console.log('====================================================');

const webhookUrl = deployEnv.DEPLOY_WEBHOOK_URL || 'https://eduagent.makerkluang.com/api/git-sync/index.php';
const secretToken = deployEnv.DEPLOY_SECRET_TOKEN || '';

if (secretToken) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'X-Deploy-Token': secretToken,
        'User-Agent': 'RoboFlow-Ship-CLI/1.0'
      }
    });
    const text = await res.text();
    if (res.ok) {
      console.log('✅ Live website updated automatically:', text);
    } else {
      console.log(`⚠️ Live webhook returned HTTP ${res.status}: ${text}`);
      console.log('💡 Note: If this is your first deployment, click "Deploy HEAD Commit" once in cPanel -> Git Version Control to activate the live auto-sync endpoint.');
    }
  } catch (err) {
    console.log(`⚠️ Could not reach ${webhookUrl} (${err.message}).`);
    console.log('💡 Once you click "Deploy HEAD Commit" once in cPanel -> Git Version Control, future runs of "npm run ship" will auto-sync the live site!');
  }
}
