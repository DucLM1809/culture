const Genre = require('../models/Genre')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const validateGenre = async (name) => {
  if (
    await Genre.findOne({
      name,
    })
  ) {
    throw new BadRequestError('Already exist this genre')
  }
}

const getAllGenres = async (req, res) => {
  const requestUser = req.user.userId

  const rs = await Genre.find()
  if (!rs) {
    throw new NotFoundError(`No genres exist`)
  }

  res.status(StatusCodes.OK).json({ data: rs })
}

const getGenre = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req
  const rs = await Genre.findOne({
    _id: id,
  })

  if (!rs) {
    throw new NotFoundError(`No genre with id ${id}`)
  }
  res.status(StatusCodes.OK).json({
    data: rs,
  })
}

// TODO: ADD ROLE VALIDATION
const createGenre = async (req, res) => {
  const { name, other } = req.body

  const data = {
    name,
    other,
  }

  await validateGenre(name)

  const rs = await Genre.create(data)

  res.status(StatusCodes.CREATED).json({ data: rs })
}

// TODO: ADD ROLE VALIDATION
const updateGenre = async (req, res) => {
  const id = req.params.id
  const { name, other } = req.body
  const data = {
    name,
    other,
  }
  await validateGenre(name)

  const rs = await Genre.findByIdAndUpdate({ _id: id }, data, { new: true, runValidators: true })
  if (!rs) {
    throw new NotFoundError(`No genre with id ${id}`)
  }

  res.status(StatusCodes.OK).json({ data: rs })
}

// TODO: ADD ROLE VALIDATION
const deleteGenre = async (req, res) => {
  const {
    user: { userId },
    params: { id },
  } = req

  await Genre.findByIdAndRemove({
    _id: id,
  })

  res.status(StatusCodes.OK).json()
}

module.exports = { getAllGenres, getGenre, createGenre, updateGenre, deleteGenre }
