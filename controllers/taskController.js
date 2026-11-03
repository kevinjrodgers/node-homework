const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const pool = require("../db/pg-pool");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber = lastTaskNumber + 1;
    return lastTaskNumber;
  }
})();

async function create(req, res) {

  if(!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false
  });
  if(error) {
    return res.status(400).json({
      message: `Task creation error: ${error}`
    });
  }

  /*const newTask =  {
    id: taskCounter(),
    userId: global.user_id.email,
    ...value 
  };
  */

  const result = await pool.query(`INSERT INTO tasks (title, is_completed, user_id)
    VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,  
    [value.title, value.isCompleted, global.user_id]);
  
  const newTask = result.rows[0];

  
  //const { userId, ...sanitizedTask } = newTask;

  //global.tasks = [...global.tasks, newTask];
  //return res.status(201).json(sanitizedTask);
  return res.status(201).json(newTask);
}

async function index(req, res) {
  const result = await pool.query("SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
    [global.user_id]
  );

  const userTasks = result.rows;
  /*const userTasks = global.tasks.filter(
    (task) => task.userId === global.user_id.email,
  );
  */
  if(userTasks.length === 0) {
    return res.status(404).json({
      message: "This user has no tasks"
    });
  }
  const sanitizedTasks = userTasks.map((task) => {
    const { user_id, ...sanitizedTask } = task;
    return sanitizedTask;
  });

  return res.status(200).json(sanitizedTasks);
}

function show(req, res) {
  const taskId = parseInt(req.params?.id, 10);
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
      return res.status(200).json(sanitizedTask);
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
      return res.status(200).json(sanitizedTask);
    }
  }
  return res.status(404).json({
    message: "No matching task exists"
  });
}

function deleteTask(req, res) {
  const taskId = parseInt(req.params?.id, 10);
  if(Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Invalid task ID"
    });
  }

  const taskIndex = global.tasks.findIndex(task => (task.id === taskId) && (global.user_id.email === task.userId));
  if(taskIndex === -1) {
    return res.status(404).json({
      message: "No existing tasks match this ID"
    });
  }
  const deletedTask = global.tasks[taskIndex];
  const { userId, ...sanitizedTask } = deletedTask;
  global.tasks.splice(taskIndex, 1);
  return res.status(200).json(sanitizedTask);
}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask
}