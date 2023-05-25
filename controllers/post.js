const Post = require('../models/Post')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const getVoteFuncs = require('../utils/funcShortPost')

// eslint-disable-next-line no-undef
const distributionDomain = process.env.AWS_DISTRIBUTION_DOMAIN

const getPost = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req
  const rs = await Post.findOne({
    _id: id,
  })
  if (!rs) {
    throw new NotFoundError(`No post with id ${id}`)
  }
  res.status(StatusCodes.OK).json({ data: rs })
}

const getType = (mime) => {
  if (!mime) return
  if (mime.includes('image')) return 'image'
  if (mime.includes('video')) return 'video'
  return null
}

const getMedias = (files) => {
  return files.map((item) => ({
    url: distributionDomain + '/' + item.key,
    type: getType(item.mimetype),
  }))
}

const uploadPost = async (req, res) => {
  const { description, content } = req.body
  const medias = getMedias(req.files)
  console.log(medias)
  const createdBy = req.user.userId

  if (!content) {
    throw new BadRequestError('Content field cannot be empty')
  }

  const rs = await Post.create({
    content,
    medias,
    createdBy,
    description,
  })

  res.status(StatusCodes.CREATED).json({ data: rs })
}

const updatePostWithMedias = async (req, res) => {
  const id = req.params.id
  const { description, content } = req.body
  const medias = getMedias(req.files)
  const userId = req.user.userId

  if (!content) {
    throw new BadRequestError('Content field cannot be empty')
  }

  const data = {
    content,
    medias,
    description,
  }

  const rs = await Post.findByIdAndUpdate({ _id: id, createdBy: userId }, data, { new: true, runValidators: true })

  res.status(StatusCodes.OK).json({ data: rs })
}

const updatePostBasic = async (req, res) => {
  const id = req.params.id
  const { description, content } = req.body
  const userId = req.user.userId

  if (!content) {
    throw new BadRequestError('Content field cannot be empty')
  }

  const data = {
    content,
    description,
  }

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

const [upvote, disUpvote, downvote, disDownvote] = getVoteFuncs(Post)

module.exports = {
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
