require('dotenv').config()
var cors = require('cors')
const express = require('express')
const app = express()
app.use(cors({
    origin: "*"
}))
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection

db.on('error',(error)=>console.log(error))
db.once('open', () => console.log('connected to database'))

app.use(express.json())

const usersRouter = require('./routes/users')
const customersRouter = require('./routes/customers')

app.use('/users', usersRouter)
app.use('/customers-page', customersRouter)
app.listen(3000, () => console.log('Server started'))