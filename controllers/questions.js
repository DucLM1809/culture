const { ObjectId } = require('express')
const Question = require('../models/Question')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getAllQuestions = async (req, res) => {
  const questions = await Question.find()

  res.status(StatusCodes.OK).json({ data: questions })
}

const getRandomQuestion = async (req, res) => {
  const randomValues = await Question.find({
    users: { $nin: [req.user.userId] }
  })

  let randomIndex = Math.floor(Math.random() * randomValues.length)

  const randomQuestion = randomValues[randomIndex]

  res.status(StatusCodes.OK).json({ data: randomQuestion })
}

const createQuestion = async (req, res) => {
  const { name, answers } = req.body

  if (answers.length < 4) {
    throw new BadRequestError(`Question must contain 4 answers`)
  }

  const question = await Question.create({
    name,
    answers
  })

  res.status(StatusCodes.OK).json({ data: question })
}

const updateQuestion = async (req, res) => {
  const { name, answers } = req.body

  if (answers.length < 4) {
    throw new BadRequestError(`Question must contain 4 answers`)
  }

  const prevDocuments = await Question.findById(req.params.id)

  await Question.findByIdAndDelete(req.params.id)

  const newDocuments = await Question.create({
    _id: req.params.id,
    name,
    answers,
    users: prevDocuments.users
  })

  res.status(StatusCodes.OK).json({ data: newDocuments })
}

const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id)

    res.status(StatusCodes.OK).json(true)
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error)
  }
}

const deleteQuestions = async (req, res) => {
  const { ids } = req.body

  try {
    await Question.deleteMany({ _id: { $in: ids } })

    res.status(StatusCodes.OK).json(true)
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error)
  }
}

const answerQuestion = async (req, res) => {
  const isUserAnswer = await Question.find({
    users: { $in: [req.user.userId] }
  })

  console.log(isUserAnswer)

  if (isUserAnswer.length) {
    throw new BadRequestError('User answered this question!')
  }

  await Question.findByIdAndUpdate(req.params.id, {
    $push: { users: req.user.userId }
  })

  const question = await Question.findById(req.params.id)
  const isAnswerTrue = question.answers.find(
    (answer) =>
      String(answer._id) === String(req.params.answerId) && answer.isTrue
  )

  if (isAnswerTrue) {
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { points: 1 }
    })
  }

  res.status(StatusCodes.OK).json(true)
}

module.exports = {
  getAllQuestions,
  getRandomQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteQuestions,
  answerQuestion
}
