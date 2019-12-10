const Sequelize = require("sequelize")
const sequelize = require("../sequelize")

const User = sequelize.define("user", {
  name: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
    isPersonalData: true,
  },
  dateOfBirth: {
    type: Sequelize.STRING,
    isPersonalData: true,
  },
  gender: {
    type: Sequelize.STRING,
    isPersonalData: true,
  },
  phoneNumber: {
    type: Sequelize.STRING,
    isPersonalData: true,
  },
})

module.exports = User
