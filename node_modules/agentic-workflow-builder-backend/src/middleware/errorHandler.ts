import { Request, Response, NextFunction } from 'express'
import winston from 'winston'

interface CustomError extends Error {
  status?: number
  statusCode?: number
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err }
  error.message = err.message

  // Log error
  winston.error(err.message, err)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = { name: 'CastError', message, status: 404 }
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered'
    error = { name: 'DuplicateError', message, status: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ')
    error = { name: 'ValidationError', message, status: 400 }
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = { name: 'JsonWebTokenError', message, status: 401 }
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = { name: 'TokenExpiredError', message, status: 401 }
  }

  res.status(error.statusCode || error.status || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}