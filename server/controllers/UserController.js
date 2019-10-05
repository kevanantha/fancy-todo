const User = require('../models/User')
const { generateJwt, verifyJwt } = require('../helpers/jwt')
const { verifyPassword } = require('../helpers/bcrypt')
const axios = require('axios')
const { OAuth2Client } = require('google-auth-library')

module.exports = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })

      if (user && user.loginWith !== 'Form') {
        const err = new Error(
          `You already registered with ${user.loginWith}, login with ${user.loginWith} instead`,
        )
        err.name = 'AuthenticationError'
        next(err)
      } else {
        console.log(email, password)
        const newUser = await User.create({
          email,
          password,
          loginWith: 'Form',
        })
        console.log(newUser)
        const token = generateJwt({ user: newUser._id })
        res.status(201).json({
          name: newUser.name,
          token,
        })
      }
    } catch (err) {
      next(err)
    }
  },
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const user = await User.findOne({
        email,
      })
      if (user) {
        if (user.loginWith !== 'Form') {
          const err = new Error(
            `You already registered with ${user.loginWith}, login with ${user.loginWith} instead`,
          )
          err.name = 'AuthenticationError'
          next(err)
        } else if (verifyPassword(password, user.password)) {
          const token = generateJwt({ user: user._id })
          res.status(200).json({
            name: user.name,
            token,
          })
        }
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
        if (data.loginWith !== 'Github') {
          const err = new Error(
            `You already registered with ${data.loginWith}, login with ${data.loginWith} instead`,
          )
          err.name = 'AuthenticationError'
          next(err)
        } else {
          const token = generateJwt({ user: data._id })
          // res.redirect(`http://localhost:8080?token=${token}`)
          // console.log(verifyJwt(token))
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
          loginWith: 'Github',
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
  async gsignin(req, res, next) {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
      const { payload } = await client.verifyIdToken({
        idToken: req.body.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const user = await User.findOne({
        email: payload.email,
      })

      if (user) {
        if (user.loginWith !== 'Google') {
          const err = new Error(
            `You already registered with ${user.loginWith}, login with ${user.loginWith} instead`,
          )
          err.name = 'AuthenticationError'
          next(err)
        } else {
          const token = generateJwt({
            user: user._id,
          })
          res.status(200).json({
            token,
            name: user.name,
          })
        }
      } else {
        const newUser = await User.create({
          email: payload.email,
          password: process.env.DEFAULT_PASSWORD,
          name: payload.name,
          loginWith: 'Google',
        })

        const token = generateJwt({ user: newUser._id })
        res.status(200).json({
          token,
          name: newUser.name,
        })
      }
    } catch (err) {
      next(err)
    }
  },
}
