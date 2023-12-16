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
  const updateSql = `UPDATE users SET name = ?, email = ? WHERE rowid = ?`;
  db.run(updateSql, [name, email, id], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      const selectSql = `SELECT rowid, * FROM users WHERE rowid = ?`;
      db.get(selectSql, [id], (err, row) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).json(row);
        }
      });
    }
  });
});


// endpoint to update a user record in the users table in the database
// expects a partial record in the JSON body of the request
// expects an id in the URL
app.patch('/user/:id', (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const email = req.body.email;
  let fieldsToUpdate = [];
  let values = [];

  if (name !== undefined) {
    fieldsToUpdate.push('name = ?');
    values.push(name);
  }

  if (email !== undefined) {
    fieldsToUpdate.push('email = ?');
    values.push(email);
  }

  if (!fieldsToUpdate.length) {
    res.status(400).send('No fields to update.');
    return;
  }

  const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE rowid = ?`;
  values.push(id);

  db.run(sql, values, (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      const selectSql = `SELECT rowid, * FROM users WHERE rowid = ?`;
      db.get(selectSql, [id], (err, row) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).json(row);
        }
      });
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
  const sql = `SELECT rowid, * FROM users WHERE rowid = ?`;
  db.get(sql, [id], (err, row) => {
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
  const sql = `DELETE FROM users WHERE rowid = ?`;
  db.run(sql, [id], (err) => {
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