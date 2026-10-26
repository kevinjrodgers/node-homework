const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber = lastTaskNumber + 1;
    return lastTaskNumber;
  }
})();

function createTask() {
  return {
    id: taskCounter(),
    title: "Task "  + taskCounter,
    isCompleted: false,
    userId: global.user_id.email,
  }
}