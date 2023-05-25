const Short = require('../models/Short')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { getVideoDurationInSeconds } = require('get-video-duration')

// eslint-disable-next-line no-undef
const distributionDomain = process.env.AWS_DISTRIBUTION_DOMAIN

const getShort = async (req, res) => {
  const key = req.params.key
  res.send(key)
}

const uploadShort = async (req, res) => {
  console.log(req.file)
  const duration = getVideoDurationInSeconds(req.file.buffer)
  console.log(duration)

  res.status(201).json({
    message: 'Uploaded!',
    url: distributionDomain + '/' + req.file.key,
    duration,
  })
}

module.exports = {
  getShort,
  uploadShort,
}
