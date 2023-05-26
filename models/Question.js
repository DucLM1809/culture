const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minLength: 5,
    maxLength: 200
  },
  answers: {
    type: [
      {
        value: String | Number,
        isTrue: Boolean
      }
    ],
    required: [true, 'Please provide answers']
  },
  users: {
    type: [mongoose.Types.ObjectId],
    ref: 'User'
  }
})

module.exports = mongoose.model('Question', QuestionSchema)
