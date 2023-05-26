const mongoose = require('mongoose')

const ShortSchema = new mongoose.Schema(
  {
    checked: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      required: [true, 'Please provide url'],
    },
    duration: {
      type: Number,
      required: [true, "Please provide short's duration"],
    },
    description: {
      type: String,
    },
    upvotes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide upvote users'],
      },
    ],
    downvotes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide downvote users'],
      },
    ],
    views: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide viewed users'],
      },
    ],
    genres: [mongoose.Types.ObjectId],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Short', ShortSchema)
