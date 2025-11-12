const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

console.log('Files in public directory:');
files.forEach(f => console.log('  -', f));

const pdfFile = files.find(f => f.toLowerCase().includes('holy') && f.endsWith('.pdf'));
console.log('\nFound PDF file:', pdfFile);

if (pdfFile) {
  const oldPath = path.join(publicDir, pdfFile);
  const newPath = path.join(publicDir, 'who-is-the-holy-spirit.pdf');
  
  try {
    fs.renameSync(oldPath, newPath);
    console.log('✓ Successfully renamed to: who-is-the-holy-spirit.pdf');
    
    // Verify
    const newFiles = fs.readdirSync(publicDir);
    console.log('\nFiles after rename:');
    newFiles.filter(f => f.endsWith('.pdf')).forEach(f => console.log('  -', f));
  } catch (err) {
    console.error('Error renaming file:', err.message);
  }
} else {
  console.log('No PDF file found with "Holy" in the name');
}

