const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber = lastTaskNumber + 1;
    return lastTaskNumber;
  }
})();

function create(req, res) {

  if(!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false
  });
  if(error) {
    return res.status(400).json({
      message: `Task creation error: ${error}`
    });
  }

  const newTask =  {
    id: taskCounter(),
    userId: global.user_id.email,
    ...value 
  };

  const { userId, ...sanitizedTask } = newTask;

  global.tasks = [...global.tasks, newTask];
  return res.status(201).json(sanitizedTask);
}

function index(req, res) {
  const userTasks = global.tasks.filter(
    (task) => task.userId === global.user_id.email,
  );
  if(!userTasks) {
    return res.status(404).json({
      message: "This user has no tasks"
    });
  }
  const sanitizedTasks = userTasks.map((task) => {
    const { userId, ...sanitizedTask } = task;
    return sanitizedTask;
  });

  return res.status(200).json({
    tasks: sanitizedTasks
  });
}

module.exports = {
  create,
  index
}