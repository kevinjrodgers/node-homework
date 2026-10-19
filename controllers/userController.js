function register(req, res) {
  console.log(req.body.name);
  console.log(req.body.email);
  console.log(req.body.password);

  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  }

  global.users = [...global.users, user];
  global.user_id = user;

  res.status(201).json({
    name: user.name,
    email: user.email,
  });
}

function logon(req, res) {
  console.log(req.body.email);
  console.log(req.body.password);

  for(let i = 0; i < global.users.length; i++) {
    if(global.users[i].email === req.body.email) {
      if(global.users[i].password === req.body.password) {
        global.user_id = global.users[i];

        res.status(200).json({
          name: global.users[i].name,
          email: global.users[i].email,
        });
      } else {
        res.status(401).json({
          message: "Invalid email/password", // For testing purposes
        });
      }
    } else {
      res.status(401).json({
        message: "Invalid email/password", // For testing purposes
      });
    }
  }
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200);
}


module.exports = {
  register,
  logon,
  logoff
}