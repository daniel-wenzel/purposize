const sequelize = require('./sequelize')
const purposize = require('purposize')
const app = require('./app')

const startServer = async () => {
  // Load up all models and sync them to the db
  require('./models/Users')
  await sequelize.getQueryInterface().dropAllTables()
  await sequelize.sync({ force: true })

  if (sequelize.purposize) {
    await purposize.loadPurposes('./purposes.yml')
  }
  

  // Start up the server
  const port = process.env.PORT || 8000
  const server = app.listen(port, () => {
    console.log('Server is running at localhost:' + port)
  })
}

startServer()

