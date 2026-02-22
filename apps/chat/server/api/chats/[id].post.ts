import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, stepCountIs, streamText } from 'ai'
import { createGithubTools } from '@github-tools/sdk'
import { z } from 'zod'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import type { UIMessage } from 'ai'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { model, messages, githubToken } = await readValidatedBody(event, z.object({
    model: z.string(),
    messages: z.array(z.custom<UIMessage>()),
    githubToken: z.string().optional()
  }).parse)

  const { githubToken: configToken } = useRuntimeConfig()
  const token = githubToken ?? configToken
  const githubTools = token ? createGithubTools({ token }) : {}

  const chat = await db.query.chats.findFirst({
    where: () => and(
      eq(schema.chats.id, id as string),
      eq(schema.chats.userId, session.user?.id || session.id)
    ),
    with: { messages: true }
  })
  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  const lastMessage = messages[messages.length - 1]
  const isContinuation = lastMessage?.role === 'assistant'

  if (!chat.title && !isContinuation) {
    const { text: title } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are a title generator for a chat:
          - Generate a short title based on the first user's message
          - The title should be less than 30 characters long
          - The title should be a summary of the user's message
          - Do not use quotes (' or ") or colons (:) or any other punctuation
          - Do not use markdown, just plain text`,
      prompt: JSON.stringify(messages[0])
    })
    await db.update(schema.chats).set({ title }).where(eq(schema.chats.id, id as string))
  }

  if (lastMessage?.role === 'user' && messages.length > 1) {
    await db.insert(schema.messages).values({
      chatId: id as string,
      role: 'user',
      parts: lastMessage.parts
    })
  }

  const modelMessages = await convertToModelMessages(messages)

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: ({ writer }) => {
      const result = streamText({
        model,
        system: `You are a helpful AI assistant with access to GitHub tools. ${session.user?.username ? `The user's name is ${session.user.username}.` : ''}

You can read repositories, issues, pull requests, code, and commits. You can also create issues, pull requests, comments, and update files — but these write operations require user approval before execution.

**TOOL APPROVAL:**
- When a write tool is denied by the user, do NOT retry it or suggest workarounds to do the same action manually. Simply acknowledge the user's decision and move on.
- Never apologize excessively when a tool is denied — a brief acknowledgment is enough.

**FORMATTING RULES (CRITICAL):**
- ABSOLUTELY NO MARKDOWN HEADINGS: Never use #, ##, ###, ####, #####, or ######
- NO underline-style headings with === or ---
- Use **bold text** for emphasis and section labels instead
- Start all responses with content, never with a heading

**RESPONSE QUALITY:**
- Be concise yet comprehensive
- Use examples when helpful
- Maintain a friendly, professional tone`,
        messages: modelMessages,
        providerOptions: {
          openai: { reasoningEffort: 'low', reasoningSummary: 'detailed' },
          google: { thinkingConfig: { includeThoughts: true, thinkingBudget: 2048 } }
        },
        stopWhen: stepCountIs(token ? 20 : 5),
        tools: {
          weather: weatherTool,
          chart: chartTool,
          ...githubTools
        }
      })

      if (!chat.title && !isContinuation) {
        writer.write({ type: 'data-chat-title', data: { message: 'Generating title...' }, transient: true })
      }

      writer.merge(result.toUIMessageStream({
        sendReasoning: true,
        onError: error => String(error)
      }))
    },
    onFinish: async ({ responseMessage, isContinuation }) => {
      if (isContinuation) {
        const lastDbAssistant = chat.messages
          .filter(m => m.role === 'assistant')
          .pop()
        if (lastDbAssistant) {
          await db.update(schema.messages)
            .set({ parts: responseMessage.parts })
            .where(eq(schema.messages.id, lastDbAssistant.id))
        }
      } else {
        await db.insert(schema.messages).values({
          chatId: chat.id,
          role: responseMessage.role as 'user' | 'assistant',
          parts: responseMessage.parts
        })
      }
    }
  })

  return createUIMessageStreamResponse({ stream })
})
