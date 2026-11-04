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

  const result = await pool.query(`INSERT INTO tasks (title, is_completed, user_id)
    VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,  
    [value.title, value.isCompleted, global.user_id]);
  
  const newTask = result.rows[0];
  const convertedTask = {
    id: newTask.id,
    title: newTask.title,
    isCompleted: newTask.is_completed
  }
  return res.status(201).json(convertedTask);
}

async function index(req, res) {
  const result = await pool.query("SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
    [global.user_id]
  );

  const userTasks = result.rows;
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

async function show(req, res) {
  const taskId = parseInt(req.params?.id, 10);
  if(Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Not a valid ID"
    });
  }

  const result = await pool.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
    [taskId, global.user_id]
  );

  if(result.rows.length === 0) {
    // Id not found
    return res.status(404).json({
      message: "No task with that ID exists"
    });
  }
  let foundTask = result.rows[0];
  const { user_id, ...sanitizedTask } = foundTask;
  return res.status(200).json(sanitizedTask);
}

async function update(req, res) {
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
  let taskChange = value;
  let keys = Object.keys(taskChange);
  keys = keys.map((key) => key === "isCompleted" ? "is_completed" : key);
  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const idParm = `$${keys.length + 1}`;
  const userParm = `$${keys.length + 2}`;
  const result = await pool.query(`UPDATE tasks SET ${setClauses}
    WHERE id = ${idParm} AND user_id = ${userParm} RETURNING id, title, is_completed`, 
    [...Object.values(taskChange), req.params.id, global.user_id]);

  if(result.rows.length === 0) {
    return res.status(404).json({
      message: "No matching task exists"
    });
  }
  const updatedTask = result.rows[0];
  const { user_id, ...sanitizedTask } = updatedTask;
  return res.status(200).json(sanitizedTask);

  /*
  const { user_id, sanitizedTask } = updatedTask;
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
    */
}

async function deleteTask(req, res) {
  const taskId = parseInt(req.params?.id, 10);
  if(Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Invalid task ID"
    });
  }
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id, title",
    [taskId, global.user_id] 
  );

  if(result.rows.length === 0) {
    return res.status(404).json({
      message: "No existing tasks match this ID"
    });
  }
  const deletedTask = result.rows[0];
  return res.status(200).json(deletedTask);
}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask
}