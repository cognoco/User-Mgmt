import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Assuming script is in /scripts

const searchDirs = [
  path.join(projectRoot, 'src'),
  path.join(projectRoot, 'app'),
  path.join(projectRoot, 'e2e'),
];

const fileExtensions = ['.ts', '.tsx'];

// Keywords, component names, hook/store names, function names, API patterns
// Using RegExp for case-insensitivity and potential patterns
const ssoKeywords = [
  // General Terms
  /SSO/i, /OAuth/i, /SAML/i, /OIDC/i,
  // Specific Providers (as keywords)
  /GoogleAuthProvider/i, /GithubAuthProvider/i, /FacebookAuthProvider/i, /TwitterAuthProvider/i, /AppleAuthProvider/i, /MicrosoftAuthProvider/i, /LinkedInAuthProvider/i,
  /'google'/i, /'github'/i, /'facebook'/i, /'twitter'/i, /'apple'/i, /'microsoft'/i, /'linkedin'/i, // Provider strings
  // Known Function Names
  /signInWithOAuth/i, /handleOAuthCallback/i, /linkAccount/i, /unlinkProvider/i,
  // Known Component Names
  /OAuthButtons/i, /ConnectedAccounts/i, /BusinessSSOSetup/i, /OrganizationSSO/i, /IDPConfiguration/i, /SamlConfigForm/i, /OidcConfigForm/i,
  // Known Hooks/Stores
  /useOAuthStore/i, /useAuthStore/i, /useUserManagement/i, // Add others if known
  // API Route Patterns
  /\/api\/auth\/oauth/i, /\/api\/organizations\/.*\/sso/i,
  // UI Text Patterns (might be less reliable)
  /\b(login|sign ?up|connect|link)\s+with\b/i, /\bconnected accounts\b/i, /\bidentity provider\b/i,
];

const results = {
  components: new Set(),
  libsHooksStores: new Set(),
  apiRoutes: new Set(),
  tests: new Set(),
  other: new Set(),
};

// --- Helper Functions ---
function classifyFile(filePath) {
  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/'); // Normalize path separators

  if (relativePath.startsWith('e2e/') || /\.(test|spec|integration)\.tsx?$/.test(relativePath)) {
    return 'tests';
  } else if (relativePath.startsWith('src/components/')) {
    return 'components';
  } else if (relativePath.startsWith('src/lib/') || relativePath.startsWith('src/hooks/') || relativePath.startsWith('src/stores/')) {
    return 'libsHooksStores';
  } else if (relativePath.startsWith('app/api/')) {
    return 'apiRoutes';
  } else {
    return 'other'; // Includes app pages, middleware, types, etc.
  }
}

function searchInDirectory(directory) {
  try {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Avoid searching node_modules, .next, etc.
        if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
          searchInDirectory(fullPath);
        }
      } else if (fileExtensions.includes(path.extname(file))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          let found = false;
          ssoKeywords.forEach(keyword => {
            if (keyword.test(content)) {
              found = true;
            }
          });

          if (found) {
            const category = classifyFile(fullPath);
            // Store relative path for cleaner output
            results[category].add(path.relative(projectRoot, fullPath).replace(/\\/g, '/'));
          }
        } catch (readErr) {
          console.error(`! Error reading file ${fullPath}: ${readErr.message}`);
        }
      }
    });
  } catch (dirErr) {
    console.error(`! Error reading directory ${directory}: ${dirErr.message}`);
  }
}

// --- Main Execution ---
console.log('Starting SSO functionality mapping...');
console.log(`Searching in: ${searchDirs.join(', ')}`);

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    searchInDirectory(dir);
  } else {
    console.warn(`! Directory not found, skipping: ${dir}`);
  }
});

console.log('\n--- SSO Functionality Map ---');

for (const category in results) {
  if (results[category].size > 0) {
    console.log(`\n## ${category.charAt(0).toUpperCase() + category.slice(1)}:`);
    Array.from(results[category]).sort().forEach(filePath => {
      console.log(`- ${filePath}`);
    });
  }
}

console.log('\n--- End of Map ---');
console.log('Note: This map is based on keyword detection and may include false positives or miss some implementations.'); 