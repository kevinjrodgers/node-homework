/*
  The code turns on query logging in development mode. You will see the SQL statements Prisma runs as they execute. This should only happen in development mode.
  In the log, each table name may be prefixed with "public". This is the default database schema. It only matters for more complex multi-tenant databases, which this project is not using.
*/

const { PrismaClient } = require("@prisma/client");

let opts;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  opts = { log: ["query"] };
} else {
  opts = {};
}

const prisma = new PrismaClient(opts);

module.exports = prisma;