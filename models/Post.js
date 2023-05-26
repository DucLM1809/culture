const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
  {
    checked: {
      type: Boolean,
      default: false,
    },
    medias: [
      {
        url: String,
        type: String,
      },
    ],
    description: {
      $type: String,
    },
    content: {
      $type: String,
      required: [true, 'Please provide content'],
    },
    upvotes: [
      {
        $type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide upvote users'],
      },
    ],
    downvotes: [
      {
        $type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide downvote users'],
      },
    ],
    genres: [mongoose.Types.ObjectId],
    createdBy: {
      $type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { typeKey: '$type', timestamps: true }
)

module.exports = mongoose.model('Post', PostSchema)
