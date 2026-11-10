const { userSchema } = require("../validation/userSchema");
const prisma = require("../db/prisma");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

async function register(req, res, next) {
  if(!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false
  });
  if(error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  } 

  value.hashedPassword = await hashPassword(value.password);
  // the code to here is like the in-memory version
  let user = null;
  const { name, email, hashedPassword } = value;
  try {
    user = await prisma.user.create({
      data: { name, email, hashedPassword },
      select: { name: true, email: true, id: true }
    });
  } catch(error) { // the email might already be registered
    if(error.name === "PrismaClientKnownRequestError" && error.code === "P2002") { // this means the unique constraint for email was violated
      // here you return the 400 and the error message.  Use a return statement, so that 
      // you don't keep going in this function
      return res.status(400).json({
        message: "User already exists"
      });
    } else {
      return next(error); // all other errors get passed to the error handler
    }
  }
  const newUser = user;
  // otherwise user now contains the new user.  You can return a 201 and the appropriate
  // object.  Be sure to also set global.user_id with the id of the user record you just created. 
  global.user_id = newUser.id;

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });

}

async function logon(req, res) {
  let { email } = req.body;
  const { password } = req.body;
  email = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }});
  // If no user found in database
  if(user === null) { 
    res.status(401).json({
      message: "Invalid email/password", // For testing purposes
    });
    return; 
  }

  // If user exists in database, compare passwords
  const goodCredentials = await comparePassword(password, user.hashedPassword);
  if(goodCredentials) {
        global.user_id = user.id;

        return res.status(200).json({
          name: user.name,
          email: user.email,
        });
  } else {
        return res.status(401).json({
          message: "Invalid email/password", // For testing purposes
        });
  }
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200).json({
    message: "Logoff successful"
  });
}

// Creates a salt, hashes the password, and returns the stored hash string
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

module.exports = {
  register,
  logon,
  logoff
}