app.post("/api/tasks", create);
app.get("/api/tasks", index);
app.get("/api/tasks/:id", show);
app.patch("/api/tasks/:id", update);
app.delete("/api/tasks/:id", deleteTask);