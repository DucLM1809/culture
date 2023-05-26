const mongoose = require('mongoose')

const GenreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Must provide name!'],
    },
    other: String,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Genre', GenreSchema)
