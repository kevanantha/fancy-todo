const { Schema, model } = require('mongoose')

const todoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: Boolean,
      default: false,
    },
    due_date: {
      type: Date,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

const Todo = model('Todo', todoSchema)

module.exports = Todo
