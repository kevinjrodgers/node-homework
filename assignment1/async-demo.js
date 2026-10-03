const fs = require('fs');
const path = require('path');


// Write a sample file for demonstration
function writeToSampleFile() {
fs.writeFile('sample-files/sample.txt', 'Hello, async world!', 'utf-8', (error) => {
  if(error) {
    console.error(`Error writing to file: ${error}`);
    return;
  }
  console.log('File successfully written');
});
}
writeToSampleFile();
// 1. Callback style


  // Callback hell example (test and leave it in comments):


  // 2. Promise style


      // 3. Async/Await style
