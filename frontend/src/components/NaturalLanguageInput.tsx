import { FC, useState, useRef, useEffect } from 'react'
import { 
  MicrophoneIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface NaturalLanguageInputProps {
  onSubmit: (text: string) => void
  isProcessing?: boolean
  placeholder?: string
  suggestions?: string[]
}

export const NaturalLanguageInput: FC<NaturalLanguageInputProps> = ({
  onSubmit,
  isProcessing = false,
  placeholder = "Tell me what you want to automate...",
  suggestions = []
}) => {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      onSubmit(input.trim())
      setInput('')
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
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
        setInput(prevInput => prevInput + ' ' + transcript)
      }
      recognition.onerror = () => setIsListening(false)
      
      recognition.start()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(input.toLowerCase()) && s !== input
  )

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full min-h-[100px] max-h-[200px] p-4 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          disabled={isProcessing}
        />
        
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            disabled={isProcessing || isListening}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Voice input"
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !input.trim()}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Process workflow"
          >
            {isProcessing ? (
              <SparklesIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {isListening && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs animate-pulse">
            Listening...
          </div>
        )}
        
        {isProcessing && (
          <div className="absolute top-2 left-2 bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs">
            Processing...
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (filteredSuggestions.length > 0 || input.length === 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Suggestions</h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-2">
            {(input.length === 0 ? suggestions : filteredSuggestions).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm text-gray-900">{suggestion}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}