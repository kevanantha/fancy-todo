const { Schema, model } = require('mongoose')

const projectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  todos: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Todo',
    },
  ],
})

const Project = model('Project', projectSchema)

module.exports = Project
