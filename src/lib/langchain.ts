import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from './openai'

// Text splitter configuration for document chunking
export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000, // Target chunk size (800-1200 tokens)
  chunkOverlap: 150, // 15% overlap (150/1000 = 15%)
  separators: ['\n\n', '\n', ' ', ''], // Split on paragraphs, lines, words
})

// Google AI embeddings configuration
export const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: EMBEDDING_MODEL,
  maxRetries: 3,
})

// Document processing utilities
export interface DocumentChunk {
  content: string
  metadata: {
    source: string
    chunkIndex: number
    [key: string]: any
  }
}

export interface ProcessedDocument {
  chunks: DocumentChunk[]
  totalChunks: number
}
