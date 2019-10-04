const User = require('../models/User')

module.exports = {
  async register(req, res, next) {
    const { email, password } = req.body
    const user = await User.create({
      email,
      password,
    })
  },
}
