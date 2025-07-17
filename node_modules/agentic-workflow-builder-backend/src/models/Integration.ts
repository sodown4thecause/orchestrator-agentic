import mongoose, { Document, Schema } from 'mongoose'

export interface IIntegration extends Document {
  name: string
  service: string
  category: string
  icon: string
  description: string
  owner: mongoose.Types.ObjectId
  status: 'connected' | 'error' | 'disconnected'
  credentials: {
    type: string // 'oauth', 'api_key', 'basic_auth', 'custom'
    data: any // encrypted credentials
  }
  config: any
  lastSync?: Date
  syncStatus?: 'success' | 'error' | 'in_progress'
  syncError?: string
  usageStats: {
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    lastCall?: Date
    rateLimitReset?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const integrationSchema = new Schema<IIntegration>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  service: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['connected', 'error', 'disconnected'],
    default: 'disconnected'
  },
  credentials: {
    type: {
      type: String,
      enum: ['oauth', 'api_key', 'basic_auth', 'custom'],
      required: true
    },
    data: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  config: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastSync: Date,
  syncStatus: {
    type: String,
    enum: ['success', 'error', 'in_progress']
  },
  syncError: String,
  usageStats: {
    totalCalls: { type: Number, default: 0 },
    successfulCalls: { type: Number, default: 0 },
    failedCalls: { type: Number, default: 0 },
    lastCall: Date,
    rateLimitReset: Date
  }
}, {
  timestamps: true
})

// Add indexes for performance
integrationSchema.index({ owner: 1, service: 1 })
integrationSchema.index({ status: 1 })
integrationSchema.index({ createdAt: -1 })

export const Integration = mongoose.model<IIntegration>('Integration', integrationSchema)