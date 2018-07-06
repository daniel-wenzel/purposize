const Users = require('../models/Users')

exports.getAllUsers = async (req, res) => {
  const { purpose } = req.query
  const result = await Users.findAll({ 
    purpose: purpose
  })
  res.json(result)
}

exports.getUserById = async (req, res) => {
  const { id } = req.params
  const { purpose } = req.query 
  const result = await Users.find({
    where: {
      id
    },
    purpose: purpose
  })
  res.json(result)
}

exports.createUser = async (req, res) => {
  const { purpose } = req.body
  const newUser = await Users.create(req.body, { purpose })
  res.json(newUser)
}

exports.updateUser = async (req, res) => {
  const { id } = req.params
  const { purpose } = req.body
  const oldUser = await Users.find({
    where: {
      usersId: id
    }
  })

  await oldUser.update(req.body, { purpose })
}