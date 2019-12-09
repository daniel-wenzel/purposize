const chai = require('chai')
const expect = chai.expect

exports.expectThrowsAsync = async (method) => {
  let error = null
  try {
    await method()
  }
  catch (err) {
    error = err
  }
  expect(error).to.be.an('Error')
}