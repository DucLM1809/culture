const express = require('express')
const router = express.Router()

const { uploadShort, getShort } = require('../controllers/short')
const { uploadFileMs3 } = require('../s3')

router.route('/upload').post(uploadFileMs3.single('short'), uploadShort)
router.route('/:key').get(getShort)

module.exports = router
