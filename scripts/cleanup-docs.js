import fs from 'fs';
import path from 'path';

// Files to be removed
const filesToRemove = [
  'IMPLEMENTATION_PLAN_PHASE3.md',
  'IMPLEMENTATION_PLAN_PHASE4.md',
  'IMPLEMENTATION_PLAN_PHASE5.md',
  'IMPLEMENTATION_PLAN_PHASE6.md',
  'IMPLEMENTATION_PLAN_PHASE7.md',
  'IMPLEMENTATION_PLAN_PHASE8.md',
  'SUBSCRIPTION_AUDIT_PLAN.md',
  'BUSINESS_PROFILE_AUDIT_PLAN.md',
  'FEATURE_AUDIT.md',
  'UX_MOBILE_AUDIT_PLAN.md',
  'IMPLEMENTATION_PLAN.md',
  'AUTH_AUDIT_PLAN.md',
  'TEST_COVERAGE_PLAN.md',
  'ROADMAP.md',
  'GAP_ANALYSIS_PHASE2.md'
];

// Files to preserve (essential documentation)
const essentialFiles = [
  'README.md',
  'SETUP.md',
  'GAP_ANALYSIS.md',
  'functionality-features-phase1-2.md',
  'functionality-features-phase3.md',
  'functionality-features-phase4.md',
  'functionality-features-phase5.md',
  'functionality-features-phase6.md',
  'File structure guidelines.md',
  'auth-roles.md',
  'TESTING.md',
  'TESTING_ISSUES.md',
  'PRIVACY_POLICY.md',
  'DATA_RETENTION_POLICY.md',
  'DEPLOYMENT.md',
  'API.md'
];

const docsDir = path.join(process.cwd(), 'docs');

// Create backup directory
const backupDir = path.join(docsDir, 'archived_docs');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Move files to backup directory
filesToRemove.forEach(file => {
  const filePath = path.join(docsDir, file);
  const backupPath = path.join(backupDir, file);
  
  if (fs.existsSync(filePath)) {
    try {
      // Move file to backup directory
      fs.renameSync(filePath, backupPath);
      console.log(`✅ Moved ${file} to archived_docs`);
    } catch (error) {
      console.error(`❌ Error moving ${file}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

console.log('\nDocumentation cleanup completed!');
console.log('Archived files are stored in docs/archived_docs/');
console.log('\nEssential files preserved:');
essentialFiles.forEach(file => console.log(`- ${file}`));
