'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, Settings } from 'lucide-react'

interface IndustryProfile {
  id: string
  name: string
  description: string
  system_prompt: string
  temperature: number
  top_k: number
}

interface IndustrySelectorProps {
  selectedIndustry: IndustryProfile | null
  onIndustryChange: (industry: IndustryProfile | null) => void
  useRAG: boolean
  onRAGToggle: (useRAG: boolean) => void
}

export default function IndustrySelector({
  selectedIndustry,
  onIndustryChange,
  useRAG,
  onRAGToggle,
}: IndustrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [industryProfiles, setIndustryProfiles] = useState<IndustryProfile[]>([])

  useEffect(() => {
    loadIndustryProfiles()
  }, [])

  const loadIndustryProfiles = async () => {
    try {
      const response = await fetch('/api/industry-profiles')
      if (response.ok) {
        const profiles = await response.json()
        setIndustryProfiles(profiles)
        if (profiles.length > 0 && !selectedIndustry) {
          onIndustryChange(profiles[0])
        }
      }
    } catch (error) {
      console.error('Error loading industry profiles:', error)
    }
  }

  const handleIndustrySelect = (industry: IndustryProfile) => {
    onIndustryChange(industry)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Industry Profile</CardTitle>
          <CardDescription>
            Select an industry profile for context-specific responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Industry Selector */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>
                {selectedIndustry ? selectedIndustry.name : 'Select Industry Profile'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {industryProfiles.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No industry profiles available. Contact an admin to create one.
                  </div>
                ) : (
                  industryProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground border-b last:border-b-0"
                      onClick={() => handleIndustrySelect(profile)}
                    >
                      <div className="font-medium">{profile.name}</div>
                      {profile.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {profile.description}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Industry Details */}
          {selectedIndustry && (
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm">
                <div className="font-medium mb-1">{selectedIndustry.name}</div>
                {selectedIndustry.description && (
                  <div className="text-muted-foreground mb-2">
                    {selectedIndustry.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Temperature: {selectedIndustry.temperature} • Top K: {selectedIndustry.top_k}
                </div>
              </div>
            </div>
          )}

          {/* RAG Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Knowledge Base</div>
              <div className="text-xs text-muted-foreground">
                {useRAG 
                  ? 'Using industry-specific documents for responses' 
                  : 'Using general knowledge only'
                }
              </div>
            </div>
            <Button
              variant={useRAG ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRAGToggle(!useRAG)}
            >
              {useRAG ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {/* Admin Link */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => window.open('/admin', '_blank')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Industry Profiles
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
