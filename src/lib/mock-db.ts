// Mock database for testing - stores data in memory
interface IndustryProfile {
  id: string
  name: string
  description: string
  system_prompt: string
  temperature: number
  top_k: number
  created_at: string
}

interface DataSource {
  id: string
  industry_profile_id: string
  name: string
  type: 'file' | 'url' | 'text'
  content?: string
  url?: string
  file_path?: string
  created_at: string
}

// In-memory storage
const mockIndustryProfiles: IndustryProfile[] = [
  {
    id: 'general',
    name: 'General Chat',
    description: 'General purpose AI chat for testing',
    system_prompt: 'You are a helpful AI assistant.',
    temperature: 0.7,
    top_k: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'tech',
    name: 'Technology',
    description: 'AI chat focused on technology topics',
    system_prompt: 'You are a technology expert AI assistant.',
    temperature: 0.7,
    top_k: 5,
    created_at: new Date().toISOString()
  }
]

const mockDataSources: DataSource[] = []

export { mockIndustryProfiles, mockDataSources }
export type { IndustryProfile, DataSource }
