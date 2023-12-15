// Simple express app to demonstrate working with sqlite3
const express = require('express');
const app = express();
const port = 3000;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/test.sqlite');


app.use(express.static('public'));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello, World!');
});


// endpoint to create add a user record to the users table in the database
// expects a name and email in the body of the request
app.post('/adduser', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const sql = `INSERT INTO users (name, email) VALUES ("${name}", "${email}")`;
  db.run(sql, (err) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send('User added successfully!');
    }
  });
});


// endpoint to create add a user record to the users table in the database
// expects a name and email in the query string
app.post('/adduser', (req, res) => {
  const name = req.query.name;
  const email = req.query.email;
  const sql = `INSERT INTO users (name, email) VALUES ("${name}", "${email}")`;
  db.run(sql, (err) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send('User added successfully!');
    }
  });
});


// endpoint to get all users from the users table in the database
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.all(sql, (err, rows) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send(rows);
    }
  });
});


// endpoint to delete a user record from the users table in the database
// expects an id in the body of the request
app.delete('/user', (req, res) => {
  const id = req.body.id;
  console.log(id);
  const sql = `DELETE FROM users WHERE rowid = ${id}`;
  db.run(sql, (err) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send('User deleted successfully!');
    }
  });
});


// if the 'users' table doesn't exist, create it with 'name' and 'email' columns
db.run('CREATE TABLE IF NOT EXISTS users (name TEXT, email TEXT)');

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});