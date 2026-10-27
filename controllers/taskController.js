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

function show(req, res) {
  console.log(req.params.id);
  const taskId = parseInt(req.params?.id, 10);
  console.log(taskId);
  console.log("NaN?: " + Number.isNaN(taskId));
  if(Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Not a valid ID"
    });
  }
  let foundTask;
  for(let i = 0; i < global.tasks.length; i++) {
    if((global.tasks[i].userId === global.user_id.email) && (global.tasks[i].id === taskId)) {
      foundTask = global.tasks[i];
      const { userId, ...sanitizedTask } = foundTask;
      return res.status(200).json({
        sanitizedTask
      });
    }
  }

  // Id not found
  return res.status(404).json({
    message: "No task with that ID exists"
  });
}

function update(req, res) {
  // Validate the new title value
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false
  });
  if(error) {
    return res.status(400).json({
      message: "Invalid title"
    });
  }

  const taskId = parseInt(req.params?.id, 10);
  if(Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Invalid task ID"
    });
  }

  for(let i = 0; i< global.tasks.length; i++) {
    if((global.tasks[i].userId === global.user_id.email) && (global.tasks[i].id === taskId)) {
      Object.assign(global.tasks[i], value);
      let updatedTask = global.tasks[i];
      const { userId, ...sanitizedTask } = updatedTask;
      return res.status(200).json({
        sanitizedTask
      });
    }
  }
  return res.status(404).json({
    message: "No matching task exists"
  });
}

module.exports = {
  create,
  index,
  show,
  update
}