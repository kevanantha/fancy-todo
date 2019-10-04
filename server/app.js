if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const routes = require('./routes')
const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

mongoose
  .connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to DB`)
  })
  .catch(err => {
    console.log(err, 'Error to connect DB')
  })

app.use('/', routes)

app.listen(PORT, () => console.log(`Server runs on PORT: ${PORT}`))
