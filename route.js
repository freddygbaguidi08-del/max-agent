import Anthropic from '@anthropic-ai/sdk'
import { AGENT_TOOLS, executeTool } from '../../../lib/agentTools'
import { MAX_SYSTEM_PROMPT } from '../../../lib/systemPrompt'

export const runtime = 'nodejs'
export const maxDuration = 120

if (!global.actionStore) global.actionStore = []

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
        let currentMessages = [...messages]
        let iterations = 0
        while (iterations < 8) {
          iterations++
          const response = await client.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 4096,
            system: MAX_SYSTEM_PROMPT,
            tools: AGENT_TOOLS,
            messages: currentMessages
          })
          for (const block of response.content) {
            if (block.type === 'text' && block.text) send({ type: 'text', content: block.text })
          }
          if (response.stop_reason === 'end_turn') break
          if (response.stop_reason === 'tool_use') {
            const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
            const toolResults = []
            for (const toolUse of toolUseBlocks) {
              send({ type: 'tool_start', tool: toolUse.name, input: toolUse.input })
              const result = await executeTool(toolUse.name, toolUse.input, global.actionStore)
              send({ type: 'tool_result', tool: toolUse.name, result })
              toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) })
            }
            currentMessages = [
              ...currentMessages,
              { role: 'assistant', content: response.content },
              { role: 'user', content: toolResults }
            ]
          } else break
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
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
  })
}
