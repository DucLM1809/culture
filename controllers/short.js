const Short = require('../models/Short')
const Genre = require('../models/Genre')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { getVoteFuncs, addVoteParams, checkDuplicateGenre } = require('../utils/funcShortPost')

// eslint-disable-next-line no-undef
const distributionDomain = process.env.AWS_DISTRIBUTION_DOMAIN

const getAllShortsOfUser = async (req, res) => {
  const userId = req.query.userId
  const requestUser = req.user.userId
  const rs = await Short.find({
    createdBy: userId,
  })
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
  const rs = await Short.findOne({
    _id: id,
  })
  if (!rs) {
    throw new NotFoundError(`No short with id ${id}`)
  }
  res.status(StatusCodes.OK).json({ data: addVoteParams(rs, userId, true) })
}

const uploadShort = async (req, res) => {
  const duration = Number(req.body.duration)
  const description = req.body.description
  const url = distributionDomain + '/' + req.file.key
  const createdBy = req.user.userId
  const genres = JSON.parse(req.body.genres || '')

  checkDuplicateGenre(genres)

  if (!duration) {
    throw new BadRequestError('Duration field cannot be empty')
  }

  if (!Array.isArray(genres) || genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    genres.forEach(async (genreId) => {
      const r = await Genre.findOne({
        _id: genreId,
      })
      if (!r) {
        throw new BadRequestError(`Genre id is invalid ${genreId}`)
      }
    })
  }
  const rs = await Short.create({
    duration,
    url,
    createdBy,
    genres,
    description,
  })

  res.status(StatusCodes.CREATED).json({ data: rs })
}

const updateShortWithVideo = async (req, res) => {
  const id = req.params.id
  const duration = Number(req.body.duration)
  const description = req.body.description
  const url = distributionDomain + '/' + req.file.key
  const userId = req.user.userId
  const genres = JSON.parse(req.body.genres || '')

  checkDuplicateGenre(genres)

  if (!Array.isArray(genres) || genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    genres.forEach(async (genreId) => {
      const r = await Genre.findOne({
        _id: genreId,
      })
      if (!r) {
        throw new BadRequestError(`Genre id is invalid ${genreId}`)
      }
    })
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

  res.status(StatusCodes.OK).json({ data: rs })
}

const updateShortBasic = async (req, res) => {
  const id = req.params.id
  const duration = Number(req.body.duration)
  const description = req.body.description
  const userId = req.user.userId
  if (!duration) {
    throw new BadRequestError('Duration field cannot be empty')
  }

  checkDuplicateGenre(genres)

  const genres = JSON.parse(req.body.genres || '')

  if (!Array.isArray(genres) || genres.length == 0) {
    throw new BadRequestError('Specify at least 1 genre')
  } else {
    genres.forEach(async (genreId) => {
      const r = await Genre.findOne({
        _id: genreId,
      })
      if (!r) {
        throw new BadRequestError(`Genre id is invalid ${genreId}`)
      }
    })
  }

  const data = {
    duration,
    description,
    genres,
  }

  const rs = await Short.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })
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
