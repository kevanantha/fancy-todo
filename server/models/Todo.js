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
      validate: {
        validator(value) {
          return new Promise((resolve, reject) => {
            const today = new Date()
            const todayForComparison = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              0,
              -today.getTimezoneOffset(),
            )
            if (new Date(value) < todayForComparison) {
              resolve(false)
            } else {
              resolve(true)
            }
          })
        },
        message: 'Invalid Date',
      },
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

todoSchema.pre('findOneAndUpdate', function(next) {
  const today = new Date()
  const todayForComparison = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    -today.getTimezoneOffset(),
  )
  const value = this.getUpdate().due_date
  if (new Date(value) < todayForComparison) {
    const err = new Error('Invalid Date')
    err.name = 'ValidationError'
    next(err)
  } else {
    next()
  }
})

const Todo = model('Todo', todoSchema)

module.exports = Todo
