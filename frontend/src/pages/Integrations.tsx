import { FC, useState } from 'react'
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  PlusIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  status: 'connected' | 'available' | 'error'
  connectionCount?: number
  lastSync?: string
}

export const Integrations: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const integrations: Integration[] = [
    // Communication & Collaboration
    { id: 'slack', name: 'Slack', description: 'Team communication platform', category: 'Communication', icon: '💬', status: 'connected', connectionCount: 3, lastSync: '2 hours ago' },
    { id: 'discord', name: 'Discord', description: 'Voice and text chat platform', category: 'Communication', icon: '🎮', status: 'available' },
    { id: 'mattermost', name: 'Mattermost', description: 'Open source messaging platform', category: 'Communication', icon: '📱', status: 'available' },
    { id: 'telegram', name: 'Telegram', description: 'Messaging app', category: 'Communication', icon: '✈️', status: 'available' },
    
    // Productivity & Project Management
    { id: 'notion', name: 'Notion', description: 'All-in-one workspace', category: 'Productivity', icon: '📝', status: 'connected', connectionCount: 2, lastSync: '1 hour ago' },
    { id: 'airtable', name: 'Airtable', description: 'Database and spreadsheet platform', category: 'Productivity', icon: '🗂️', status: 'connected', connectionCount: 1, lastSync: '30 minutes ago' },
    { id: 'clickup', name: 'ClickUp', description: 'Project management platform', category: 'Productivity', icon: '✅', status: 'available' },
    { id: 'trello', name: 'Trello', description: 'Visual project management', category: 'Productivity', icon: '📋', status: 'available' },
    { id: 'todoist', name: 'Todoist', description: 'Task management app', category: 'Productivity', icon: '✔️', status: 'available' },
    
    // Google Workspace
    { id: 'gmail', name: 'Gmail', description: 'Email service', category: 'Google', icon: '📧', status: 'connected', connectionCount: 1, lastSync: '5 minutes ago' },
    { id: 'google-calendar', name: 'Google Calendar', description: 'Calendar and scheduling', category: 'Google', icon: '📅', status: 'connected', connectionCount: 1, lastSync: '1 hour ago' },
    { id: 'google-drive', name: 'Google Drive', description: 'Cloud storage', category: 'Google', icon: '💾', status: 'available' },
    { id: 'google-sheets', name: 'Google Sheets', description: 'Spreadsheet application', category: 'Google', icon: '📊', status: 'available' },
    { id: 'google-forms', name: 'Google Forms', description: 'Form builder', category: 'Google', icon: '📋', status: 'available' },
    
    // CRM & Sales
    { id: 'hubspot', name: 'HubSpot', description: 'CRM and marketing platform', category: 'CRM', icon: '🎯', status: 'connected', connectionCount: 2, lastSync: '15 minutes ago' },
    { id: 'salesforce', name: 'Salesforce', description: 'Customer relationship management', category: 'CRM', icon: '☁️', status: 'available' },
    { id: 'pipedrive', name: 'Pipedrive', description: 'Sales CRM', category: 'CRM', icon: '📈', status: 'available' },
    
    // Payment & Finance
    { id: 'stripe', name: 'Stripe', description: 'Payment processing', category: 'Finance', icon: '💳', status: 'connected', connectionCount: 1, lastSync: '2 hours ago' },
    { id: 'invoice-ninja', name: 'Invoice Ninja', description: 'Invoicing platform', category: 'Finance', icon: '📄', status: 'available' },
    
    // Marketing & Email
    { id: 'mailchimp', name: 'Mailchimp', description: 'Email marketing platform', category: 'Marketing', icon: '📮', status: 'connected', connectionCount: 1, lastSync: '3 hours ago' },
    { id: 'mailerlite', name: 'MailerLite', description: 'Email marketing service', category: 'Marketing', icon: '📧', status: 'available' },
    
    // Development
    { id: 'github', name: 'GitHub', description: 'Code repository hosting', category: 'Development', icon: '🐙', status: 'connected', connectionCount: 3, lastSync: '1 hour ago' },
    { id: 'gitlab', name: 'GitLab', description: 'DevOps platform', category: 'Development', icon: '🦊', status: 'available' },
    
    // Storage & Files
    { id: 'dropbox', name: 'Dropbox', description: 'Cloud storage', category: 'Storage', icon: '📦', status: 'available' },
    
    // AI & Processing
    { id: 'openai', name: 'OpenAI', description: 'AI and language models', category: 'AI', icon: '🤖', status: 'connected', connectionCount: 1, lastSync: '10 minutes ago' },
    { id: 'deepl', name: 'DeepL', description: 'Translation service', category: 'AI', icon: '🌐', status: 'available' },
    
    // Other
    { id: 'webhooks', name: 'Webhooks', description: 'HTTP callbacks', category: 'Other', icon: '🔗', status: 'connected', connectionCount: 5, lastSync: '5 minutes ago' },
    { id: 'http-request', name: 'HTTP Request', description: 'Make HTTP requests', category: 'Other', icon: '🌐', status: 'available' },
    { id: 'delay', name: 'Delay', description: 'Add delays to workflows', category: 'Other', icon: '⏱️', status: 'available' },
    { id: 'filter', name: 'Filter', description: 'Filter data in workflows', category: 'Other', icon: '🔍', status: 'available' },
    { id: 'formatter', name: 'Formatter', description: 'Format data', category: 'Other', icon: '📝', status: 'available' },
  ]

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <PlusIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'error':
        return 'Error'
      default:
        return 'Available'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600">Connect your favorite tools and services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Connected</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <PlusIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map(integration => (
          <div key={integration.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(integration.status)}
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className={`text-sm font-medium ${getStatusColor(integration.status)}`}>
                  {getStatusText(integration.status)}
                </span>
                {integration.connectionCount && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({integration.connectionCount} connection{integration.connectionCount !== 1 ? 's' : ''})
                  </span>
                )}
                {integration.lastSync && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last sync: {integration.lastSync}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {integration.status === 'connected' && (
                  <button className="text-gray-400 hover:text-gray-600">
                    <Cog6ToothIcon className="h-5 w-5" />
                  </button>
                )}
                <button className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  integration.status === 'connected'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}>
                  {integration.status === 'connected' ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MCP Container Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">MCP Containers</h3>
            <p className="text-sm text-gray-500">
              Model Context Protocol containers for enhanced AI capabilities
            </p>
          </div>
          <button className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add MCP Container
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500">
              <Cog6ToothIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">MCP Container Support</h4>
              <p className="text-sm text-blue-800 mt-1">
                Connect custom MCP containers to extend workflow capabilities with specialized AI tools and services.
                These containers can provide domain-specific knowledge, custom integrations, and advanced processing capabilities.
              </p>
              <div className="mt-3">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Learn more about MCP containers →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}