const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const moment = require('moment')
const { addRecomUser } = require('../recombee')

const test = async (req, res) => {
  // console.log(req.query.date)
  // console.log(
  //   moment(req.query.date + ' 12:00', 'YYYY-MM-DD HH:mm:ss')
  //     .utc()
  //     .toDate()
  // )
}

const register = async (req, res) => {
  const data = { ...req.body }
  const birthday = moment(data.dob).format('YYYY-MM-DD')
  const today = moment()
  const age = today.diff(birthday, 'years')
  const user = await User.create({
    ...req.body,
    role: age > 40 ? 'AGED' : 'USER'
  })
  addRecomUser(user._id)
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = {
  register,
  login,
  test
}
