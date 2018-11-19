const express = require('express')
var cors = require('cors');
const { db } = require('./db/index')

const app = express()

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/users', require('./routes/users'))
app.use('/articles', require('./routes/articles'))
    // app.use('/comments', require('./routes/comments'))

db.sync()
    .then(() => {
        console.log("Database synced")
        app.listen(4141, () => {
            console.log("Server started on port 4141")
        })
    })
    .catch(console.error)
