const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber = lastTaskNumber + 1;
    return lastTaskNumber;
  }
})();

function createTask(req, res) {

  if(!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false
  });
  if(error) {
    return res.status(400).json({
      message: "Task creation error"
    });
  }

  const newTask =  {
    id: taskCounter(),
    userId: global.user_id.email,
    ...value 
  };

  const { userId, ...sanitizedTask } = newTask;

  global.task = [...global.task, newTask];
  return res.status(201).json(sanitizedTask);
}