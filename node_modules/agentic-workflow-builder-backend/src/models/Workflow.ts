import mongoose, { Document, Schema } from 'mongoose'

export interface IWorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay'
  service: string
  action: string
  description: string
  config: any
  position: { x: number; y: number }
  connections: string[]
}

export interface IWorkflow extends Document {
  name: string
  description: string
  originalInput: string
  status: 'active' | 'paused' | 'error' | 'draft'
  owner: mongoose.Types.ObjectId
  steps: IWorkflowStep[]
  settings: {
    timeout: number
    retries: number
    onError: 'stop' | 'continue' | 'retry'
    notifications: boolean
  }
  schedule?: {
    type: 'cron' | 'interval' | 'webhook'
    value: string
    timezone: string
  }
  execution: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastRun?: Date
    nextRun?: Date
    averageRunTime: number
  }
  createdAt: Date
  updatedAt: Date
}

const workflowStepSchema = new Schema<IWorkflowStep>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['trigger', 'action', 'condition', 'delay'],
    required: true
  },
  service: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  config: { type: Schema.Types.Mixed, default: {} },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  connections: [{ type: String }]
})

const workflowSchema = new Schema<IWorkflow>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  originalInput: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'error', 'draft'],
    default: 'draft'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  steps: [workflowStepSchema],
  settings: {
    timeout: { type: Number, default: 30 },
    retries: { type: Number, default: 3 },
    onError: {
      type: String,
      enum: ['stop', 'continue', 'retry'],
      default: 'stop'
    },
    notifications: { type: Boolean, default: true }
  },
  schedule: {
    type: {
      type: String,
      enum: ['cron', 'interval', 'webhook']
    },
    value: String,
    timezone: { type: String, default: 'UTC' }
  },
  execution: {
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    lastRun: Date,
    nextRun: Date,
    averageRunTime: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

// Add indexes for performance
workflowSchema.index({ owner: 1, status: 1 })
workflowSchema.index({ 'schedule.nextRun': 1 })
workflowSchema.index({ createdAt: -1 })

export const Workflow = mongoose.model<IWorkflow>('Workflow', workflowSchema)