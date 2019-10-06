const Project = require('../models/Project')
const Todo = require('../models/Todo')

module.exports = {
  async index(req, res, next) {
    try {
      const projects = await Project.find({
        owner: req.loggedUser.user,
      }).populate(['members', 'owner'])
      res.status(200).json(projects)
    } catch (err) {
      next(err)
    }
  },
  async create(req, res, next) {
    try {
      const project = await Project.create({
        name: req.body.name,
        owner: req.loggedUser.user,
        members: [...req.body.members, req.loggedUser.user],
      })
      res.status(201).json(project)
    } catch (err) {
      next(err)
    }
  },
  async show(req, res, next) {
    try {
      const project = await Project.findOne({
        _id: req.params.projectId,
      }).populate(['todo', 'members', 'owner'])
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
      res.status(201).json(todo)
    } catch (err) {
      next(err)
    }
  },
}
