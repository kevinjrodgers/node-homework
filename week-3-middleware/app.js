const express = require("express");
const dogsRouter = require("./routes/dogs");
const { randomUUID } = require("crypto");

const app = express();
app.use(express.json());

// Assignment 3b and 3c ask you to add middleware in this file.
app.use(express.static("public"));

// Request ID Middleware
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}]: ${req.method} ${req.path} (${req.requestId})`);
  next();
});

app.use("/", dogsRouter);// Do not remove this line

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    requestId: req.requestId
  });
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.requestId
  });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Dog rescue app is listening on port 3000...");
  });
}

module.exports = app;

