import Groq from 'groq-sdk'
import { AGENT_TOOLS, executeTool } from '../../../lib/agentTools'
import { MAX_SYSTEM_PROMPT } from '../../../lib/systemPrompt'

export const runtime = 'nodejs'
export const maxDuration = 120

if (!global.actionStore) global.actionStore = []

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Convertit les tool definitions Anthropic → format OpenAI/Groq
function toGroqTools(anthropicTools) {
  return anthropicTools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema
    }
  }))
}

export async function POST(req) {
  const { messages } = await req.json()
  if (!messages?.length) return new Response('messages requis', { status: 400 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      try {
        // Injecter le system prompt dans les messages (format OpenAI)
        let currentMessages = [
          { role: 'system', content: MAX_SYSTEM_PROMPT },
          ...messages
        ]
        let iterations = 0

        while (iterations < 8) {
          iterations++

          const response = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // modèle gratuit Groq avec tool use
            max_tokens: 4096,
            tools: toGroqTools(AGENT_TOOLS),
            tool_choice: 'auto',
            messages: currentMessages
          })

          const choice = response.choices[0]
          const msg = choice.message

          // Envoyer le texte si présent
          if (msg.content) {
            send({ type: 'text', content: msg.content })
          }

          // Si pas d'appels d'outils → terminé
          if (!msg.tool_calls || msg.tool_calls.length === 0) break

          // Traiter les appels d'outils
          const toolResults = []
          for (const toolCall of msg.tool_calls) {
            const toolName = toolCall.function.name
            let toolInput = {}
            try {
              toolInput = JSON.parse(toolCall.function.arguments)
            } catch (e) {
              toolInput = {}
            }

            send({ type: 'tool_start', tool: toolName, input: toolInput })
            const result = await executeTool(toolName, toolInput, global.actionStore)
            send({ type: 'tool_result', tool: toolName, result })

            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            })
          }

          // Ajouter la réponse assistant + résultats outils à l'historique
          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls },
            ...toolResults
          ]

          if (choice.finish_reason === 'stop') break
        }

        send({ type: 'done' })
      } catch (err) {
        send({ type: 'error', message: err.message })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
