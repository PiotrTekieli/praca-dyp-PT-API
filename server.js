require('dotenv').config()

const express = require('express')
const app = express()

const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log("Connected To Database"))

app.use(express.json({limit: "Infinity"}))

var cors = require('cors')
app.use(cors())

const authRouter = require('./routes/auth')
app.use('/auth', authRouter)

const fileRouter = require('./routes/files')
app.use('/file', fileRouter)

app.get("*", (req, res) => {
    res.status(404).json({ message: "Route not found." })
})

app.listen(process.env.PORT, () => console.log("Server Started"))