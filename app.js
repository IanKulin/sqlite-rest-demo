// Simple Express REST API to demonstrate working with sqlite3

const express = require('express');
const app = express();
const port = 3000;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/test.sqlite');

app.use(express.static('public'));
app.use(express.json());


// endpoint to add a user record to the users table
// expects a name and email in the JSON body of the request
app.post('/users', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const sql = `INSERT INTO users (name, email) VALUES ("${name}", "${email}")`;
  db.run(sql, function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(201).json({ rowid: this.lastID });
    }
  });
});


// endpoint to update a user record in the users table in the database
// expects a name, and email in the JSON body of the request
// expects an id in the URL
app.put('/user/:id', (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const email = req.body.email;
  const sql = `UPDATE users SET name = "${name}", email = "${email}" WHERE rowid = ${id}`;
  db.run(sql, (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send('User updated.');
    }
  });
});


// endpoint to get all users from the users table in the database
app.get('/users', (req, res) => {
  const sql = 'SELECT rowid, * FROM users';
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send(rows);
    }
  });
});


// endpoint to get a single user from the users table in the database
// expects an id in the URL
app.get('/user/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT rowid, * FROM users WHERE rowid = ${id}`;
  db.get(sql, (err, row) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send(row);
    }
  });
});


// endpoint to delete a user record from the users table in the database
// expects an id in the URL. Doesn't complain if the id doesn't exist.
app.delete('/user/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM users WHERE rowid = ${id}`;
  db.run(sql, (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send();
    }
  });
});


// close the database connection when the app is shutting down
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing SQLite database:', err.message);
    } else {
      process.exit(0);
    }

  });
});


// if the 'users' table doesn't exist, create it with 'name' and 'email' columns
db.run('CREATE TABLE IF NOT EXISTS users (name TEXT, email TEXT)');

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});