const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

async function register(req, res) {
  if(!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false
  });
  if(error) {
    return res.status(400).json({
      message: `Error registering user: ${error}`
    });
  } 

  const userIndex = global.users.findIndex(user => user.email === value.email);
  if(userIndex !== -1) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  const hashedPassword = await hashPassword(value.password);

  const newUser = {
    name: value.name,
    email: value.email,
    hashedPassword
  }

  global.users = [...global.users, newUser];
  global.user_id = newUser;

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
}

async function logon(req, res) {

  for(let i = 0; i < global.users.length; i++) {
    if(global.users[i].email === req.body.email) {
      const goodCredentials = global.users[i] && await comparePassword(req.body.password, global.users[i].hashedPassword);
      if(goodCredentials) {
        global.user_id = global.users[i];

        res.status(200).json({
          name: global.users[i].name,
          email: global.users[i].email,
        });
        return;
      } else {
        res.status(401).json({
          message: "Invalid email/password", // For testing purposes
        });
        return;
      }
    } 
  }
  res.status(401).json({
    message: "Invalid email/password", // For testing purposes
  });
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