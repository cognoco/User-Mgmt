// create-headless-auth-components.cjs
const fs = require('fs');
const path = require('path');

// Root project directory
const PROJECT_ROOT = path.resolve(__dirname, '..');
const domain = 'auth';

// Paths
const styledDir = path.join(PROJECT_ROOT, 'src', 'ui', 'styled', domain);
const headlessDir = path.join(PROJECT_ROOT, 'src', 'ui', 'headless', domain);

// Ensure headless directory exists
if (!fs.existsSync(headlessDir)) {
  fs.mkdirSync(headlessDir, { recursive: true });
  console.log(`Created headless directory: ${headlessDir}`);
}

// Get existing headless components to avoid overwriting
const existingHeadlessComponents = fs.readdirSync(headlessDir)
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js'))
  .map(file => file.toLowerCase());

console.log(`Found ${existingHeadlessComponents.length} existing headless components`);

// Get styled components
const styledComponents = fs.readdirSync(styledDir)
  .filter(file => (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) && file !== '__tests__');

console.log(`Found ${styledComponents.length} styled components to process`);

// Create headless versions for components that don't have one yet
styledComponents.forEach(file => {
  if (!existingHeadlessComponents.includes(file.toLowerCase())) {
    const componentName = file.replace(/\.(tsx|ts|js)$/, '');
    const headlessFilePath = path.join(headlessDir, file);
    
    // Create a basic headless component template
    const headlessTemplate = `import { ReactNode } from 'react';

/**
 * Headless ${componentName} component that handles behavior only
 * This follows the headless UI pattern from the architecture guidelines
 */
export interface ${componentName}Props {
  // Add behavior-related props here
  children: (props: ${componentName}RenderProps) => ReactNode;
}

export interface ${componentName}RenderProps {
  // Add render props that will be passed to the children function
}

export const ${componentName} = ({ children }: ${componentName}Props) => {
  // Implement behavior logic here without any UI elements
  
  const renderProps: ${componentName}RenderProps = {
    // Populate with behavior data and callbacks
  };
  
  return children(renderProps);
};

export default ${componentName};
`;
    
    fs.writeFileSync(headlessFilePath, headlessTemplate);
    console.log(`Created headless component: ${file}`);
  } else {
    console.log(`Skipping existing headless component: ${file}`);
  }
});

// Create test directory if it doesn't exist
const headlessTestDir = path.join(headlessDir, '__tests__');
if (!fs.existsSync(headlessTestDir)) {
  fs.mkdirSync(headlessTestDir, { recursive: true });
  console.log(`Created headless test directory: ${headlessTestDir}`);
}

console.log('Headless component creation complete!');
