const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);
const pool = require("../db/pg-pool");

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

  let result = null;
  value.hashed_password = await hashPassword(value.password);
  // the code to here is like the in-memory version
  try {
    result = await pool.query(`INSERT INTO users (email, name, hashed_password)
      VALUES ($1, $2, $3) RETURNING id, email, name`,
      [value.email, value.name, value.hashed_password]
    ); // note that you use a parameterized query
  } catch (error) { // the email might already be registered
    if (error.code === "23505") { // this means the unique constraint for email was violated
      // here you return the 400 and the error message.  Use a return statement, so that 
      // you don't keep going in this function
      return res.status(409).json({
        message: "User already exists"
      });
    }
    return next(error); // all other errors get passed to the error handler
  }
  const newUser = result.rows[0];
  // otherwise user now contains the new user.  You can return a 201 and the appropriate
  // object.  Be sure to also set global.user_id with the id of the user record you just created. 
  global.user_id = newUser;

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });

}

async function logon(req, res) {

  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  // If no user found in database
  if(result.rows.length === 0) { 
    res.status(401).json({
      message: "Invalid email/password", // For testing purposes
    });
    return; 
  }

  // If user exists in database, compare passwords
  const goodCredentials = await comparePassword(password, result.rows[0].hashed_password);
  if(goodCredentials) {
        global.user_id = result.rows[0].id;

        return res.status(200).json({
          name: result.rows[0].name,
          email: result.rows[0].email,
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