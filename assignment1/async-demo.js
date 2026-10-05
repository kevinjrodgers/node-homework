const fs = require('fs');
const path = require('path');

// Write a sample file for demonstration
fs.writeFile(path.join(__dirname, 'sample-files', 'sample.txt'), 'Hello, async world!', 'utf-8', (error) => {
  if(error) {
    console.log(`Error writing to file: ${error.message}`);
    return;
  }
  //console.log('File successfully written');


  // 1. Callback style
  fs.readFile(path.join(__dirname, 'sample-files', 'sample.txt'), 'utf-8', (error, content) => {
    if(error) {
      console.log(`File read failed: ${error.message}`);
      return;
    }
    console.log('/callback', content);
  });

  // Callback hell example (test and leave it in comments):
  /*
  fs.writeFile('sample-files/sample.txt', 'Hello, async world!\n', 'utf-8', (error) => {
    if(error) {
      console.log(`Error writing hello to file: ${error.message}`);
      return;
    }
    // After writing, we use a callback to write another line right after it
    fs.appendFile('sample-files/sample.txt', 'Hello again, async world!\n', 'utf-8', (error) => {
      if(error) {
        console.log(`Error writing hello again to file: ${error.message}`);
        return;
      }
      fs.appendFile('sample-files/sample.txt', 'See ya, async world!', 'utf-8', (error) => {
        if(error) {
          console.log(`Error writing goodbye to file: ${error.message}`);
          return;
        }
        fs.readFile('sample-files/sample.txt', 'utf-8', (error, content) => {
          if(error) {
            console.log(`Error reading file: ${error.message}`);
            return;
          }
          console.log(content);
        })
      });
    });
  });
  */

  // 2. Promise style
  const myReadingPromise = new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'sample-files', 'sample.txt'), 'utf-8', (error, content) => {
      if(error) {
        reject(`File read failed: ${error.message}`);
      }
      resolve(content);
    });
  })


  myReadingPromise.then(result => {
    console.log('/promise', result);
  }).catch(result => {
    console.error(result);
  })


  // 3. Async/Await style
  async function readFileAsyncAwait() {
      try {
        await fs.readFile(path.join(__dirname, 'sample-files', 'sample.txt'), 'utf-8', (error, content) => {
          if(error) { throw new Error(error.message); }
          console.log('/async await', content);
        });
      } catch (error) {
        console.error(error.message);
      }
  }
  readFileAsyncAwait();
});  