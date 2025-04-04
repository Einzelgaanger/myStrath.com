const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create output stream
const output = fs.createWriteStream(path.join(__dirname, 'university-learning-hub.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log(`Archive created successfully. Total bytes: ${archive.pointer()}`);
});

// Handle warnings and errors
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the output file
archive.pipe(output);

// Read .gitignore patterns
const gitignorePath = path.join(__dirname, '.gitignore');
const gitignorePatterns = fs.existsSync(gitignorePath)
  ? fs.readFileSync(gitignorePath, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
  : [];

// Function to check if a file should be ignored
function shouldIgnore(filePath) {
  const relativePath = path.relative(__dirname, filePath);
  return gitignorePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(relativePath);
  });
}

// Function to recursively add files to the archive
function addFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (shouldIgnore(filePath)) {
      continue;
    }
    
    if (stat.isDirectory()) {
      addFiles(filePath);
    } else {
      const relativePath = path.relative(__dirname, filePath);
      archive.file(filePath, { name: relativePath });
      console.log(`Added: ${relativePath}`);
    }
  }
}

// Start adding files
console.log('Starting compression...');
addFiles(__dirname);

// Finalize the archive
archive.finalize(); 