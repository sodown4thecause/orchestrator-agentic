import { Request, Response, NextFunction } from 'express'
import winston from 'winston'

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    winston.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent') || '',
      ip: req.ip || req.connection.remoteAddress
    })
  })
  
  next()
}