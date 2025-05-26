/**
 * Import Path Migration Script
 * 
 * This script automatically migrates old import paths to the new architecture pattern.
 * It scans all TypeScript/JavaScript files in the project and updates imports based on
 * the mapping defined in the pathMappings object.
 * 
 * Usage:
 * node scripts/migrate-imports.js
 * 
 * Options:
 * --dry-run: Only show what would be changed without making actual changes
 * --verbose: Show detailed information about each change
 * --path=<directory>: Only process files in the specified directory
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const pathArg = args.find(arg => arg.startsWith('--path='));
const rootDir = pathArg 
  ? path.resolve(pathArg.split('=')[1]) 
  : path.resolve(__dirname, '..');

// Configuration
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const excludeDirs = ['node_modules', '.next', 'out', 'dist', '.git'];

// Exact path mappings from old to new
const exactPathMappings = {
  // Auth components
  '@/components/auth/LoginForm': '@/ui/styled/auth/login-form',
  '@/components/auth/RegistrationForm': '@/ui/styled/auth/registration-form',
  '@/components/auth/ResetPasswordForm': '@/ui/styled/auth/reset-password-form',
  '@/components/auth/MagicLinkForm': '@/ui/styled/auth/magic-link-form',
  '@/components/auth/MfaSetupForm': '@/ui/styled/auth/mfa-setup-form',
  '@/components/auth/OAuthButtons': '@/ui/styled/auth/oauth-buttons',
  
  // User/Profile components
  '@/components/profile/ProfileForm': '@/ui/styled/user/profile-form',
  '@/components/profile/AccountSettings': '@/ui/styled/user/account-settings',
  '@/components/profile/UserAvatar': '@/ui/styled/user/user-avatar',
  '@/components/profile/UserCard': '@/ui/styled/user/user-card',
  '@/components/profile/UserList': '@/ui/styled/user/user-list',
  
  // Team components
  '@/components/team/TeamList': '@/ui/styled/team/team-list',
  '@/components/team/TeamForm': '@/ui/styled/team/team-form',
  '@/components/team/MemberManager': '@/ui/styled/team/member-manager',
  '@/components/team/TeamCard': '@/ui/styled/team/team-card',
  '@/components/team/InvitationForm': '@/ui/styled/team/invitation-form',
  
  // Permission components
  '@/components/admin/RoleManager': '@/ui/styled/permission/role-manager',
  '@/components/admin/PermissionMatrix': '@/ui/styled/permission/permission-matrix',
  '@/components/admin/RoleSelector': '@/ui/styled/permission/role-selector',
  
  // Auth hooks
  '@/lib/auth/useAuth': '@/hooks/auth/useAuth',
  '@/lib/auth/useRegistration': '@/hooks/auth/use-registration',
  '@/lib/auth/usePasswordReset': '@/hooks/auth/use-password-reset',
  '@/lib/auth/useMagicLink': '@/hooks/auth/use-magic-link',
  '@/lib/auth/useMfa': '@/hooks/auth/use-mfa',
  '@/lib/auth/useOAuth': '@/hooks/auth/use-oauth',
  
  // User hooks
  '@/lib/user/useUserProfile': '@/hooks/user/use-user-profile',
  '@/lib/user/useAccountSettings': '@/hooks/user/use-account-settings',
  '@/lib/user/useUserAvatar': '@/hooks/user/use-user-avatar',
  '@/lib/user/useUsers': '@/hooks/user/use-users',
  
  // Team hooks
  '@/lib/team/useTeams': '@/hooks/team/use-teams',
  '@/lib/team/useTeamMembers': '@/hooks/team/use-team-members',
  '@/lib/team/useTeamInvitations': '@/hooks/team/use-team-invitations',
  '@/lib/team/useTeamRoles': '@/hooks/team/use-team-roles',
  
  // Permission hooks
  '@/lib/permission/useRoles': '@/hooks/permission/use-roles',
  '@/lib/permission/usePermissions': '@/hooks/permission/use-permissions',
  '@/lib/permission/useUserPermissions': '@/hooks/permission/use-user-permissions',
  
  // Auth stores/services
  '@/lib/stores/authStore': '@/services/auth/auth-store',
  '@/lib/stores/MfaStore': '@/services/auth/mfa-store',
  '@/lib/stores/OAuthStore': '@/services/auth/oauth-store',
  
  // User stores/services
  '@/lib/stores/userStore': '@/services/user/user-store',
  '@/lib/stores/profileStore': '@/services/user/profile-store',
  
  // Team stores/services
  '@/lib/stores/teamStore': '@/services/team/team-store',
  '@/lib/stores/memberStore': '@/services/team/member-store',
  '@/lib/stores/invitationStore': '@/services/team/invitation-store',
  
  // Permission stores/services
  '@/lib/stores/permissionStore': '@/services/permission/permission-store',
  '@/lib/stores/roleStore': '@/services/permission/role-store',
  
  // Database adapters
  '@/lib/database/supabase': '@/adapters/database/supabase-provider',
  '@/lib/database/auth': '@/adapters/auth/supabase-auth-provider',
  '@/lib/database/user': '@/adapters/user/supabase-user-provider',
  '@/lib/database/team': '@/adapters/team/supabase-team-provider',
  '@/lib/database/permission': '@/adapters/permission/supabase-permission-provider',
  
  // Types to core
  '@/types/auth': '@/core/auth/types',
  '@/types/user': '@/core/user/types',
  '@/types/team': '@/core/team/types',
  '@/types/permission': '@/core/permission/types',
  
  // Utils to services
  '@/utils/auth': '@/services/auth/auth-utils',
  '@/utils/user': '@/services/user/user-utils',
  '@/utils/team': '@/services/team/team-utils',
  '@/utils/permission': '@/services/permission/permission-utils',
};


// Generate additional mappings for common patterns
const pathMappings = [];

// Add exact mappings
Object.entries(exactPathMappings).forEach(([oldPath, newPath]) => {
  pathMappings.push({
    pattern: new RegExp(`from ['"]${oldPath}['"]`, 'g'),
    replacement: `from '${newPath}'`
  });
});

// Add kebab-case converter for new architecture paths
pathMappings.push({
  pattern: /from ['"](@\/(?:ui|hooks|services|adapters|core)\/[a-zA-Z0-9-/]+)\/([A-Z][a-zA-Z0-9]*)['"]/,
  replacement: (match, p1, p2) => {
    // Convert PascalCase to kebab-case
    const kebabCase = p2.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return `from '${p1}/${kebabCase}'`;
  }
});

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply each mapping
    for (const mapping of pathMappings) {
      const regex = new RegExp(mapping.pattern, 'g');
      const newContent = content.replace(regex, mapping.replacement);
      
      if (newContent !== content) {
        hasChanges = true;
        content = newContent;
      }
    }
    
    // Report and save changes
    if (hasChanges) {
      console.log(`[${dryRun ? 'DRY RUN' : 'UPDATED'}] ${filePath}`);
      
      if (verbose) {
        // Use git diff-like output to show changes
        const tempFile = `${filePath}.new`;
        fs.writeFileSync(tempFile, content, 'utf8');
        try {
          const diff = execSync(`git diff --no-index -- "${filePath}" "${tempFile}"`).toString();
          console.log(diff);
        } catch (e) {
          // git diff returns non-zero exit code when there are differences
          console.log(e.stdout.toString());
        }
        fs.unlinkSync(tempFile);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      return 1; // Count as a change
    }
    
    return 0; // No changes
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Function to walk the directory tree
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(file) || file.startsWith('.')) {
        return;
      }
      
      walkDir(filePath, callback);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (fileExtensions.includes(ext)) {
        callback(filePath);
      }
    }
  });
}

// Main execution
console.log(`Starting import path migration ${dryRun ? '(DRY RUN)' : ''}`);
console.log(`Scanning directory: ${rootDir}`);

let totalFiles = 0;
let changedFiles = 0;

walkDir(rootDir, (filePath) => {
  totalFiles++;
  changedFiles += processFile(filePath);
});

console.log('\nMigration Summary:');
console.log(`Total files scanned: ${totalFiles}`);
console.log(`Files with changes: ${changedFiles}`);

if (dryRun && changedFiles > 0) {
  console.log('\nThis was a dry run. Run without --dry-run to apply changes.');
}
