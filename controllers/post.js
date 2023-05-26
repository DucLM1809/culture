const Post = require('../models/Post')
const Genre = require('../models/Genre')
const User = require('../models/User')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { getVoteFuncs, addVoteParams, checkDuplicateGenre } = require('../utils/funcShortPost')

// eslint-disable-next-line no-undef
const distributionDomain = process.env.AWS_DISTRIBUTION_DOMAIN

const [upvote, disUpvote, downvote, disDownvote] = getVoteFuncs(Post)

const ObjectId = mongoose.Types.ObjectId

const getAllPostsOfUser = async (req, res) => {
  const userId = req.query.userId
  const requestUser = req.user.userId
  const rs = await Post.aggregate([
    {
      $match: {
        createdBy: ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdUser',
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        medias: 1,
        createdBy: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        upvotes: 1,
        downvotes: 1,
        'createdUser.role': 1,
        'createdUser._id': 1,
        'createdUser.name': 1,
        'createdUser.email': 1,
        'createdUser.avatar': 1,
      },
    },
    {
      $unwind: {
        path: '$createdUser',
      },
    },
  ])
  if (!rs) {
    throw new NotFoundError(`No posts of userId ${userId}`)
  }

  const jsonRs = rs.map((item) => addVoteParams(item, requestUser))

  res.status(StatusCodes.OK).json({ data: jsonRs })
}

const getPost = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req
  const rs = await Post.aggregate([
    {
      $match: {
        _id: ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdUser',
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        medias: 1,
        createdBy: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        upvotes: 1,
        downvotes: 1,
        'createdUser.role': 1,
        'createdUser._id': 1,
        'createdUser.name': 1,
        'createdUser.email': 1,
        'createdUser.avatar': 1,
      },
    },
    {
      $limit: 1,
    },
    {
      $unwind: {
        path: '$createdUser',
      },
    },
  ])

  if (!rs) {
    throw new NotFoundError(`No post with id ${id}`)
  }
  res.status(StatusCodes.OK).json({
    data: addVoteParams(rs[0], userId),
  })
}

const getType = (mime) => {
  if (!mime) return
  if (mime.includes('image')) return 'image'
  if (mime.includes('video')) return 'video'
  return null
}

const getMedias = (files) => {
  return Array.isArray(files)
    ? files.map((item) => ({
        url: distributionDomain + '/' + item.key,
        type: getType(item.mimetype),
      }))
    : null
}

const validatePost = async (data) => {
  if (!data.content) {
    throw new BadRequestError('Content field cannot be empty')
  }

  if (!Array.isArray(data.genres) || data.genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    data.genres.forEach(async (genreId) => {
      const r = await Genre.findOne({
        _id: genreId,
      })
      if (!r) {
        throw new BadRequestError(`Genre id is invalid ${genreId}`)
      }
    })
    checkDuplicateGenre(data.genres)
  }
}

const uploadPost = async (req, res) => {
  const { description, content } = req.body
  const medias = getMedias(req.files)
  const createdBy = req.user.userId
  const genres = JSON.parse(req.body.genres || '')
  const data = {
    content,
    medias,
    createdBy,
    genres,
    description,
  }
  await validatePost(data)

  const rs = await Post.create(data)
  const createdUser = await User.findOne(
    {
      _id: createdBy,
    },
    {
      role: 1,
      _id: 1,
      name: 1,
      email: 1,
      avatar: 1,
    }
  )
  const jsonRs = JSON.parse(JSON.stringify(rs))
  jsonRs.createdUser = JSON.parse(JSON.stringify(createdUser))

  res.status(StatusCodes.CREATED).json({ data: jsonRs })
}

const updatePostWithMedias = async (req, res) => {
  const id = req.params.id
  const { description, content } = req.body
  const medias = getMedias(req.files)
  const userId = req.user.userId
  const genres = JSON.parse(req.body.genres || '')
  const data = {
    content,
    medias,
    genres,
    description,
  }
  await validatePost(data)

  const rs = await Post.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })

  res.status(StatusCodes.OK).json({ data: rs })
}

const updatePostBasic = async (req, res) => {
  const id = req.params.id
  const { description, content } = req.body
  const userId = req.user.userId
  const genres = JSON.parse(req.body.genres || '')
  const data = {
    content,
    genres,
    description,
  }
  await validatePost(data)

  const rs = await Post.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })
  res.status(StatusCodes.OK).json({ data: rs })
}

const deletePost = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req

  await Post.findByIdAndRemove({
    _id: id,
    createdBy: userId,
  })

  res.status(StatusCodes.OK).json()
}

module.exports = {
  getAllPostsOfUser,
  getPost,
  uploadPost,
  updatePostBasic,
  updatePostWithMedias,
  deletePost,
  upvote,
  disUpvote,
  downvote,
  disDownvote,
}
