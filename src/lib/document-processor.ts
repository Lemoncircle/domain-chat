import { textSplitter, embeddings, DocumentChunk, ProcessedDocument } from '@/lib/langchain'
import { supabaseAdmin } from '@/lib/supabase'
import * as pdf from 'pdf-parse'
import * as mammoth from 'mammoth'

export interface DocumentMetadata {
  source: string
  url?: string
  type: string
  [key: string]: any
}

// Process different document types
export async function processDocument(
  content: string,
  metadata: DocumentMetadata,
  industryProfileId: string
): Promise<ProcessedDocument> {
  try {
    // Split document into chunks
    const chunks = await textSplitter.splitText(content)
    
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
      content: chunk,
      metadata: {
        ...metadata,
        chunkIndex: index,
      },
    }))

    // Generate embeddings for each chunk
    const embeddingsList = await embeddings.embedDocuments(
      documentChunks.map(chunk => chunk.content)
    )

    // Store chunks in database
    const chunkInserts = documentChunks.map((chunk, index) => ({
      data_source_id: metadata.source, // This will be updated with actual data source ID
      industry_profile_id: industryProfileId,
      content: chunk.content,
      metadata: chunk.metadata,
      embedding: embeddingsList[index],
      chunk_index: index,
    }))

    const { error } = await supabaseAdmin
      .from('document_chunks')
      .insert(chunkInserts)

    if (error) {
      throw new Error(`Failed to store document chunks: ${error.message}`)
    }

    return {
      chunks: documentChunks,
      totalChunks: documentChunks.length,
    }
  } catch (error) {
    console.error('Error processing document:', error)
    throw error
  }
}

// Extract text from PDF
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf.default(buffer)
    return data.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Extract text from DOCX
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.default.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('Error extracting text from DOCX:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

// Extract text from URL
export async function extractTextFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    // Simple HTML to text conversion (you might want to use a proper HTML parser)
    const text = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    return text
  } catch (error) {
    console.error('Error extracting text from URL:', error)
    throw new Error('Failed to extract text from URL')
  }
}

// Process file upload
export async function processFileUpload(
  file: File,
  industryProfileId: string,
  dataSourceId: string
): Promise<ProcessedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const metadata: DocumentMetadata = {
    source: file.name,
    type: file.type,
  }

  let content: string

  switch (file.type) {
    case 'application/pdf':
      content = await extractTextFromPDF(buffer)
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      content = await extractTextFromDOCX(buffer)
      break
    case 'text/plain':
    case 'text/markdown':
      content = buffer.toString('utf-8')
      break
    default:
      throw new Error(`Unsupported file type: ${file.type}`)
  }

  // Update metadata with data source ID
  metadata.source = dataSourceId

  return processDocument(content, metadata, industryProfileId)
}

// Process URL content
export async function processURLContent(
  url: string,
  industryProfileId: string,
  dataSourceId: string
): Promise<ProcessedDocument> {
  const content = await extractTextFromURL(url)
  const metadata: DocumentMetadata = {
    source: dataSourceId,
    url,
    type: 'url',
  }

  return processDocument(content, metadata, industryProfileId)
}

// Process text content
export async function processTextContent(
  text: string,
  industryProfileId: string,
  dataSourceId: string
): Promise<ProcessedDocument> {
  const metadata: DocumentMetadata = {
    source: dataSourceId,
    type: 'text',
  }

  return processDocument(text, metadata, industryProfileId)
}
