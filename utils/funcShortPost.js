const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getVoteFuncs = (Model) => {
  // UPVOTE
  const checkUpvote = async (shortId, userId) => {
    const rs = await Model.findOne({
      _id: shortId,
      upvotes: userId,
    })
    if (rs) return true
    return false
  }

  const upvote = async (req, res) => {
    const userId = req.user.userId
    const id = req.params.id

    if (await checkUpvote(id, userId)) {
      throw new BadRequestError(`User already upvoted`)
    }

    const rs = await Model.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          upvotes: userId,
        },
        $pull: {
          downvotes: userId,
        },
      },
      { new: true, runValidators: true }
    )

    if (!rs) {
      throw new NotFoundError(`No item with id ${id}`)
    }

    res.status(StatusCodes.OK).json({ data: rs })
  }

  const disUpvote = async (req, res) => {
    const userId = req.user.userId
    const id = req.params.id

    if (!(await checkUpvote(id, userId))) {
      throw new BadRequestError(`User has not upvoted yet`)
    }

    const rs = await Model.findByIdAndUpdate(
      { _id: id },
      {
        $pull: {
          upvotes: userId,
        },
      },
      { new: true, runValidators: true }
    )

    if (!rs) {
      throw new NotFoundError(`No item with id ${id}`)
    }

    res.status(StatusCodes.OK).json({ data: rs })
  }

  // DOWNVOTE

  const checkDownvote = async (shortId, userId) => {
    const rs = await Model.findOne({
      _id: shortId,
      downvotes: userId,
    })
    if (rs) return true
    return false
  }

  const downvote = async (req, res) => {
    const userId = req.user.userId
    const id = req.params.id

    if (await checkDownvote(id, userId)) {
      throw new BadRequestError(`User already downvoted`)
    }

    const rs = await Model.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          downvotes: userId,
        },
        $pull: {
          upvotes: userId,
        },
      },
      { new: true, runValidators: true }
    )

    if (!rs) {
      throw new NotFoundError(`No item with id ${id}`)
    }

    res.status(StatusCodes.OK).json({ data: rs })
  }

  const disDownvote = async (req, res) => {
    const userId = req.user.userId
    const id = req.params.id

    if (!(await checkDownvote(id, userId))) {
      throw new BadRequestError(`User has not downvoted yet`)
    }

    const rs = await Model.findByIdAndUpdate(
      { _id: id },
      {
        $pull: {
          downvotes: userId,
        },
      },
      { new: true, runValidators: true }
    )

    if (!rs) {
      throw new NotFoundError(`No item with id ${id}`)
    }

    res.status(StatusCodes.OK).json({ data: rs })
  }

  return [upvote, disUpvote, downvote, disDownvote]
}

const addVoteParams = (rs, userId, hasViewParam) => {
  let jsonRs = rs.toObject()

  const userUpvoted = jsonRs.upvotes?.find((uid) => String(uid) === String(userId))
  const userDownvoted = jsonRs.downvotes?.find((uid) => String(uid) === String(userId))
  console.log('res: ', userUpvoted)
  jsonRs = {
    ...jsonRs,
    userUpvoted: !!userUpvoted,
    userDownvoted: !!userDownvoted,
  }

  if (hasViewParam) {
    const userViewed = jsonRs.views?.find((uid) => String(uid) === String(userId))
    jsonRs.userViewed = !!userViewed
  }

  return jsonRs
}

module.exports = { getVoteFuncs, addVoteParams }