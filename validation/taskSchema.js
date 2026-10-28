/*
  Task creation and task updates have different rulesets:
    Creating a task needs a title
    Updating a task can change only one field, but it should not accept an empty body
    Rules:
      Creating a task requires a title
      Creating a task defaults isCompleted ot false if it is not provided
      Updating a task allows partial updates
      Updating a task must include at least one field
*/

const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),
  isCompleted: Joi.boolean().default(false).not(null),
});

const patchTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30),
  isCompleted: Joi.boolean().default(false).not(null)
}).min(1);

module.exports = { taskSchema, patchTaskSchema }
