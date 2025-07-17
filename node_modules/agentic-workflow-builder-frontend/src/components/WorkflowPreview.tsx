import { FC } from 'react'
import { 
  PencilIcon, 
  Cog6ToothIcon, 
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'condition'
  service: string
  action: string
  description: string
  icon?: string
  config?: any
}

interface WorkflowPreviewProps {
  workflow: {
    id?: string
    name: string
    description: string
    steps: WorkflowStep[]
    originalInput: string
  }
  onEdit: () => void
  onConfigure: () => void
}

export const WorkflowPreview: FC<WorkflowPreviewProps> = ({
  workflow,
  onEdit,
  onConfigure
}) => {
  const getStepIcon = (service: string) => {
    const icons: { [key: string]: string } = {
      'gmail': '📧',
      'slack': '💬',
      'hubspot': '🎯',
      'stripe': '💳',
      'mailchimp': '📮',
      'clickup': '✅',
      'github': '🐙',
      'notion': '📝',
      'calendar': '📅',
      'webhook': '🔗',
      'delay': '⏱️',
      'condition': '🔀',
      'filter': '🔍'
    }
    return icons[service.toLowerCase()] || '⚙️'
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case 'trigger':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'action':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'condition':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircleIcon className="h-8 w-8 text-green-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">Workflow Preview</h1>
        </div>
        <p className="text-lg text-gray-600">
          Review your workflow before saving and running it
        </p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{workflow.name}</h2>
            <p className="text-gray-600 mt-1">{workflow.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="btn btn-secondary"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={onConfigure}
              className="btn btn-primary"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Configure
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Original Input:</h3>
          <p className="text-sm text-gray-600 italic">"{workflow.originalInput}"</p>
        </div>

        <div className="space-y-4">
          {workflow.steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex-1">
                <div className={`p-4 rounded-lg border-2 ${getStepColor(step.type)}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStepIcon(step.service)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{step.service}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStepColor(step.type)}`}>
                          {step.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{step.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < workflow.steps.length - 1 && (
                <div className="flex items-center justify-center w-8 h-8 mx-4">
                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Trigger</dt>
              <dd className="text-sm text-gray-900">
                {workflow.steps.find(s => s.type === 'trigger')?.description || 'No trigger defined'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Actions</dt>
              <dd className="text-sm text-gray-900">
                {workflow.steps.filter(s => s.type === 'action').length} actions configured
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Conditions</dt>
              <dd className="text-sm text-gray-900">
                {workflow.steps.filter(s => s.type === 'condition').length} conditions set
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Services</h3>
          <div className="space-y-2">
            {Array.from(new Set(workflow.steps.map(s => s.service))).map(service => (
              <div key={service} className="flex items-center gap-2">
                <span className="text-lg">{getStepIcon(service)}</span>
                <span className="text-sm text-gray-700 capitalize">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-900">Ready to Deploy</h3>
            <p className="text-sm text-green-800 mt-1">
              Your workflow is configured and ready to run. You can further customize it in the canvas 
              view or save and activate it now.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button className="btn btn-primary">
                <PlayIcon className="h-4 w-4 mr-2" />
                Save & Activate
              </button>
              <button
                onClick={onConfigure}
                className="btn btn-secondary"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Advanced Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}