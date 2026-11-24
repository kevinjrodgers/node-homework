const express = require("express");
const prisma = require("./db/prisma");

// Routes
const timeRouter = require("./routes/timeRoutes");
const userRouter = require("./routes/userRoutes");
const taskRouter = require("./routes/taskRoutes");
const analyticsRouter = require("./routes/analyticsRoutes");
// Middleware
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");
const authMiddleware = require("./middleware/auth");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimiter = require("express-rate-limit");

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);

app.use(cookieParser());
app.use(helmet());
app.use(xss()); 

app.use("/api", timeRouter);
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/analytics", authMiddleware, analyticsRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/testpost", (req, res) => {
  res.status(200).json({
    message: "POST route works",
  });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'not connected', error: err.message });
  }
});

app.use(notFound);
app.use(errorHandler);


// Server shutdown code

const port = process.env.PORT || 3000;

const server = app.listen(port, (error) => {
  if(error) {
    if(error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use.`);
    } else {
      console.error("Server startup error:", error);
    }
    process.exit(1);
    return;
  }
  console.log(`Server running on port ${port}...`);
});

let isShuttingDown = false;

async function shutdown(code = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down gracefully...");

  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("HTTP server closed.");
    await prisma.$disconnect();
    console.log("Prisma disconnected");
    // Close all PostgreSQL connections after the HTTP server has stopped.
  } catch (err) {
    console.error("Error during shutdown:", err);
    code = 1;
  } finally {
    process.exit(code);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

module.exports = { app, server };