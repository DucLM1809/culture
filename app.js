require('dotenv').config()
require('express-async-errors')

// ** extra security
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const express = require('express')
const app = express()

// connectDB
const connectDB = require('./db/connect')
const authenticationUser = require('./middleware/authentication')

app.get('/', (req, res) => {
  res.send('api')
})
// routers
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')
const shortsRouter = require('./routes/shorts')
const postsRouter = require('./routes/posts')
const genresRouter = require('./routes/genres')
const userRouter = require('./routes/user')
const fileRouter = require('./routes/file')
const eventsRouter = require('./routes/events')
const questionsRouter = require('./routes/questions')

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy', 1)
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//   })
// )
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())

// Swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

// routes
app.get('/', (req, res) => {
  res.send('hello')
})
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/', fileRouter)
app.use('/api/v1/events', authenticationUser, eventsRouter)
app.use('/api/v1/jobs', authenticationUser, jobsRouter)
app.use('/api/v1/shorts', authenticationUser, shortsRouter)
app.use('/api/v1/posts', authenticationUser, postsRouter)
app.use('/api/v1/genres', authenticationUser, genresRouter)
app.use('/api/v1/user', authenticationUser, userRouter)
app.use('/api/v1/questions', authenticationUser, questionsRouter)
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

// eslint-disable-next-line no-undef
const port = process.env.PORT || 5000

const start = async () => {
  try {
    // eslint-disable-next-line no-undef
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
