const Short = require('../models/Short')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { getVoteFuncs, addVoteParams } = require('../utils/funcShortPost')

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

  const rs = await Short.create({
    duration,
    url,
    createdBy,
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

  if (!duration) {
    throw new BadRequestError('Duration field cannot be empty')
  }

  const data = {
    duration,
    url,
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

  const data = {
    duration,
    description,
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
