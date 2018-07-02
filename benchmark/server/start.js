const sequelize = require('./sequelize')
const app = require('./app')

// Load up all models and sync them to the db
require('./models/Users')
sequelize.sync({ force: true })

// Start up the server
const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log('Server is running at localhost:' + port)
})