const checkDownvote = async (shortId, userId) => {
  const rs = await Short.findOne({
    _id: shortId,
    upvotes: userId,
  })
  if (rs) return true
  return false
}

const downvoteShort = async (req, res) => {
  const userId = req.user.userId
  const id = req.params.id

  if (await checkDownvote(id, userId)) {
    throw new BadRequestError(`User already upvoted`)
  }

  const rs = await Short.findByIdAndUpdate(
    { _id: id, createdBy: userId },
    {
      $push: {
        upvotes: userId,
      },
    },
    { new: true, runValidators: true }
  )

  res.status(StatusCodes.OK).json({ data: rs })
}

const disDownvoteShort = async (req, res) => {
  const userId = req.user.userId
  const id = req.params.id

  if (!(await checkDownvote(id, userId))) {
    throw new BadRequestError(`User has not upvoted yet`)
  }

  const rs = await Short.findByIdAndUpdate(
    { _id: id, createdBy: userId },
    {
      $pull: {
        upvotes: userId,
      },
    },
    { new: true, runValidators: true }
  )

  res.status(StatusCodes.OK).json({ data: rs })
}
