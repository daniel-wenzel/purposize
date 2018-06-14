const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
  },
  address: {
    type: Sequelize.STRING,
    personalData: true,
    for: ["order_fulfillment"]
  },
  email: {
    type: Sequelize.STRING,
    personalData: true,
    for: ["order_fulfillment", "newsletter"]
  },
  phone: {
    type: Sequelize.STRING
  }
}, {
  containsPersonalData: ["email", "phone"]
})

sequelize.loadPurposes('/purposes.yml')


User.create({
  name: 'Daniel',
  address: '...',
  email: 'daniel@wenzel.space',
  purposes: ['newsletter', 'order-processing']
})

User.findAll({
  where: {
    name: 'Daniel'
  },
  purpose: 'newsletter'
});


app.get('/fulfillment/:orderId', (req, res) => { //PBAC style
  const user = await User.find({
    where: {
      order: req.params.orderId
    },
    purpose: 'order-fulfillment'
  })
  res.status(200).send(user)
})

app.get('/user/:name/for/:purpose', (req, res) => {
  const user = await User.find({
    where: {
      name: req.params.name
    },
    purpose: req.params.purpose
  })
  res.status(200).send(user)
})
