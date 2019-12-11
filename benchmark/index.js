require("dotenv").config({ path: __dirname + "\\.env"})

const sequelize = require('./sequelize')

const purposize = require('../purposize')

const start = async () => {

  // Clear DB
  await sequelize.getQueryInterface().dropAllTables()
  await sequelize.sync({ force: true })

  const User = require('./models/Users')
  await sequelize.sync()
  
  if (sequelize.usePurposize) {
    await purposize.loadPurposes(__dirname + "\\purposes.yml")
  }

  await User.create({
    name: "Max Mustermann",
    email: "max.mustermann@gmail.com",
    dateOfBirth: "02.02.1995",
    gender: "Apache Helicopter",
    phoneNumber: "0172133769420",
  }, {
    purpose: "PROFILE"
  })

  const accessTimes = []
  const nIterations = parseFloat(process.env.N_ITERATIONS)
  for (let i = 0; i < nIterations; i++) {
    const a = new Date()
    const res = await User.findOne({
      where: {
        id: 1,
      },
      // attributes: ["gender"],
      purpose: "PROFILE",
    })
    const b = new Date()
    // console.log(b.getTime() - a.getTime())
    accessTimes.push(b.getTime() - a.getTime())
  }

  const sum = accessTimes.reduce((sum, t) => sum += t, 0)
  const avg = sum / accessTimes.length
  console.log(avg)
}

start()

