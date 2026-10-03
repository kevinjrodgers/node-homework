# Node.js Fundamentals

## What is Node.js?
Node.js is JavaScript that is ran outside of the browser. 

## How does Node.js differ from running JavaScript in the browser?
Because Node.js is ran outside of the browser, it can be given file access, network access, read/write files, used as a backend, and start a web server. Node.js does not work with the DOM, cookies, or any web pages.

## What is the V8 engine, and how does Node use it?
The V8 engine is essentially what browser JavaScript uses for Chrome/Chromium-based browsers. Node.js uses the V8 engine but it is wrapped with other features that allows it to be standalone and ran outside of any browser and gives it file and network access.

## What are some key use cases for Node.js?
Node.js is used for backend APIs, file management, and can be used to safely access environmental variables.

## Explain the difference between CommonJS and ES Modules. Give a code example of each.
CommonJS uses the "const/require" keywords to import modules, while ES Modules uses the "import/from" keywords to import modules.
**CommonJS (default in Node.js):**
```js
const { myFunction } = require("../myExportedModule");
```

**ES Modules (supported in modern Node.js):**
```js
import { useReducer } from "react";
``` 