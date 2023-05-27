const express = require('express')
const router = express.Router()

const {
  updatePostBasic,
  updatePostWithMedias,
  deletePost,
  getPost,
  uploadPost,
  upvote,
  disUpvote,
  downvote,
  disDownvote,
  getAllPostsOfUser,
  getRecommends,
  scrutinize,
  search,
} = require('../controllers/post')
const { uploadFileMs3 } = require('../s3')

router.route('/upload').post(uploadFileMs3.array('medias', 4), uploadPost)
router.route('/update-basic/:id').put(updatePostBasic)
router.route('/update-with-medias/:id').put(uploadFileMs3.array('medias', 4), updatePostWithMedias)
router.route('/delete/:id').delete(deletePost)
router.route('/upvote/:id').post(upvote)
router.route('/disupvote/:id').post(disUpvote)
router.route('/downvote/:id').post(downvote)
router.route('/disDownvote/:id').post(disDownvote)
router.route('/recommend').get(getRecommends)
router.route('/scrutinize/:id').post(scrutinize)
router.route('/search').get(search)
router.route('/').get(getAllPostsOfUser)
router.route('/:id').get(getPost)

module.exports = router
