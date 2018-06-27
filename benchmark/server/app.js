const express = require('express')

const app = express()
const routes = require('./routes')

app.use(express.json()); // for parsing application/json

app.use('/', routes)

module.exports = app