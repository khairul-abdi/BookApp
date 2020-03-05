const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()


// Creation of the Express server
const app = express()

// Server configuration
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))

// Connection to the SQlite database
const db_name = path.join(__dirname, 'data', 'apptest.db')
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message)
  }
  console.log("Successful connection to the database 'apptest.db'")
})

// Creation of the Books table (Book_ID, Title, Author, Comments)
const sql_create = `CREATE TABLE IF NOT EXISTS Books (
  Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL,
  ISBN TEXT
);`
db.run(sql_create, err => {
  if (err) {
    return console.error(err.message)
  }
  console.log("Successful creation of the 'Books' table")
  // Table feeding
  const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, ISBN) VALUES
  (1, 'Khairul Abdi', 'Javascript', '344545'),
  (2, 'Diah Puja', 'Ada Apa Dengan Kita', '3456243'),
  (3, 'Anggiat Bangun', 'Bertani', '3435646454');`
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message)
    }
    console.log("Successful insert from the 'Books' table")
  })
})

// Server startup
app.listen(5000, () => {
  console.log(`Server started ${'http://localhost:5000'} !`)
})

// GET /
app.get('/', (req, res) => {
  // res.send('Hello World...')
  res.render('index')
})

// GET /about
app.get('/about', (req, res) => {
  res.render('about')
})

// GET /books
app.get('/books', (req, res) => {
  const sql = 'SELECT * FROM Books ORDER BY Title'
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message)
    }
    res.render('books', { model: rows })
  })
})

// GET /create
app.get('/create', (req, res) => {
  res.render('create', { model: {} })
})

// POST /create
app.post('/create', (req, res) => {
  const sql = 'INSERT INTO Books (Title, Author, ISBN) VALUES (?, ?, ?)'
  const book = [req.body.Title, req.body.Author, req.body.ISBN]
  db.run(sql, book, err => {
    if (err) {
      return console.error(err.message)
    }
    res.redirect('/books')
  })
})

// GET /edit/:id
app.get('/edit/:id', (req, res) => {
  const id = req.params.id
  const sql = 'SELECT * FROM Books WHERE Book_ID = ?'
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message)
    }
    res.render('edit', { model: row })
  })
})

// POST /edit/5
app.post('/edit/:id', (req, res) => {
  const id = req.params.id
  const book = [req.body.Title, req.body.Author, req.body.ISBN, id]
  const sql =
    'UPDATE Books SET Title = ?, Author = ?, ISBN = ? WHERE (Book_ID = ?)'
  db.run(sql, book, err => {
    if (err) {
      return console.error(err.message)
    }
    res.redirect('/books')
  })
})

// GET /delete/1
app.get('/delete/:id', (req, res) => {
  const id = req.params.id
  const sql = 'SELECT * FROM Books WHERE Book_ID = ?'
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message)
    }
    res.render('delete', { model: row })
  })
})

// POST /delete/5
app.post('/delete/:id', (req, res) => {
  const id = req.params.id
  const sql = 'DELETE FROM Books WHERE Book_ID = ?'
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message)
    }
    res.redirect('/books')
  })
})
