const distributionDomain = process.env.AWS_DISTRIBUTION_DOMAIN

const uploadFileUser = (req, res) => {
  const url = distributionDomain + '/' + req.file.key

  res.status(200).json(url)
}

module.exports = {
  uploadFileUser
}
