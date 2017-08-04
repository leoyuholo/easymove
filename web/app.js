const express = require('express')
const bodyParser = require('body-parser')

const route = require('./routes/route')

const app = express()

app.use(bodyParser.json({limit: '100mb', type: '*/*'}))

app.use('/route', route)

module.exports = app
