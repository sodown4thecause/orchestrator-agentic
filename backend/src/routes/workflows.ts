import express from 'express'
import { Workflow } from '../models/Workflow'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Get all workflows for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query
    const userId = (req as any).user.id
    
    const query: any = { owner: userId }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const workflows = await Workflow.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('owner', 'firstName lastName email')
    
    const total = await Workflow.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        workflows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflows'
    })
  }
})

// Get a specific workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const workflow = await Workflow.findOne({ _id: id, owner: userId })
      .populate('owner', 'firstName lastName email')
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      })
    }
    
    res.json({
      success: true,
      data: workflow
    })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow'
    })
  }
})

// Create a new workflow
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { name, description, originalInput, steps, settings, schedule } = req.body
    
    // Validate required fields
    if (!name || !description || !steps || !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and steps are required'
      })
    }
    
    // Ensure each step has an ID
    const processedSteps = steps.map(step => ({
      ...step,
      id: step.id || uuidv4()
    }))
    
    const workflow = new Workflow({
      name,
      description,
      originalInput: originalInput || '',
      owner: userId,
      steps: processedSteps,
      settings: settings || {},
      schedule: schedule || undefined,
      status: 'draft'
    })
    
    await workflow.save()
    
    // Emit real-time update
    const io = (req as any).app.get('io')
    io.emit('workflow-created', { workflow })
    
    res.status(201).json({
      success: true,
      data: workflow
    })
  } catch (error) {
    console.error('Error creating workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create workflow'
    })
  }
})

// Update a workflow
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const updates = req.body
    
    const workflow = await Workflow.findOneAndUpdate(
      { _id: id, owner: userId },
      updates,
      { new: true, runValidators: true }
    )
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      })
    }
    
    // Emit real-time update
    const io = (req as any).app.get('io')
    io.emit('workflow-updated', { workflow })
    
    res.json({
      success: true,
      data: workflow
    })
  } catch (error) {
    console.error('Error updating workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update workflow'
    })
  }
})

// Delete a workflow
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const workflow = await Workflow.findOneAndDelete({ _id: id, owner: userId })
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      })
    }
    
    // Emit real-time update
    const io = (req as any).app.get('io')
    io.emit('workflow-deleted', { workflowId: id })
    
    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete workflow'
    })
  }
})

// Start/activate a workflow
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const workflow = await Workflow.findOneAndUpdate(
      { _id: id, owner: userId },
      { status: 'active' },
      { new: true }
    )
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      })
    }
    
    // Emit real-time update
    const io = (req as any).app.get('io')
    io.emit('workflow-started', { workflow })
    
    res.json({
      success: true,
      data: workflow,
      message: 'Workflow started successfully'
    })
  } catch (error) {
    console.error('Error starting workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start workflow'
    })
  }
})

// Pause a workflow
router.post('/:id/pause', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const workflow = await Workflow.findOneAndUpdate(
      { _id: id, owner: userId },
      { status: 'paused' },
      { new: true }
    )
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      })
    }
    
    // Emit real-time update
    const io = (req as any).app.get('io')
    io.emit('workflow-paused', { workflow })
    
    res.json({
      success: true,
      data: workflow,
      message: 'Workflow paused successfully'
    })
  } catch (error) {
    console.error('Error pausing workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to pause workflow'
    })
  }
})

// Execute a workflow manually
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { inputData } = req.body
    
    const workflow = await Workflow.findOne({ _id: id, owner: userId })
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      })
    }
    
    // Here you would integrate with your workflow execution engine
    // For now, we'll simulate execution
    const executionId = uuidv4()
    
    // Update execution stats
    workflow.execution.totalRuns += 1
    workflow.execution.lastRun = new Date()
    await workflow.save()
    
    // Emit real-time update
    const io = (req as any).app.get('io')
    io.emit('workflow-execution-started', { 
      workflowId: id,
      executionId,
      inputData
    })
    
    res.json({
      success: true,
      data: {
        executionId,
        status: 'running',
        startedAt: new Date()
      },
      message: 'Workflow execution started'
    })
  } catch (error) {
    console.error('Error executing workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow'
    })
  }
})

// Get workflow execution history
router.get('/:id/executions', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { page = 1, limit = 10 } = req.query
    
    const workflow = await Workflow.findOne({ _id: id, owner: userId })
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      })
    }
    
    // In a real implementation, you would fetch from an executions collection
    // For now, we'll return mock data
    const executions = [
      {
        id: uuidv4(),
        status: 'completed',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3500000),
        duration: 60000,
        stepsCompleted: workflow.steps.length,
        stepsTotal: workflow.steps.length,
        error: null
      },
      {
        id: uuidv4(),
        status: 'failed',
        startedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 7100000),
        duration: 100000,
        stepsCompleted: 2,
        stepsTotal: workflow.steps.length,
        error: 'Connection timeout'
      }
    ]
    
    res.json({
      success: true,
      data: {
        executions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: executions.length,
          pages: 1
        }
      }
    })
  } catch (error) {
    console.error('Error fetching workflow executions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow executions'
    })
  }
})

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const userId = (req as any).user.id
    
    const stats = await Workflow.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
    
    const totalRuns = await Workflow.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalRuns: { $sum: '$execution.totalRuns' },
          successfulRuns: { $sum: '$execution.successfulRuns' },
          failedRuns: { $sum: '$execution.failedRuns' }
        }
      }
    ])
    
    const result = {
      workflows: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {} as any),
      executions: totalRuns[0] || { totalRuns: 0, successfulRuns: 0, failedRuns: 0 }
    }
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    })
  }
})

export default router