const User = require('../models/User')
const { generateJwt, verifyJwt } = require('../helpers/jwt')
const { verifyPassword } = require('../helpers/bcrypt')
const axios = require('axios')

module.exports = {
  async register(req, res, next) {
    const { email, password } = req.body
    const name = email.match(/^(\w+)\..*\.(\w+)@/)
    try {
      const user = await User.create({
        email,
        name,
        password,
        loginWith: 'Form',
      })
      const token = generateJwt({ user: user._id })
      res.status(201).json({
        name,
        token,
      })
    } catch (err) {
      next(err)
    }
  },
  async login(req, res, next) {
    const { email, password } = req.body
    try {
      const user = await User.findOne({
        email,
      })
      if (user && verifyPassword(password, user.password)) {
        const token = generateJwt({ user: user._id })
        res.status(200).json({
          name,
          token,
        })
      } else {
        const err = new Error('Incorrect email/password')
        err.name = 'AuthenticationError'
        next(err)
      }
    } catch (err) {
      next(err)
    }
  },
  async github(req, res, next) {
    try {
      const { code } = req.query
      const { data: token } = await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`,
        headers: {
          accept: 'application/json',
        },
      })

      const { data: user } = await axios({
        method: 'get',
        url: 'https://api.github.com/user',
        headers: {
          Authorization: `token ${token.access_token}`,
        },
      })

      const data = await User.findOne({
        email: user.email,
      })
      if (data) {
        if (data.loginWith !== 'github') {
          const err = new Error(
            `You already registered with ${data.loginWith}, login with ${data.loginWith} instead`,
          )
          err.name = 'AuthenticationError'
          next(err)
        } else {
          const token = generateJwt({ user: data._id })
          res.status(200).json({
            token,
            name: data.name,
          })
        }
      } else {
        const newUser = await User.create({
          email: user.email,
          name: user.name,
          password: process.env.DEFAULT_PASSWORD,
          loginWith: 'github',
        })

        const token = generateJwt({ user: newUser._id })
        res.status(200).json({
          token,
          name: user.name,
        })
      }
    } catch (err) {
      next(err)
    }
  },
}
