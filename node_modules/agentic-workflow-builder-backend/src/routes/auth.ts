import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { authMiddleware } from '../middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company } = req.body
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required'
      })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email'
      })
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      company,
      apiKeys: {
        production: `awb_prod_${uuidv4().replace(/-/g, '')}`,
        development: `awb_dev_${uuidv4().replace(/-/g, '')}`
      }
    })
    
    await user.save()
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }
    
    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }
    
    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Error logging in user:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to login user'
    })
  }
})

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
        settings: user.settings,
        apiKeys: {
          production: user.apiKeys.production,
          development: user.apiKeys.development
        },
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    })
  }
})

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user._id
    const { firstName, lastName, company, settings } = req.body
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        company,
        settings
      },
      { new: true, runValidators: true }
    )
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
        settings: user.settings
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    })
  }
})

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user._id
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }
    
    // Update password
    user.password = newPassword
    await user.save()
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    })
  }
})

// Generate new API key
router.post('/api-key/:type', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user._id
    const { type } = req.params
    
    if (!['production', 'development'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key type'
      })
    }
    
    const newKey = `awb_${type}_${uuidv4().replace(/-/g, '')}`
    
    const user = await User.findByIdAndUpdate(
      userId,
      { [`apiKeys.${type}`]: newKey },
      { new: true }
    )
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        key: newKey,
        type
      }
    })
  } catch (error) {
    console.error('Error generating API key:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate API key'
    })
  }
})

// Refresh JWT token
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )
    
    res.json({
      success: true,
      data: { token }
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    })
  }
})

export default router