const User = require('../models/User')

const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getUser = async (req, res) => {
  const user = await User.findById(req.user.userId)

  const { _id, role, name, email, avatar, points, dob } = user

  res.status(StatusCodes.OK).json({
    data: {
      _id,
      role,
      name,
      email,
      avatar,
      points,
      dob
    }
  })
}

const updateUser = async (req, res) => {
  const { avatarUrl, dob } = req.body
  let user = await User.findById(req.user.userId)
  await User.findByIdAndUpdate(req.user.userId, {
    ...(avatarUrl && { avatar: avatarUrl }),
    ...(dob && { dob: dob })
  })

  // const user = await User.findById(req.user.userId)

  const { _id, role, name, email, avatar, points } = user

  res.status(StatusCodes.OK).json({
    data: {
      _id,
      role,
      name,
      email,
      avatar,
      points,
      dob
    }
  })
}

module.exports = { getUser, updateUser }
