
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import contentrouter from './src/routes/contentRoutes.js'
import connectdb from './src/config/database.js'
import errorHandler from './src/middlewear/errorHandler.js'
import logger from './src/utils/logger.js'

// Import Redis (but don't crash if it fails)
import './src/config/redis.js'

const app = express()
const PORT = process.env.PORT || 3000

// ─────────────────────────────────────────────────────────────────
// 1️⃣ CORS Configuration
// ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}))

// ─────────────────────────────────────────────────────────────────
// 2️⃣ Connect Database
// ─────────────────────────────────────────────────────────────────
connectdb()



app.use(express.json())
app.use(express.urlencoded({ extended: true }))


if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.path}`)
        next()
    })
}


app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ContentGuard AI Backend is running!',
        version: '1.0.0'
    })
})

app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'

        res.json({
            success: true,
            message: 'ContentGuard AI is running',
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
            },
            version: '1.0.0',
        })
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Service unhealthy',
            error: error.message,
        })
    }
})


app.use('/api', contentrouter)


app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    })
})


app.use(errorHandler)


app.listen(PORT, () => {
    logger.success(` Server running at http://localhost:${PORT}`)
    logger.info(` Health check: http://localhost:${PORT}/health`)
    logger.info(` API endpoint: http://localhost:${PORT}/api/content`)
    logger.info(` CORS enabled for: ${allowedOrigins.join(', ')}`)
})


process.on('SIGTERM', async () => {
    logger.warn('SIGTERM received, shutting down gracefully...')
    await mongoose.connection.close()
    logger.info(' MongoDB connection closed')
    process.exit(0)
})

process.on('SIGINT', async () => {
    logger.warn('SIGINT received, shutting down gracefully...')
    await mongoose.connection.close()
    logger.info(' MongoDB connection closed')
    process.exit(0)
})

process.on('unhandledRejection', (err) => {
    logger.error(' Unhandled Rejection:', err)
})

process.on('uncaughtException', (err) => {
    logger.error(' Uncaught Exception:', err)
    process.exit(1)
})