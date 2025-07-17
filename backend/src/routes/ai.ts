import express from 'express'
import { OpenAI } from 'openai'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Parse natural language input into workflow steps
router.post('/parse-workflow', async (req, res) => {
  try {
    const { description } = req.body

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      })
    }

    // Create a prompt for the AI to parse the workflow
    const prompt = `You are a workflow automation expert. Parse the following natural language description into a structured workflow.

Description: "${description}"

Please analyze this and return a JSON object with the following structure:
{
  "name": "Workflow Name",
  "description": "Brief description of what the workflow does",
  "originalInput": "${description}",
  "steps": [
    {
      "id": "unique-id",
      "type": "trigger|action|condition|delay",
      "service": "service-name",
      "action": "action-name",
      "description": "Human readable description",
      "config": {
        // Service-specific configuration
      }
    }
  ]
}

Supported services include:
- gmail, slack, discord, telegram, mattermost
- notion, airtable, clickup, trello, todoist
- hubspot, salesforce, pipedrive
- stripe, mailchimp, github, gitlab
- google-calendar, google-drive, google-sheets
- webhooks, http-request, delay, filter, formatter
- openai, deepl

Rules:
1. The first step should always be a trigger
2. Actions should follow triggers
3. Use conditions for branching logic
4. Be specific about the service and action
5. Include reasonable default configurations
6. Generate valid UUIDs for step IDs

Return only the JSON object, no additional text.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a workflow automation expert that converts natural language to structured workflows. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse workflow'
      })
    }

    let parsedWorkflow
    try {
      parsedWorkflow = JSON.parse(content)
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response'
      })
    }

    // Validate and enhance the parsed workflow
    const enhancedWorkflow = {
      ...parsedWorkflow,
      steps: parsedWorkflow.steps.map((step: any, index: number) => ({
        ...step,
        id: step.id || uuidv4(),
        position: { x: 100, y: 100 + index * 150 },
        connections: index < parsedWorkflow.steps.length - 1 ? [parsedWorkflow.steps[index + 1].id] : []
      }))
    }

    res.json({
      success: true,
      data: enhancedWorkflow
    })

  } catch (error) {
    console.error('Error parsing workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to parse workflow'
    })
  }
})

// Get workflow suggestions based on user input
router.post('/suggest', async (req, res) => {
  try {
    const { input } = req.body

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      })
    }

    const prompt = `Based on this partial workflow description: "${input}"

Generate 3 helpful suggestions to complete or improve this workflow. Consider:
1. Common workflow patterns
2. Best practices for automation
3. Additional steps that might be useful
4. Error handling and conditions

Return a JSON array of suggestions:
[
  {
    "title": "Suggestion Title",
    "description": "Detailed description of the suggestion",
    "priority": "high|medium|low"
  }
]

Return only the JSON array, no additional text.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a workflow automation expert. Provide helpful suggestions for workflow improvement.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate suggestions'
      })
    }

    const suggestions = JSON.parse(content)

    res.json({
      success: true,
      data: suggestions
    })

  } catch (error) {
    console.error('Error generating suggestions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions'
    })
  }
})

// Validate workflow configuration
router.post('/validate', async (req, res) => {
  try {
    const { workflow } = req.body

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Workflow is required'
      })
    }

    const issues = []

    // Check for trigger
    const triggers = workflow.steps.filter((step: any) => step.type === 'trigger')
    if (triggers.length === 0) {
      issues.push({
        type: 'error',
        message: 'Workflow must have at least one trigger',
        step: null
      })
    }

    // Check for actions
    const actions = workflow.steps.filter((step: any) => step.type === 'action')
    if (actions.length === 0) {
      issues.push({
        type: 'warning',
        message: 'Workflow should have at least one action',
        step: null
      })
    }

    // Check for disconnected steps
    workflow.steps.forEach((step: any) => {
      if (step.type !== 'trigger' && !workflow.steps.some((s: any) => s.connections?.includes(step.id))) {
        issues.push({
          type: 'warning',
          message: `Step "${step.description}" is not connected to any other step`,
          step: step.id
        })
      }
    })

    // Check for missing configurations
    workflow.steps.forEach((step: any) => {
      if (!step.config || Object.keys(step.config).length === 0) {
        issues.push({
          type: 'info',
          message: `Step "${step.description}" may need additional configuration`,
          step: step.id
        })
      }
    })

    res.json({
      success: true,
      data: {
        valid: issues.filter(i => i.type === 'error').length === 0,
        issues
      }
    })

  } catch (error) {
    console.error('Error validating workflow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to validate workflow'
    })
  }
})

export default router