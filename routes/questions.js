const express = require('express')
const {
  getAllQuestions,
  createQuestion,
  getRandomQuestion,
  answerQuestion,
  deleteQuestion,
  deleteQuestions,
  updateQuestion
} = require('../controllers/questions')

const router = express.Router()

router
  .route('')
  .get(getAllQuestions)
  .post(createQuestion)
  .delete(deleteQuestions)
router.route('/random').get(getRandomQuestion)
router.route('/:id').delete(deleteQuestion).put(updateQuestion)
router.route('/:id/answer/:answerId').put(answerQuestion)

module.exports = router
