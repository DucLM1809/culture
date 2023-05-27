const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide title']
  },
  description: {
    type: String
  },
  address: {
    type: String,
    required: [true, 'Please provide address']
  },
  lat: {
    type: Number,
    required: [true, 'Please provide latitude']
  },
  long: {
    type: Number,
    required: [true, 'Please provide longtitude']
  },
  image: {
    type: String
  }
})

module.exports = mongoose.model('Event', EventSchema)
