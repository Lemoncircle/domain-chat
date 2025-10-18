import { GoogleGenerativeAI } from '@google/generative-ai'

// Google AI client configuration
export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'placeholder_api_key')

// Model configurations
export const CHAT_MODEL = process.env.CHAT_MODEL || 'gemini-1.5-flash'
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-004'

// Embedding dimensions for text-embedding-004
export const EMBEDDING_DIMENSIONS = 768
