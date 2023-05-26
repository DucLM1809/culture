const Event = require('../models/Event')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError } = require('../errors')

const getAllEvents = async (req, res) => {
  const events = await Event.find()

  res.status(StatusCodes.OK).json({ data: events })
}

const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id)

  if (!event) {
    throw new NotFoundError(`No event found of id ${req.params.id}`)
  }

  res.status(StatusCodes.OK).json({ data: event })
}

const createEvent = async (req, res) => {
  const event = await Event.create({ ...req.body })
  res.status(StatusCodes.OK).json({ data: event })
}

const updateEvent = async (req, res) => {
  const { id } = req.params

  await Event.findByIdAndUpdate(id, {
    ...req.body
  })

  const event = await Event.findById(id)

  res.status(StatusCodes.OK).json({ data: event })
}

const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id)

    res.status(StatusCodes.OK).json(true)
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error)
  }
}

const deleteEvents = async (req, res) => {
  const { ids } = req.body

  try {
    await Event.deleteMany({ _id: { $in: ids } })

    res.status(StatusCodes.OK).json(true)
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error)
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  deleteEvents
}
