export interface DocumentMetadata {
  source: string
  url?: string
  type: string
  [key: string]: unknown
}

export interface ProcessedDocument {
  chunks: Array<{
    content: string
    metadata: DocumentMetadata & { chunkIndex: number }
  }>
  totalChunks: number
}

// TEMPORARILY DISABLED: Mock document processing for testing
export async function processDocument(
  content: string,
  metadata: DocumentMetadata,
  industryProfileId: string
): Promise<ProcessedDocument> {
  try {
    console.log('Mock document processing:', { 
      content: content.substring(0, 100) + '...', 
      metadata, 
      industryProfileId 
    })
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock processed document
    const mockChunks = [
      {
        content: content.substring(0, 500),
        metadata: { ...metadata, chunkIndex: 0 }
      }
    ]
    
    console.log('Mock document processing completed')
    
    return {
      chunks: mockChunks,
      totalChunks: mockChunks.length,
    }
  } catch (error) {
    console.error('Error processing document:', error)
    throw error
  }
}

// Extract text from PDF (simplified version)
export async function extractTextFromPDF(): Promise<string> {
  try {
    // For now, return a placeholder - we'll implement this later
    return 'PDF content extraction temporarily disabled for deployment'
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Extract text from DOCX (simplified version)
export async function extractTextFromDOCX(): Promise<string> {
  try {
    // For now, return a placeholder - we'll implement this later
    return 'DOCX content extraction temporarily disabled for deployment'
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
      content = await extractTextFromPDF()
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      content = await extractTextFromDOCX()
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