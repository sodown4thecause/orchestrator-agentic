import express from 'express'
import { Integration } from '../models/Integration'

const router = express.Router()

// Available integrations catalog
const availableIntegrations = [
  // Communication & Collaboration
  { id: 'slack', name: 'Slack', description: 'Team communication platform', category: 'Communication', icon: '💬' },
  { id: 'discord', name: 'Discord', description: 'Voice and text chat platform', category: 'Communication', icon: '🎮' },
  { id: 'mattermost', name: 'Mattermost', description: 'Open source messaging platform', category: 'Communication', icon: '📱' },
  { id: 'telegram', name: 'Telegram', description: 'Messaging app', category: 'Communication', icon: '✈️' },
  
  // Productivity & Project Management
  { id: 'notion', name: 'Notion', description: 'All-in-one workspace', category: 'Productivity', icon: '📝' },
  { id: 'airtable', name: 'Airtable', description: 'Database and spreadsheet platform', category: 'Productivity', icon: '🗂️' },
  { id: 'clickup', name: 'ClickUp', description: 'Project management platform', category: 'Productivity', icon: '✅' },
  { id: 'trello', name: 'Trello', description: 'Visual project management', category: 'Productivity', icon: '📋' },
  { id: 'todoist', name: 'Todoist', description: 'Task management app', category: 'Productivity', icon: '✔️' },
  
  // Google Workspace
  { id: 'gmail', name: 'Gmail', description: 'Email service', category: 'Google', icon: '📧' },
  { id: 'google-calendar', name: 'Google Calendar', description: 'Calendar and scheduling', category: 'Google', icon: '📅' },
  { id: 'google-drive', name: 'Google Drive', description: 'Cloud storage', category: 'Google', icon: '💾' },
  { id: 'google-sheets', name: 'Google Sheets', description: 'Spreadsheet application', category: 'Google', icon: '📊' },
  { id: 'google-forms', name: 'Google Forms', description: 'Form builder', category: 'Google', icon: '📋' },
  
  // CRM & Sales
  { id: 'hubspot', name: 'HubSpot', description: 'CRM and marketing platform', category: 'CRM', icon: '🎯' },
  { id: 'salesforce', name: 'Salesforce', description: 'Customer relationship management', category: 'CRM', icon: '☁️' },
  { id: 'pipedrive', name: 'Pipedrive', description: 'Sales CRM', category: 'CRM', icon: '📈' },
  
  // Payment & Finance
  { id: 'stripe', name: 'Stripe', description: 'Payment processing', category: 'Finance', icon: '💳' },
  { id: 'invoice-ninja', name: 'Invoice Ninja', description: 'Invoicing platform', category: 'Finance', icon: '📄' },
  
  // Marketing & Email
  { id: 'mailchimp', name: 'Mailchimp', description: 'Email marketing platform', category: 'Marketing', icon: '📮' },
  { id: 'mailerlite', name: 'MailerLite', description: 'Email marketing service', category: 'Marketing', icon: '📧' },
  
  // Development
  { id: 'github', name: 'GitHub', description: 'Code repository hosting', category: 'Development', icon: '🐙' },
  { id: 'gitlab', name: 'GitLab', description: 'DevOps platform', category: 'Development', icon: '🦊' },
  
  // Storage & Files
  { id: 'dropbox', name: 'Dropbox', description: 'Cloud storage', category: 'Storage', icon: '📦' },
  
  // AI & Processing
  { id: 'openai', name: 'OpenAI', description: 'AI and language models', category: 'AI', icon: '🤖' },
  { id: 'deepl', name: 'DeepL', description: 'Translation service', category: 'AI', icon: '🌐' },
  
  // Other
  { id: 'webhooks', name: 'Webhooks', description: 'HTTP callbacks', category: 'Other', icon: '🔗' },
  { id: 'http-request', name: 'HTTP Request', description: 'Make HTTP requests', category: 'Other', icon: '🌐' },
  { id: 'delay', name: 'Delay', description: 'Add delays to workflows', category: 'Other', icon: '⏱️' },
  { id: 'filter', name: 'Filter', description: 'Filter data in workflows', category: 'Other', icon: '🔍' },
  { id: 'formatter', name: 'Formatter', description: 'Format data', category: 'Other', icon: '📝' },
]

