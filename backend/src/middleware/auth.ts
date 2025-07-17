import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

interface AuthenticatedRequest extends Request {
  user?: any
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({ success: false, error: 'No token provided' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const user = await User.findById(decoded.id)

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      const user = await User.findById(decoded.id)
      if (user) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continue without authentication for optional auth
    next()
  }
}