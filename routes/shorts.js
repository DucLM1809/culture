const express = require('express')
const router = express.Router()

const {
  uploadShort,
  getShort,
  updateShortBasic,
  updateShortWithVideo,
  deleteShort,
  upvote,
  disUpvote,
  downvote,
  disDownvote,
  viewShort,
  getAllShortsOfUser,
  setShortViewPortion,
  getRecommends,
  scrutinize,
  search,
} = require('../controllers/short')
const { uploadFileMs3 } = require('../s3')

router.route('/upload').post(uploadShort)
router.route('/update-basic/:id').put(updateShortBasic)
router.route('/update-with-video/:id').put(updateShortWithVideo)
router.route('/delete/:id').delete(deleteShort)
router.route('/upvote/:id').post(upvote)
router.route('/disupvote/:id').post(disUpvote)
router.route('/downvote/:id').post(downvote)
router.route('/disDownvote/:id').post(disDownvote)
router.route('/view/:id').post(viewShort)
router.route('/set-view-portion/:id').post(setShortViewPortion)
router.route('/recommend').get(getRecommends)
router.route('/scrutinize/:id').post(scrutinize)
router.route('/search').get(search)
router.route('/').get(getAllShortsOfUser)
router.route('/:id').get(getShort)

module.exports = router
