const mongoose = require('mongoose')

const ShortSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Please provide url'],
    },
    duration: {
      type: Number,
      required: [true, "Please provide short's duration"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Short', ShortSchema)
