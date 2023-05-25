const aws = require('aws-sdk')
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const multer = require('multer')
const multerS3 = require('multer-s3')

// eslint-disable-next-line no-undef
const bucketName = process.env.AWS_BUCKET_NAME
// eslint-disable-next-line no-undef
const region = process.envAWS_BUCKET_REGION
// eslint-disable-next-line no-undef
const accessKeyId = process.env.AWS_ACCESS_KEY
// eslint-disable-next-line no-undef
const secretAccessKey = process.env.AWS_SECRET_KEY

aws.config.update({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

const s3 = new aws.S3()

const uploadFileMs3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    },
  }),
})

const uploadFile = async (file) => {
  const fileStream = fs.createReadStream(file.path)

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename + new Date().toJSON().replace('.', ''),
  }

  const res = await s3.upload(uploadParams).promise()
  await unlinkFile(file.path)
  return res
}

module.exports = {
  uploadFile,
  uploadFileMs3,
}
