import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
  role: 'admin' | 'user'
  isActive: boolean
  settings: {
    notifications: {
      workflowSuccess: boolean
      workflowError: boolean
      weeklyReport: boolean
      securityAlerts: boolean
    }
    timezone: string
    defaultTimeout: number
    retryAttempts: number
    debugLogging: boolean
  }
  apiKeys: {
    production: string
    development: string
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    notifications: {
      workflowSuccess: { type: Boolean, default: true },
      workflowError: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true }
    },
    timezone: { type: String, default: 'UTC' },
    defaultTimeout: { type: Number, default: 30 },
    retryAttempts: { type: Number, default: 3 },
    debugLogging: { type: Boolean, default: false }
  },
  apiKeys: {
    production: { type: String, default: '' },
    development: { type: String, default: '' }
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)