const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const pool = require("../db/pg-pool");
const prisma = require("../db/prisma");

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
  const { title, isCompleted } = value;
  const task = await prisma.task.create({
    data: { title, isCompleted, userId: global.user_id },
    select: { id: true, title: true, isCompleted: true },
  })
  return res.status(201).json(task);
}

async function index(req, res) {
  const tasks = await prisma.task.findMany({
    where: {
      userId: global.user_id,
    },
    select: { id: true, title: true, isCompleted: true }
  });

  if(tasks.length === 0) {
    return res.status(404).json({
      message: "This user has no tasks"
    });
  }
  return res.status(200).json(tasks);
  
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

async function update(req, res, next) {
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
 
  try {
    const task = await prisma.task.update({
      data: value,
      where: {
        id: taskId,
        userId: global.user_id
      },
      select: { id: true, title: true, isCompleted: true }
    });
    return res.status(200).json(task);
  } catch(error) {
    if(error.code === "P2025") {
      return res.status(404).json({
        message: "No matching task exists"
      });
    } else {
      return next(error);
    }
  }
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