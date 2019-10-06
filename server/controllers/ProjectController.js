const Project = require('../models/Project')
const Todo = require('../models/Todo')

module.exports = {
  async index(req, res, next) {
    try {
      const projects = await Project.find({
        members: {
          $in: req.loggedUser.user,
        },
      }).populate(['members', 'owner', 'todos'])
      res.status(200).json(projects)
    } catch (err) {
      next(err)
    }
  },
  async create(req, res, next) {
    try {
      const obj = {}
      if (req.body.members) {
        obj.name = req.body.name
        obj.owner = req.loggedUser.user
        obj.members = req.body.members
      } else {
        obj.name = req.body.name
        obj.owner = req.loggedUser.user
      }
      const project = await Project.create(obj)
      res.status(201).json(project)
    } catch (err) {
      next(err)
    }
  },
  async show(req, res, next) {
    try {
      const project = await Project.findOne({
        _id: req.params.projectId,
      }).populate(['todos', 'members', 'owner'])
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  },
  async createTodo(req, res, next) {
    try {
      const { name, description, due_date } = req.body
      const { user: userId } = req.loggedUser
      const todo = await Todo.create({ userId, name, description, due_date })

      const project = await Project.findOneAndUpdate(
        {
          _id: req.params.projectId,
        },
        {
          $push: {
            todos: todo._id,
          },
        },
      )
      res.status(201).json(project)
    } catch (err) {
      next(err)
    }
  },
  async addMember(req, res, next) {
    try {
      const project = await Project.findOneAndUpdate(
        {
          _id: req.body.projectId,
        },
        {
          $push: {
            members: req.body.userId,
          },
        },
      )
      res.status(200).json(project)
    } catch (err) {
      next(err)
    }
  },
}
