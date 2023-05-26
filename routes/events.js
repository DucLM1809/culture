const express = require('express')
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  deleteEvents
} = require('../controllers/events')
const router = express.Router()

router.route('').get(getAllEvents).post(createEvent).delete(deleteEvents)

router.route('/:id').get(getEventById).put(updateEvent).delete(deleteEvent)

module.exports = router
