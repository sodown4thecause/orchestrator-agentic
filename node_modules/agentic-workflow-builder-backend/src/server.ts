import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import winston from 'winston'

// Route imports
import workflowRoutes from './routes/workflows'
import integrationRoutes from './routes/integrations'
import authRoutes from './routes/auth'
import mcpRoutes from './routes/mcp'
import aiRoutes from './routes/ai'

// Middleware imports
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { loggerMiddleware } from './middleware/logger'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(loggerMiddleware)

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agentic-workflow-builder'
    await mongoose.connect(mongoUri)
    logger.info('MongoDB connected successfully')
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id)
  
  socket.on('join-workflow', (workflowId) => {
    socket.join(`workflow-${workflowId}`)
    logger.info(`Client ${socket.id} joined workflow ${workflowId}`)
  })
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id)
  })
})

// Make io available to routes
app.set('io', io)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/workflows', authMiddleware, workflowRoutes)
app.use('/api/integrations', authMiddleware, integrationRoutes)
app.use('/api/mcp', authMiddleware, mcpRoutes)
app.use('/api/ai', authMiddleware, aiRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 8000

const startServer = async () => {
  try {
    await connectDB()
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app