import OpenAI from 'openai'

// OpenAI client configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Model configurations
export const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o-mini'
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'

// Embedding dimensions for text-embedding-3-small
export const EMBEDDING_DIMENSIONS = 1536
