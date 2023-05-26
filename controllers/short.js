const Short = require('../models/Short')
const Genre = require('../models/Genre')
const User = require('../models/User')
const ObjectId = require('mongoose').Types.ObjectId

const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { getVoteFuncs, addVoteParams, checkDuplicateGenre } = require('../utils/funcShortPost')
const { addRecomShort, updateRecomShort, deleteRecom } = require('../recombee')

// eslint-disable-next-line no-undef
const distributionDomain = process.env.AWS_DISTRIBUTION_DOMAIN

const getAllShortsOfUser = async (req, res) => {
  const userId = req.query.userId
  const requestUser = req.user.userId
  const rs = await Short.aggregate([
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
    throw new NotFoundError(`No shorts of userId ${userId}`)
  }

  const jsonRs = rs.map((item) => addVoteParams(item, requestUser, true))

  res.status(StatusCodes.OK).json({ data: jsonRs })
}

const getShort = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req
  const rs = await Short.aggregate([
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
      $unset: 'createdUser.password',
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
    throw new NotFoundError(`No short with id ${id}`)
  }
  res.status(StatusCodes.OK).json({ data: addVoteParams(rs[0], userId, true) })
}

const uploadShort = async (req, res) => {
  const duration = Number(req.body.duration)
  const description = req.body.description
  const url = distributionDomain + '/' + req.file.key
  const createdBy = req.user.userId
  let genres
  try {
    genres = JSON.parse(req.body.genres || '')
  } catch (error) {
    genres = req.body.genres || ''
  }
  // checkDuplicateGenre(genres)

  if (!duration) {
    throw new BadRequestError('Duration field cannot be empty')
  }

  let queryGenres
  if (!Array.isArray(genres) || genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    queryGenres = await Genre.find({ _id: genres })

    if (queryGenres.length !== genres.length) {
      throw new BadRequestError(`Genre id is invalid or duplicate`)
    }
  }

  const data = {
    duration,
    url,
    createdBy,
    genres,
    description,
  }

  const rs = await Short.create(data)
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

  addRecomShort(jsonRs._id, { ...data, genres: queryGenres })

  res.status(StatusCodes.CREATED).json({ data: jsonRs })
}

const updateShortWithVideo = async (req, res) => {
  const id = req.params.id
  const duration = Number(req.body.duration)
  const description = req.body.description
  const url = distributionDomain + '/' + req.file.key
  const userId = req.user.userId
  let genres
  try {
    genres = JSON.parse(req.body.genres || '')
  } catch (error) {
    genres = req.body.genres || ''
  }

  // checkDuplicateGenre(genres)

  let queryGenres
  if (!Array.isArray(genres) || genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    queryGenres = await Genre.find({ _id: genres })

    if (queryGenres.length !== genres.length) {
      throw new BadRequestError(`Genre id is invalid or duplicate`)
    }
  }

  if (!duration) {
    throw new BadRequestError('Duration field cannot be empty')
  }

  const data = {
    duration,
    url,
    genres,
    description,
  }

  const rs = await Short.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })
  updateRecomShort(id, {
    ...data,
    genres: queryGenres,
  })
  res.status(StatusCodes.OK).json({ data: rs })
}

const updateShortBasic = async (req, res) => {
  const id = req.params.id
  const duration = Number(req.body.duration)
  const description = req.body.description
  const userId = req.user.userId
  let genres
  try {
    genres = JSON.parse(req.body.genres || '')
  } catch (error) {
    genres = req.body.genres || ''
  }
  if (!duration) {
    throw new BadRequestError('Duration field cannot be empty')
  }

  // checkDuplicateGenre(genres)

  let queryGenres
  if (!Array.isArray(genres) || genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    queryGenres = await Genre.find({ _id: genres })

    if (queryGenres.length !== genres.length) {
      throw new BadRequestError(`Genre id is invalid or duplicate`)
    }
  }

  const data = {
    duration,
    description,
    genres,
  }

  const rs = await Short.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })
  updateRecomShort(id, {
    ...data,
    genres: queryGenres,
  })
  res.status(StatusCodes.OK).json({ data: rs })
}

const deleteShort = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req

  const rs = await Short.findByIdAndRemove({
    _id: id,
    createdBy: userId,
  })

  if (!rs) {
    throw new NotFoundError(`No short with id ${id}`)
  }
  deleteRecom(id)
  res.status(StatusCodes.OK).json()
}

// VIEW SHORT

const checkViewed = async (shortId, userId) => {
  const rs = await Short.findOne({
    _id: shortId,
    views: userId,
  })
  if (rs) return true
  return false
}

const viewShort = async (req, res) => {
  const userId = req.user.userId
  const id = req.params.id

  if (await checkViewed(id, userId)) {
    throw new BadRequestError(`User already viewed`)
  }

  const rs = await Short.findByIdAndUpdate(
    { _id: id },
    {
      $push: {
        views: userId,
      },
    },
    { new: true, runValidators: true }
  )

  res.status(StatusCodes.OK).json({ data: rs })
}

const [upvote, disUpvote, downvote, disDownvote] = getVoteFuncs(Short)

module.exports = {
  getAllShortsOfUser,
  getShort,
  uploadShort,
  updateShortBasic,
  updateShortWithVideo,
  deleteShort,
  upvote,
  disUpvote,
  downvote,
  disDownvote,
  viewShort,
}
