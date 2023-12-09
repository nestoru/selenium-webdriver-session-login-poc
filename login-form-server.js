const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Middleware setup
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to log every request
app.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request cookies:', req.cookies); // Now req.cookies should work correctly
  // Log the Set-Cookie header in the response
  res.on('finish', () => {
    console.log('Response headers:', res.getHeaders());
  });
  next();
});

// In-memory user storage (replace with a database in a real-world scenario)
const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
];

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', isLoggedIn, (req, res) => {
  res.send(`
    <h1>Hello, ${req.session.user.username}!</h1>
    <form action="/logout" method="post">
      <button type="submit">Logout</button>
    </form>
  `);
});

app.route('/login')
  .get((req, res) => {
    res.send(`
      <h1>Login</h1>
      <form action="/login" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <br>
        <button type="submit">Login</button>
      </form>
    `);
  })
  .post((req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.send('Invalid username or password. <a href="/login">Try again</a>');
    }
  });

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