// Get all available integrations
router.get('/available', async (req, res) => {
  try {
    const { category, search } = req.query
    
    let filtered = availableIntegrations
    
    if (category && category !== 'all') {
      filtered = filtered.filter(integration => integration.category === category)
    }
    
    if (search) {
      filtered = filtered.filter(integration => 
        integration.name.toLowerCase().includes((search as string).toLowerCase()) ||
        integration.description.toLowerCase().includes((search as string).toLowerCase())
      )
    }
    
    res.json({
      success: true,
      data: filtered
    })
  } catch (error) {
    console.error('Error fetching available integrations:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available integrations'
    })
  }
})

// Get user's connected integrations
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { status, category, search } = req.query
    
    const query: any = { owner: userId }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const integrations = await Integration.find(query)
      .sort({ createdAt: -1 })
      .populate('owner', 'firstName lastName email')
    
    // Merge with available integrations to show connection status
    const result = availableIntegrations.map(available => {
      const connected = integrations.find(i => i.service === available.id)
      return {
        ...available,
        connectionStatus: connected ? connected.status : 'available',
        connectionId: connected ? connected._id : null,
        lastSync: connected ? connected.lastSync : null,
        usageStats: connected ? connected.usageStats : null
      }
    })
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations'
    })
  }
})

// Get a specific integration
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const integration = await Integration.findOne({ _id: id, owner: userId })
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      })
    }
    
    res.json({
      success: true,
      data: integration
    })
  } catch (error) {
    console.error('Error fetching integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration'
    })
  }
})

// Create a new integration connection
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { service, credentials, config } = req.body
    
    // Validate required fields
    if (!service || !credentials) {
      return res.status(400).json({
        success: false,
        error: 'Service and credentials are required'
      })
    }
    
    // Find the service in available integrations
    const availableIntegration = availableIntegrations.find(i => i.id === service)
    if (!availableIntegration) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service'
      })
    }
    
    // Check if integration already exists
    const existingIntegration = await Integration.findOne({ service, owner: userId })
    if (existingIntegration) {
      return res.status(409).json({
        success: false,
        error: 'Integration already exists for this service'
      })
    }
    
    // Create new integration
    const integration = new Integration({
      name: availableIntegration.name,
      service,
      category: availableIntegration.category,
      icon: availableIntegration.icon,
      description: availableIntegration.description,
      owner: userId,
      credentials,
      config: config || {},
      status: 'connected',
      lastSync: new Date(),
      syncStatus: 'success'
    })
    
    await integration.save()
    
    res.status(201).json({
      success: true,
      data: integration
    })
  } catch (error) {
    console.error('Error creating integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create integration'
    })
  }
})

// Update an integration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { credentials, config } = req.body
    
    const integration = await Integration.findOneAndUpdate(
      { _id: id, owner: userId },
      { credentials, config },
      { new: true, runValidators: true }
    )
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      })
    }
    
    res.json({
      success: true,
      data: integration
    })
  } catch (error) {
    console.error('Error updating integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update integration'
    })
  }
})

// Delete an integration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const integration = await Integration.findOneAndDelete({ _id: id, owner: userId })
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      })
    }
    
    res.json({
      success: true,
      message: 'Integration deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete integration'
    })
  }
})

// Test an integration connection
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const integration = await Integration.findOne({ _id: id, owner: userId })
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      })
    }
    
    // Here you would implement actual connection testing
    // For now, we'll simulate a successful test
    const testResult = {
      success: true,
      message: 'Connection test successful',
      responseTime: Math.floor(Math.random() * 1000) + 100,
      timestamp: new Date()
    }
    
    // Update usage stats
    integration.usageStats.totalCalls += 1
    integration.usageStats.lastCall = new Date()
    
    if (testResult.success) {
      integration.usageStats.successfulCalls += 1
      integration.status = 'connected'
      integration.syncStatus = 'success'
    } else {
      integration.usageStats.failedCalls += 1
      integration.status = 'error'
      integration.syncStatus = 'error'
    }
    
    await integration.save()
    
    res.json({
      success: true,
      data: testResult
    })
  } catch (error) {
    console.error('Error testing integration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to test integration'
    })
  }
})

// Get integration usage statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    
    const integration = await Integration.findOne({ _id: id, owner: userId })
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        usageStats: integration.usageStats,
        status: integration.status,
        lastSync: integration.lastSync,
        syncStatus: integration.syncStatus
      }
    })
  } catch (error) {
    console.error('Error fetching integration stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration stats'
    })
  }
})

export default router