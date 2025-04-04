import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}Starting targeted fix for routes.js...${colors.reset}`);

try {
  // Fix the routes.js file
  const routesFilePath = path.resolve(__dirname, 'server/routes.ts');
  const routesDistFilePath = path.resolve(__dirname, 'dist/server/routes.js');
  
  if (fs.existsSync(routesFilePath)) {
    console.log(`${colors.yellow}Processing routes.ts file...${colors.reset}`);
    
    // Read the original file
    const content = fs.readFileSync(routesFilePath, 'utf-8');
    
    // Process the content to remove TypeScript syntax
    let processedContent = content
      // Remove type annotations from function parameters
      .replace(/(\w+)\s*:\s*[A-Za-z<>[\]{}|&]+/g, '$1')
      // Remove return type annotations
      .replace(/\)\s*:\s*[A-Za-z<>[\]{}|&]+\s*=>/g, ') =>')
      .replace(/\)\s*:\s*[A-Za-z<>[\]{}|&]+\s*{/g, ') {')
      // Replace .ts with .js in imports
      .replace(/from\s+['"](.*)\.ts['"]/g, 'from \'$1.js\'')
      // Remove interface and type definitions
      .replace(/interface\s+[^{]*{[^}]*}/g, '')
      .replace(/type\s+[^=]+=\s*[^;]*;/g, '')
      // Remove export type statements
      .replace(/export\s+(type|interface)\s+[^{;]+[{;][^}]*[};]/g, '');
    
    // Create dist/server directory if it doesn't exist
    const serverDistDir = path.dirname(routesDistFilePath);
    if (!fs.existsSync(serverDistDir)) {
      fs.mkdirSync(serverDistDir, { recursive: true });
    }
    
    // Write the fixed file
    fs.writeFileSync(routesDistFilePath, processedContent);
    console.log(`${colors.green}Fixed routes.js file created successfully!${colors.reset}`);
  } else {
    console.error(`${colors.red}Error: routes.ts file not found at ${routesFilePath}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}Fix completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Fix failed:${colors.reset}`, error);
  process.exit(1);
}
