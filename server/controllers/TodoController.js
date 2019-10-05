const Todo = require('../models/Todo')

module.exports = {
  async index(req, res, next) {
    try {
      const todos = await Todo.find({
        userId: req.loggedUser.user,
      })
      res.status(200).json(todos)
    } catch (err) {
      next(err)
    }
  },
  async show(req, res, next) {
    try {
      const todo = await Todo.findOne({
        _id: req.params.todoId,
      })
      res.status(200).json(todo)
    } catch (err) {
      next(err)
    }
  },
  async create(req, res, next) {
    try {
      const { name, description, due_date } = req.body
      const { user: userId } = req.loggedUser
      const todo = await Todo.create({ userId, name, description, due_date })
      res.status(201).json(todo)
    } catch (err) {
      next(err)
    }
  },
  async update(req, res, next) {
    try {
      const allowed = ['name', 'description', 'status', 'due_date']
      const update = {}
      allowed.forEach(allow => {
        for (let key in req.body) {
          if (key == allow) {
            update[key] = req.body[key]
          }
        }
      })
      await Todo.findOneAndUpdate(
        {
          _id: req.params.todoId,
        },
        update,
      )
      res.status(200).json({
        message: 'Updated Successfully',
      })
    } catch (err) {
      next(err)
    }
  },
  async updatePatch(req, res, next) {
    //   try {
    //     const {  }
    //   } catch(err) {
    //     next(err)
    //   }
  },
  async delete(req, res, next) {
    try {
      await Todo.deleteOne({
        _id: req.params.todoId,
      })
      res.status(200).json({
        message: 'Deleted Successfully',
      })
    } catch (err) {
      next(err)
    }
  },
}
