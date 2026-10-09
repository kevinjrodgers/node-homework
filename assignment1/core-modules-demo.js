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

// Streams for large files- log first 40 chars of each chunk
function createLargeText() {
  const loremString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  let resultString = '';
  for(let i = 0; i <= 100; i++) {
    resultString = resultString + i.toString() + ' ' + loremString + '\n';
    //console.log(resultString);
  }
  return resultString;
}

async function createLargeFile() {
  let content = createLargeText();
  try {
    await fs.writeFile(path.join(__dirname, 'sample-files', 'largefile.txt'), content, (error) => {
      if(error) {
        throw new Error('Error creating large file:', error.message);
      }
    });
  } catch(error) {
    console.error(error.message);
  }
  
}
createLargeFile();