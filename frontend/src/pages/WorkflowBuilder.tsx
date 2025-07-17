import { FC, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { 
  MicrophoneIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { WorkflowCanvas } from '../components/WorkflowCanvas'
import { NaturalLanguageInput } from '../components/NaturalLanguageInput'
import { WorkflowPreview } from '../components/WorkflowPreview'

export const WorkflowBuilder: FC = () => {
  const { id } = useParams()
  const [workflow, setWorkflow] = useState(null)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'canvas'>('input')

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageInput.trim()) return
    
    setIsProcessing(true)
    try {
      // This would call your AI service to parse the natural language
      const response = await fetch('/api/workflows/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: naturalLanguageInput })
      })
      
      if (response.ok) {
        const parsedWorkflow = await response.json()
        setWorkflow(parsedWorkflow)
        setCurrentStep('preview')
      }
    } catch (error) {
      console.error('Error parsing workflow:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setNaturalLanguageInput(transcript)
      }
      
      recognition.start()
    }
  }

  const examples = [
    "When someone fills out my contact form, send them a welcome email and add them to my CRM",
    "Every Monday at 9 AM, create a summary of last week's GitHub issues and post it to our Slack channel",
    "When a new order comes in Stripe, add the customer to Mailchimp and create a task in ClickUp",
    "If my website goes down, send me a text message and create a ticket in our support system",
    "When I receive an email from a VIP customer, notify me on Slack and create a high-priority task"
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {currentStep === 'input' && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? 'Edit Workflow' : 'Create New Workflow'}
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Describe your workflow in plain English. Our AI will understand your requirements 
              and build the automation for you.
            </p>
          </div>

          <div className="card p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Describe your workflow
                </label>
                <div className="relative">
                  <textarea
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    placeholder="Tell me what you want to automate..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    disabled={isProcessing}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={handleVoiceInput}
                      disabled={isProcessing || isListening}
                      className={`p-2 rounded-full transition-colors ${
                        isListening 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Voice input"
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNaturalLanguageSubmit}
                      disabled={isProcessing || !naturalLanguageInput.trim()}
                      className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Process workflow"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {isListening && (
                  <p className="text-sm text-red-600 mt-2">Listening... Speak now.</p>
                )}
                {isProcessing && (
                  <p className="text-sm text-primary-600 mt-2">Processing your workflow...</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Or try one of these examples:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setNaturalLanguageInput(example)}
                      className="text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      disabled={isProcessing}
                    >
                      <div className="text-sm text-gray-900">{example}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              💡 Pro Tips for Better Workflows
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about triggers (e.g., "when someone submits my contact form")</li>
              <li>• Mention the services you want to connect (e.g., "send to Slack", "add to CRM")</li>
              <li>• Include timing if relevant (e.g., "every Monday", "immediately")</li>
              <li>• Specify conditions (e.g., "if the email contains 'urgent'")</li>
            </ul>
          </div>
        </div>
      )}

      {currentStep === 'preview' && workflow && (
        <WorkflowPreview 
          workflow={workflow}
          onEdit={() => setCurrentStep('input')}
          onConfigure={() => setCurrentStep('canvas')}
        />
      )}

      {currentStep === 'canvas' && workflow && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Canvas</h1>
              <p className="text-gray-600">Fine-tune your workflow configuration</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep('preview')}
                className="btn btn-secondary"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Preview
              </button>
              <button className="btn btn-primary">
                <PlayIcon className="h-5 w-5 mr-2" />
                Save & Run
              </button>
            </div>
          </div>
          
          <WorkflowCanvas workflow={workflow} />
        </div>
      )}
    </div>
  )
}