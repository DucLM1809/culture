const express = require('express')
const router = express.Router()

const { getUser, updateUser } = require('../controllers/user')

router.route('/me').get(getUser).put(updateUser)

module.exports = router
