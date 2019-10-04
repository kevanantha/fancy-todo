if(process.env.NODE_ENV === 'development') {
    require('dotenv').config()
}

const morgan = require('morgan')
const express = require('express')
const routes = require('./routes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/',routes)

app.listen(PORT,_=>{console.log(`listening on port ${PORT}`)})
