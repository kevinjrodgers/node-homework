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
console.log(`Joined path: ${path.join('path', 'sample-files', 'demo.txt')}`);
// fs.promises API
const myFileWritePromise = new Promise((resolve, reject) => {
  fs.writeFile(path.join(__dirname, 'sample-files', 'demo.txt'), 'Hello from fs.promises!', 'utf-8', (error) => {
    if(error) {
      reject(`Could not write file: ${error.message}`);
    } 
    resolve('File write successful');
  });
});

myFileWritePromise.then(result => {
  console.log(result);
}).catch(result => {
  console.log(result);
});

const myFileReadPromise = new Promise((resolve, reject) => {
  fs.readFile(path.join(__dirname, 'sample-files', 'demo.txt'), 'utf-8', (error, content) => {
    if(error) {
      reject(`Could not read file: ${error.message}`);
    }
    console.log('File read succesfful');
    resolve(content);
  });
});
myFileReadPromise.then(result => {
  console.log('fs.promises read:', result);
}).catch(result => {
  console.log(result);
})
// Streams for large files- log first 40 chars of each chunk
