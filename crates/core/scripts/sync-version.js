#!/usr/bin/env node
/**
 * Sync version from main package.json to all platform-specific packages
 */

const fs = require('fs');
const path = require('path');

// Read main package.json version
const mainPackagePath = path.join(__dirname, '../../../package.json');
const mainPackage = JSON.parse(fs.readFileSync(mainPackagePath, 'utf8'));
const version = mainPackage.version;

console.log(`📦 Syncing version: ${version}`);

// Find all npm platform packages
const npmDir = path.join(__dirname, '../npm');
const platforms = fs.readdirSync(npmDir);

let updated = 0;

for (const platform of platforms) {
  const platformDir = path.join(npmDir, platform);
  const packageJsonPath = path.join(platformDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    continue;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (packageJson.version !== version) {
    packageJson.version = version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated ${platform}: ${version}`);
    updated++;
  } else {
    console.log(`⏭️  ${platform}: already at ${version}`);
  }
}

// Update optionalDependencies in main package.json
console.log(`\n📝 Updating optionalDependencies in main package.json...`);

let mainUpdated = false;
if (mainPackage.optionalDependencies) {
  for (const [depName, depVersion] of Object.entries(mainPackage.optionalDependencies)) {
    // Only update @doctypedev/core-* packages
    if (depName.startsWith('@doctypedev/core-')) {
      const expectedVersion = `^${version}`;
      if (depVersion !== expectedVersion) {
        mainPackage.optionalDependencies[depName] = expectedVersion;
        console.log(`✅ Updated ${depName}: ${depVersion} → ${expectedVersion}`);
        mainUpdated = true;
      } else {
        console.log(`⏭️  ${depName}: already at ${expectedVersion}`);
      }
    }
  }

  if (mainUpdated) {
    fs.writeFileSync(mainPackagePath, JSON.stringify(mainPackage, null, 2) + '\n');
    console.log(`✅ Main package.json updated`);
  }
}

console.log(`\n✨ Updated ${updated} platform package(s)${mainUpdated ? ' and main package.json' : ''}`);
