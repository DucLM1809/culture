const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide title']
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
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
    type: String,
    required: [true, 'Please provide image']
  }
})

module.exports = mongoose.model('Event', EventSchema)
