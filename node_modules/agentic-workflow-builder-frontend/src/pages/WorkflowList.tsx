import { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlayIcon, 
  PauseIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error'
  lastRun: string
  nextRun: string
  createdAt: string
  runCount: number
  successRate: number
}

export const WorkflowList: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Mock data - in real app this would come from API
  const workflows: Workflow[] = [
    {
      id: '1',
      name: 'Contact Form to CRM',
      description: 'Automatically adds new contact form submissions to CRM and sends welcome email',
      status: 'active',
      lastRun: '2 minutes ago',
      nextRun: 'Triggered',
      createdAt: '2024-01-15',
      runCount: 247,
      successRate: 98.8
    },
    {
      id: '2',
      name: 'Weekly Report Generation',
      description: 'Generates weekly reports from GitHub issues and posts summary to Slack',
      status: 'active',
      lastRun: '1 hour ago',
      nextRun: 'Next Monday 9:00 AM',
      createdAt: '2024-01-10',
      runCount: 12,
      successRate: 100
    },
    {
      id: '3',
      name: 'Invoice Processing',
      description: 'Processes incoming invoices and creates tasks in project management system',
      status: 'paused',
      lastRun: '1 day ago',
      nextRun: 'Paused',
      createdAt: '2024-01-08',
      runCount: 83,
      successRate: 95.2
    },
    {
      id: '4',
      name: 'Social Media Automation',
      description: 'Schedules and posts content across multiple social media platforms',
      status: 'error',
      lastRun: '3 hours ago',
      nextRun: 'Error - needs attention',
      createdAt: '2024-01-05',
      runCount: 156,
      successRate: 87.2
    },
  ]

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'status':
        return a.status.localeCompare(b.status)
      case 'lastRun':
        return new Date(a.lastRun).getTime() - new Date(b.lastRun).getTime()
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayIcon className="h-4 w-4" />
      case 'paused':
        return <PauseIcon className="h-4 w-4" />
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <PlayIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600">Manage your automation workflows</p>
        </div>
        <Link
          to="/workflows/new"
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Workflow
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">
              <PlayIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-full">
              <PauseIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paused</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Errors</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.status === 'error').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Runs</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.reduce((sum, w) => sum + w.runCount, 0)}
              </p>
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
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="lastRun">Sort by Last Run</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedWorkflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                      <div className="text-sm text-gray-500">{workflow.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1 capitalize">{workflow.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {workflow.lastRun}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {workflow.nextRun}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${workflow.successRate}%` }}
                        />
                      </div>
                      {workflow.successRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/workflows/${workflow.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button className="text-red-400 hover:text-red-600">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}