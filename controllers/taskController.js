const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");


// Create
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
    select: { id: true, title: true, isCompleted: true, priority: true },
  })
  return res.status(201).json(task);
}

// Index
async function index(req, res) {
  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get tasks with pagination and eager loading
  const tasks = await prisma.task.findMany({
    where: {
      userId: global.user_id,
    },
    select: { 
      id: true, 
      title: true, 
      isCompleted: true, 
      priority: true,
      User: {
        select: {
          name: true,
          email: true
        }
      }
    },
    skip: skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  // Get total count for pagination metadata
  const totalTasks = await prisma.task.count({
    where: {
      userId: global.user_id
    }
  });

  if(tasks.length === 0) {
    return res.status(404).json({
      message: "This user has no tasks"
    });
  }

  // Build pagination object with complete metadata
  // Hint: The test expects page, limit, total, pages, hasNext, hasPrev
  // Use Math.ceil() to calculate pages, and compare page * limit with total for hasNext
  const pagination = {
    page: page,
    limit: limit,
    total: totalTasks,
    pages: Math.ceil(totalTasks/limit),
    hasNext: (page * limit) < totalTasks ? true : false,
    hasPrev: (page === 1 ? false : true)
  };

  const taskWithPagination = {
    ...tasks,
    pagination
  }

  return res.status(200).json(taskWithPagination);
}

// Show
async function show(req, res) {
  const taskId = parseInt(req.params?.id, 10);
  if(Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Not a valid ID"
    });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: global.user_id },
    select: { id: true, title: true, isCompleted: true, priority: true }
  });

  if(task === null) {
    // Id not found
    return res.status(404).json({
      message: "No task with that ID exists"
    }); 
  }

  return res.status(200).json(task);
}
  
// Update
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
      select: { id: true, title: true, isCompleted: true, priority: true }
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

// Delete
async function deleteTask(req, res, next) {
  const taskId = parseInt(req.params?.id, 10);
  if(Number.isNaN(taskId)) {
    return res.status(400).json({
      message: "Invalid task ID"
    });
  }
  
  try {
    const deletedTask = await prisma.task.delete({
      where: { id: taskId, userId: global.user_id },
      select: { id: true, title: true, priority: true }
    });
    return res.status(200).json(deletedTask);
  } catch(error) {
    if(error.code === "P2025") {
      return res.status(404).json({
        message: "No existing tasks match this ID"
      });
    } else {
      return next(error);
    }
  }
}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask
}