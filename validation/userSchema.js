/* 
  Purpose: Creates rules that a valid registration body should have
  Rules:
    email is required, trimmed, lowercased, and must have a valid email format
    name is required, trimmed, and must be 3 to 30 characters
    password is required and must not be trivial
*/

const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  name: Joi.string().trim().min(3).max(30).required(),
  password: Joi.string().min(5).max(30).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])')).message({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'}).required(),
});

module.exports = { userSchema };