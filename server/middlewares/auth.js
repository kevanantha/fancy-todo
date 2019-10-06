const { verifyJwt } = require('../helpers/jwt')
const Todo = require('../models/Todo')
const Project = require('../models/Project')

const authentication = (req, res, next) => {
  try {
    const decode = verifyJwt(req.headers.access_token)
    req.loggedUser = decode
    next()
  } catch (err) {
    next(err)
  }
}

const authorizationTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.todoId,
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

const authorizationProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
    })

    const isAllowed = project.members.find(member => {
      if (member == req.loggedUser.user) return true
      return false
    })

    if (isAllowed) {
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
  authorizationTodo,
  authorizationProject,
}
