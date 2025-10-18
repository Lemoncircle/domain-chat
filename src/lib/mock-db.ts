// Mock database for testing - stores data in memory with singleton pattern
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

// Singleton pattern to ensure data persists across requests
class MockDatabase {
  private static instance: MockDatabase
  private industryProfiles: IndustryProfile[]
  private dataSources: DataSource[]

  private constructor() {
    this.industryProfiles = [
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
    this.dataSources = []
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase()
    }
    return MockDatabase.instance
  }

  public getIndustryProfiles(): IndustryProfile[] {
    return this.industryProfiles
  }

  public addIndustryProfile(profile: IndustryProfile): void {
    this.industryProfiles.push(profile)
    console.log('Added profile:', profile)
    console.log('Total profiles:', this.industryProfiles.length)
  }

  public getDataSources(): DataSource[] {
    return this.dataSources
  }

  public getDataSourcesByIndustry(industryId: string): DataSource[] {
    return this.dataSources.filter(source => source.industry_profile_id === industryId)
  }

  public addDataSource(source: DataSource): void {
    this.dataSources.push(source)
    console.log('Added data source:', source)
    console.log('Total data sources:', this.dataSources.length)
  }
}

// Export singleton instance and class
export { MockDatabase }
export type { IndustryProfile, DataSource }
