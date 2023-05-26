const express = require('express')
const router = express.Router()

const { createGenre, deleteGenre, getAllGenres, getGenre, updateGenre } = require('../controllers/genre')

router.route('/create').post(createGenre)
router.route('/update/:id').put(updateGenre)
router.route('/delete/:id').delete(deleteGenre)
router.route('/').get(getAllGenres)
router.route('/:id').get(getGenre)

module.exports = router
