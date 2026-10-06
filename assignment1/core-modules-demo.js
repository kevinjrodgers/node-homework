const os = require('os');
const path = require('path');
const fs = require('fs');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log(`Platform: ${os.platform()}`);
console.log(`CPU: ${os.cpus()[0].model}`);
console.log(`Total Memory: ${os.totalmem()}`);
// Path module
console.log(`Joined path: ${path.join(__dirname, 'sample-files', 'demo.txt')}`);
// fs.promises API
async function writeAndReadFile() {
  const demoFilePath = path.join(__dirname, 'sample-files', 'demo.txt');
  try {
    await fs.promises.writeFile(demoFilePath, 'Hello from fs.promises!');
    const content = await fs.promises.readFile(demoFilePath, 'utf-8');
    console.log('fs.promises read:', content);
  } catch(error) {
    console.error('Failure to operate on file:', error.message);
  }
  
}
writeAndReadFile();
