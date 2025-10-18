'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Upload, Link, FileText } from 'lucide-react'

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
  file_path?: string
  url?: string
  created_at: string
}

export default function AdminPanel() {
  // TEMPORARILY DISABLED: Skip authentication for testing
  const profile = { role: 'admin' } // Mock admin profile
  const [industryProfiles, setIndustryProfiles] = useState<IndustryProfile[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState<IndustryProfile | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    system_prompt: '',
    temperature: 0.7,
    top_k: 5,
  })

  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'file' as 'file' | 'url' | 'text',
    content: '',
    url: '',
    file: null as File | null,
  })

  const loadIndustryProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/industry-profiles')
      if (response.ok) {
        const profiles = await response.json()
        setIndustryProfiles(profiles)
        if (profiles.length > 0 && !selectedIndustry) {
          setSelectedIndustry(profiles[0])
        }
      }
    } catch (error) {
      console.error('Error loading industry profiles:', error)
    }
  }, [selectedIndustry])

  useEffect(() => {
    loadIndustryProfiles()
  }, [loadIndustryProfiles])

  useEffect(() => {
    if (selectedIndustry) {
      loadDataSources(selectedIndustry.id)
    }
  }, [selectedIndustry])

  const loadDataSources = async (industryId: string) => {
    try {
      const response = await fetch(`/api/data-sources?industry_id=${industryId}`)
      if (response.ok) {
        const sources = await response.json()
        setDataSources(sources)
      }
    } catch (error) {
      console.error('Error loading data sources:', error)
    }
  }

  const createIndustryProfile = async () => {
    try {
      const response = await fetch('/api/industry-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const newProfile = await response.json()
        setIndustryProfiles(prev => [newProfile, ...prev])
        setSelectedIndustry(newProfile)
        resetProfileForm()
      }
    } catch (error) {
      console.error('Error creating industry profile:', error)
    }
  }

  const updateIndustryProfile = async () => {
    if (!editingProfile) return

    try {
      const response = await fetch(`/api/industry-profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setIndustryProfiles(prev => 
          prev.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        )
        if (selectedIndustry?.id === updatedProfile.id) {
          setSelectedIndustry(updatedProfile)
        }
        setIsEditingProfile(false)
        setEditingProfile(null)
        resetProfileForm()
      }
    } catch (error) {
      console.error('Error updating industry profile:', error)
    }
  }

  const deleteIndustryProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this industry profile?')) return

    try {
      const response = await fetch(`/api/industry-profiles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIndustryProfiles(prev => prev.filter(p => p.id !== id))
        if (selectedIndustry?.id === id) {
          setSelectedIndustry(null)
        }
      }
    } catch (error) {
      console.error('Error deleting industry profile:', error)
    }
  }

  const uploadDataSource = async () => {
    if (!selectedIndustry) return

    setIsUploading(true)
    try {
      // First create the data source
      const formData = new FormData()
      formData.append('industry_id', selectedIndustry.id)
      formData.append('name', uploadForm.name)
      formData.append('type', uploadForm.type)
      
      if (uploadForm.type === 'text') {
        formData.append('content', uploadForm.content)
      } else if (uploadForm.type === 'url') {
        formData.append('url', uploadForm.url)
      }

      const response = await fetch('/api/data-sources', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newSource = await response.json()
        setDataSources(prev => [newSource, ...prev])
        
        // Now process the content
        const ingestFormData = new FormData()
        ingestFormData.append('data_source_id', newSource.id)
        ingestFormData.append('industry_profile_id', selectedIndustry.id)
        ingestFormData.append('type', uploadForm.type)
        
        if (uploadForm.type === 'text') {
          ingestFormData.append('content', uploadForm.content)
        } else if (uploadForm.type === 'url') {
          ingestFormData.append('url', uploadForm.url)
        } else if (uploadForm.type === 'file' && uploadForm.file) {
          ingestFormData.append('file', uploadForm.file)
        }

        const ingestResponse = await fetch('/api/ingest', {
          method: 'POST',
          body: ingestFormData,
        })

        if (ingestResponse.ok) {
          const result = await ingestResponse.json()
          alert(`Successfully processed ${result.chunksProcessed} chunks!`)
        } else {
          console.error('Failed to process content')
        }
        
        resetUploadForm()
      }
    } catch (error) {
      console.error('Error uploading data source:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const resetProfileForm = () => {
    setProfileForm({
      name: '',
      description: '',
      system_prompt: '',
      temperature: 0.7,
      top_k: 5,
    })
  }

  const resetUploadForm = () => {
    setUploadForm({
      name: '',
      type: 'file',
      content: '',
      url: '',
      file: null,
    })
  }

  const startEditProfile = (profile: IndustryProfile) => {
    setEditingProfile(profile)
    setProfileForm({
      name: profile.name,
      description: profile.description,
      system_prompt: profile.system_prompt,
      temperature: profile.temperature,
      top_k: profile.top_k,
    })
    setIsEditingProfile(true)
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={() => window.close()}>
            Back to Chat
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Industry Profiles */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Profiles</CardTitle>
              <CardDescription>
                Manage industry-specific AI profiles and system prompts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile List */}
              <div className="space-y-2">
                {industryProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedIndustry?.id === profile.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedIndustry(profile)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditProfile(profile)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteIndustryProfile(profile.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create/Edit Profile Form */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">
                  {isEditingProfile ? 'Edit Profile' : 'Create New Profile'}
                </h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Profile name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Description"
                    value={profileForm.description}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Textarea
                    placeholder="System prompt"
                    value={profileForm.system_prompt}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, system_prompt: e.target.value }))}
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Temperature</label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={profileForm.temperature}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Top K</label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={profileForm.top_k}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, top_k: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEditingProfile ? (
                      <>
                        <Button onClick={updateIndustryProfile} className="flex-1">
                          Update Profile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false)
                            setEditingProfile(null)
                            resetProfileForm()
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={createIndustryProfile} className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                Upload documents and add data sources for the selected industry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedIndustry ? (
                <p className="text-muted-foreground">Select an industry profile to manage data sources.</p>
              ) : (
                <>
                  {/* Data Sources List */}
                  <div className="space-y-2">
                    {dataSources.map((source) => (
                      <div key={source.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{source.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {source.type} • {new Date(source.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Form */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Add Data Source</h3>
                    <div className="space-y-3">
                      <Input
                        placeholder="Source name"
                        value={uploadForm.name}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          variant={uploadForm.type === 'file' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUploadForm(prev => ({ ...prev, type: 'file' }))}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          File
                        </Button>
                        <Button
                          variant={uploadForm.type === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUploadForm(prev => ({ ...prev, type: 'url' }))}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          URL
                        </Button>
                        <Button
                          variant={uploadForm.type === 'text' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUploadForm(prev => ({ ...prev, type: 'text' }))}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Text
                        </Button>
                      </div>

                      {uploadForm.type === 'text' && (
                        <Textarea
                          placeholder="Paste your text content here..."
                          value={uploadForm.content}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={4}
                        />
                      )}

                      {uploadForm.type === 'url' && (
                        <Input
                          placeholder="https://example.com/document"
                          value={uploadForm.url}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, url: e.target.value }))}
                        />
                      )}

                      {uploadForm.type === 'file' && (
                        <div>
                          <Input
                            type="file"
                            accept=".pdf,.docx,.txt,.md"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setUploadForm(prev => ({ 
                                  ...prev, 
                                  file,
                                  name: file.name 
                                }))
                              }
                            }}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Supported formats: PDF, DOCX, TXT, MD
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={uploadDataSource}
                        disabled={isUploading || !uploadForm.name}
                        className="w-full"
                      >
                        {isUploading ? 'Uploading...' : 'Add Data Source'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
