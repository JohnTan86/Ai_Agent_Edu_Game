import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const stashDir = path.join(rootDir, '.api_stash_tmp');
const outDir = path.join(rootDir, 'out');
const zipFile = path.join(rootDir, 'roboflow-cpanel.zip');

console.log('🚀 Building RoboFlow for cPanel...');

try {
  // Temporarily stash src/app/api so Next.js static export succeeds cleanly
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, stashDir);
  }

  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, CPANEL_EXPORT: 'true' }
  });
} finally {
  // Always restore src/app/api for local dev
  if (fs.existsSync(stashDir)) {
    fs.renameSync(stashDir, apiDir);
  }
}

// Package out/ directory (including .htaccess and api/dispatch/index.php) into roboflow-cpanel.zip
if (fs.existsSync(outDir)) {
  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }
  execSync(`cd "${outDir}" && zip -r "${zipFile}" .`, { stdio: 'inherit' });
  console.log('\n✅ cPanel build complete!');
  console.log(`📁 Static folder ready for SSH/FTP upload: ${outDir}`);
  console.log(`📦 Zip archive ready for cPanel: ${zipFile}`);
}
