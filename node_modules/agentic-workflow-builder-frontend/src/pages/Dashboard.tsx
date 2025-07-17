import { FC } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export const Dashboard: FC = () => {
  const stats = [
    { name: 'Total Workflows', value: '12', icon: PlayIcon, color: 'text-blue-600' },
    { name: 'Active Workflows', value: '8', icon: CheckCircleIcon, color: 'text-green-600' },
    { name: 'Paused Workflows', value: '3', icon: PauseIcon, color: 'text-yellow-600' },
    { name: 'Failed Workflows', value: '1', icon: ExclamationTriangleIcon, color: 'text-red-600' },
  ]

  const recentWorkflows = [
    {
      id: 1,
      name: 'Contact Form to CRM',
      status: 'active',
      lastRun: '2 minutes ago',
      nextRun: 'Triggered',
      description: 'Automatically adds new contact form submissions to CRM'
    },
    {
      id: 2,
      name: 'Weekly Report Generation',
      status: 'active',
      lastRun: '1 hour ago',
      nextRun: 'Next Monday 9:00 AM',
      description: 'Generates weekly reports and sends to team via Slack'
    },
    {
      id: 3,
      name: 'Invoice Processing',
      status: 'paused',
      lastRun: '1 day ago',
      nextRun: 'Paused',
      description: 'Processes incoming invoices and creates tasks in project management'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-primary-100 mt-2">
              Create powerful workflows using natural language - no coding required.
            </p>
          </div>
          <Link
            to="/workflows/new"
            className="flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Workflow
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Quick Start</h3>
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mt-2">
            Get started with common workflow templates:
          </p>
          <div className="mt-4 space-y-2">
            <button className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Email to CRM</div>
              <div className="text-sm text-gray-500">Connect email to your CRM system</div>
            </button>
            <button className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Social Media Posting</div>
              <div className="text-sm text-gray-500">Schedule posts across platforms</div>
            </button>
            <button className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Data Backup</div>
              <div className="text-sm text-gray-500">Automated data backup workflows</div>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Workflows</h3>
              <Link
                to="/workflows"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Last run: {workflow.lastRun}</span>
                      <span>Next run: {workflow.nextRun}</span>
                    </div>
                  </div>
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}