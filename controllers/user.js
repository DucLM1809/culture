const User = require('../models/User')

const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getUser = async (req, res) => {
  const user = await User.findById(req.user.userId)

  const { _id, role, name, email, avatar } = user

  res.status(StatusCodes.OK).json({
    data: {
      _id,
      role,
      name,
      email,
      avatar
    }
  })
}

const updateUser = async (req, res) => {
  await User.findByIdAndUpdate(req.user.userId, {
    avatar: req.body.avatar
  })

  const user = await User.findById(req.user.userId)

  const { _id, role, name, email, avatar } = user

  res.status(StatusCodes.OK).json({
    data: {
      _id,
      role,
      name,
      email,
      avatar
    }
  })
}

module.exports = { getUser, updateUser }
