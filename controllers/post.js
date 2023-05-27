const Post = require('../models/Post')
const Genre = require('../models/Genre')
const User = require('../models/User')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors')
const { getVoteFuncs, addVoteParams, checkDuplicateGenre } = require('../utils/funcShortPost')
const { addRecomPost, deleteRecom, updateRecomPost, getRecom, verify, refuse, searchRecom } = require('../recombee')

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
      $lookup: {
        from: 'genres',
        localField: 'genres',
        foreignField: '_id',
        as: 'queryGenres',
      },
    },
    {
      $unset: 'createdUser.password',
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

const getRecommends = async (req, res) => {
  const requestUser = req.user.userId
  const role = req.user.role || 'USER'
  const type = req.query.type
  let recoms
  let flag = false
  recomLabel: try {
    if (type === 'unverified') {
      if (!['AGED', 'ADMIN'].includes(role)) {
        flag = true
        break recomLabel
      }
      recoms = await getRecom(requestUser, 'unverified-post')
    } else {
      recoms = await getRecom(requestUser, 'verified-post')
    }
  } catch (error) {
    console.log(error)
  }
  if (flag) {
    throw new UnauthenticatedError('You do not have permission')
  }
  const itemIds = recoms.recomms.map((item) => ObjectId(item.id))
  console.log(itemIds)

  const rs = await Post.aggregate([
    {
      $match: {
        _id: {
          $in: itemIds,
        },
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
      $lookup: {
        from: 'genres',
        localField: 'genres',
        foreignField: '_id',
        as: 'queryGenres',
      },
    },
    {
      $unset: 'createdUser.password',
    },
    {
      $unwind: {
        path: '$createdUser',
      },
    },
  ])

  if (!rs) {
    throw new NotFoundError(`Invalid recommend id`)
  }

  const jsonRs = rs.map((item) => addVoteParams(item, requestUser, true))

  res.status(StatusCodes.OK).json({
    recommId: recoms.recommId,
    data: jsonRs,
  })
}

const search = async (req, res) => {
  const requestUser = req.user.userId
  const query = req.query.query
  let recoms
  try {
    recoms = await searchRecom(requestUser, query, 'post')
  } catch (error) {
    console.log('searchRecom', error)
  }

  const itemIds = recoms.recomms.map((item) => ObjectId(item.id))
  console.log(itemIds)

  const rs = await Post.aggregate([
    {
      $match: {
        _id: {
          $in: itemIds,
        },
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
      $lookup: {
        from: 'genres',
        localField: 'genres',
        foreignField: '_id',
        as: 'queryGenres',
      },
    },
    {
      $unset: 'createdUser.password',
    },
    {
      $unwind: {
        path: '$createdUser',
      },
    },
  ])

  if (!rs) {
    throw new NotFoundError(`Invalid recommend id`)
  }

  const jsonRs = rs.map((item) => addVoteParams(item, requestUser, true))

  res.status(StatusCodes.OK).json({
    recommId: recoms.recommId,
    data: jsonRs,
  })
}

const scrutinize = async (req, res) => {
  const id = req.params.id
  const role = req.user.role || 'USER'
  const action = req.body.action

  if (!['AGED', 'ADMIN'].includes(role)) {
    throw new UnauthenticatedError('User does not have permission')
  }

  let value = action === 'accept' ? 'acceptCount' : 'refuseCount'

  const rs = await Post.findByIdAndUpdate(
    {
      _id: id,
    },
    {
      $inc: {
        [value]: 1,
      },
    },
    { new: true, runValidators: true }
  )

  if (rs.acceptCount >= 1) {
    verify(id)
    await Post.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        checked: true,
      },
      { new: true, runValidators: true }
    )
  } else if (rs.refuseCount >= 1) {
    refuse(id)
    await Post.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        checked: true,
      },
      { new: true, runValidators: true }
    )
  }

  res.status(StatusCodes.OK).json({ message: 'Success' })
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

  let queryGenres
  if (!Array.isArray(data.genres) || data.genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    queryGenres = await Genre.find({ _id: data.genres })

    if (queryGenres.length !== data.genres.length) {
      throw new BadRequestError(`Genre is invalid or duplicate`)
    }
  }

  return queryGenres
}

const uploadPost = async (req, res) => {
  const { description, content } = req.body
  const medias = req.body.medias
  const createdBy = req.user.userId
  let genres = req.body.genres || ''

  const data = {
    content,
    medias,
    createdBy,
    genres,
    description,
  }
  const queryGenres = await validatePost(data)

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
  jsonRs.queryGenres = queryGenres
  addRecomPost(jsonRs._id, {
    ...data,
    genres: queryGenres,
  })

  res.status(StatusCodes.CREATED).json({ data: jsonRs })
}

const updatePostWithMedias = async (req, res) => {
  const id = req.params.id
  const { description, content } = req.body
  const medias = req.body.medias
  const userId = req.user.userId
  let genres
  try {
    genres = JSON.parse(req.body.genres || '')
  } catch (error) {
    genres = req.body.genres || ''
  }
  const data = {
    content,
    medias,
    genres,
    description,
  }
  const queryGenres = await validatePost(data)

  const rs = await Post.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })
  updateRecomPost(id, {
    ...data,
    genres: queryGenres,
  })
  res.status(StatusCodes.OK).json({ data: rs })
}

const updatePostBasic = async (req, res) => {
  const id = req.params.id
  const { description, content } = req.body
  const userId = req.user.userId
  let genres
  try {
    genres = JSON.parse(req.body.genres || '')
  } catch (error) {
    genres = req.body.genres || ''
  }
  const data = {
    content,
    genres,
    description,
  }
  const queryGenres = await validatePost(data)

  const rs = await Post.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })
  updateRecomPost(id, {
    ...data,
    genres: queryGenres,
  })
  res.status(StatusCodes.OK).json({ data: rs })
}

const deletePost = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req

  const rs = await Post.findByIdAndRemove({
    _id: id,
    createdBy: userId,
  })

  if (!rs) {
    throw new NotFoundError(`No post with id ${id}`)
  }
  deleteRecom(id)

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
  getRecommends,
  scrutinize,
  search,
}
