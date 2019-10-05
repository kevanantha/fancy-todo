const { verifyJwt } = require('../helpers/jwt')
const Todo = require('../models/Todo')

const authentication = (req, res, next) => {
  try {
    const decode = verifyJwt(req.headers.access_token)
    req.loggedUser = decode
    next()
  } catch (err) {
    next(err)
  }
}

const authorization = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({
      userId: req.loggedUser.user,
    })
    if (todo.userId == req.loggedUser.user) {
      next()
    } else {
      const err = new Error('Not Authorized! You have no access')
      err.name = 'Unauthorized'
      next(err)
    }
  } catch (err) {
    next(err)
  }
}

module.exports = {
  authentication,
  authorization,
}
