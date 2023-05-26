const express = require('express')
const { uploadFileMs3 } = require('../s3')
const { uploadFileUser } = require('../controllers/file')
const router = express.Router()

router.route('/file').post(uploadFileMs3.single('file'), uploadFileUser)

module.exports = router
