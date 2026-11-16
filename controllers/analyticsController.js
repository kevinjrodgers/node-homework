const prisma = require("../db/prisma");

async function getUserAnalytics(req, res) {
  const userId  = parseInt(req.params.id);
  if(Number.isNaN(userId)) {
    return res.status(400).json({
      message: "Not a valid ID"
    });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if(user === null) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  // Use groupBy to count tasks by completion status
  const taskStats = await prisma.task.groupBy({
    by: ['isCompleted'],
    where: { userId },
    _count: { 
      id: true 
    }
  });

  // Include recent task activity with eager loading
  const recentTasks = await prisma.task.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      isCompleted: true,
      priority: true,
      userId: true,
      createdAt: true,
      User: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Calculate weekly progress using groupBy
  // First, calculate the date from one week ago
  // Hint: Use new Date() and setDate() to subtract 7 days
  const date = new Date().getTime();
  //const newDate = new Date(date - 6.048e+8);
  //console.log(newDate.toLocaleString());
  const oneWeekAgo = new Date(date - 6.048e+8).toISOString();

  // Then use groupBy with a where clause filtering by createdAt >= oneWeekAgo
  const weeklyProgress = await prisma.task.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      createdAt: { gte: oneWeekAgo }
    },
    _count: { id: true }
  });

  // Return response with taskStats, recentTasks, and weeklyProgress
  res.status(200).json({
    taskStats,
    recentTasks,
    weeklyProgress
  });
}


async function getUsersWithStats(req, res) {
  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const usersRaw = await prisma.user.findMany({
    include: {
      Task: {
        where: { isCompleted: false },
        select: { id: true },
        take: 5
      },
      _count: {
        select: {
          Task: true
        }
      }
    },
    skip: skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  // Transform result to only include the fields we want
  const users = usersRaw.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    _count: user._count,
    Task: user.Task
  }));

  // Get total count for pagination
  const totalUsers = await prisma.user.count();

  // Build pagination object with page, limit, total, pages, hasNext, hasPrev
  // Hint: Use Math.ceil() for pages, compare page * limit with total for hasNext
  const pagination = {
    page: page,
    limit: limit,
    total: totalUsers,
    pages: Math.ceil(totalUsers/limit),
    hasNext: (page * limit) < totalUsers ? true : false,
    hasPrev: (page === 1 ? false : true)
  };

  return res.status(200).json({
    users: users,
    pagination: pagination
  });
}


module.exports = {
  getUserAnalytics,
  getUsersWithStats
};