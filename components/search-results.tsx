"use client"

import { useEffect, useState } from "react"
import { Music, Check, X, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { checkTrackCriteria, DEFAULT_CRITERIA, type CriteriaConfig, type TrackCheckResult } from "@/lib/criteria"

interface SearchResultsProps {
  results: any[]
  isLoading: boolean
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  const [criteria, setCriteria] = useState<CriteriaConfig>(DEFAULT_CRITERIA)
  const [checkedResults, setCheckedResults] = useState<TrackCheckResult[]>([])
  const [criteriaLoading, setCriteriaLoading] = useState(true)

  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const response = await fetch("/api/criteria")
        const serverCriteria = await response.json()
        setCriteria(serverCriteria)
      } catch (error) {
        console.error("Failed to load criteria:", error)
        setCriteria(DEFAULT_CRITERIA)
      } finally {
        setCriteriaLoading(false)
      }
    }

    loadCriteria()
  }, [])

  useEffect(() => {
    // Check each result against criteria
    if (results.length > 0 && !criteriaLoading) {
      const checked = results.map((track) => checkTrackCriteria(track, criteria))
      setCheckedResults(checked)
    } else {
      setCheckedResults([])
    }
  }, [results, criteria, criteriaLoading])

  if (isLoading || criteriaLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{isLoading ? "Searching Spotify..." : "Loading criteria..."}</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold text-foreground mb-6">Search Results</h3>
      <div className="grid gap-4">
        {checkedResults.map((result, index) => (
          <Card
            key={index}
            className={`border-l-4 ${
              result.passed ? "border-l-success bg-success/5" : "border-l-destructive bg-destructive/5"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-muted-foreground" />
                    {result.track.name}
                  </CardTitle>
                  <CardDescription className="mt-1">by {result.track.artists.join(", ")}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={result.passed ? "default" : "destructive"}
                    className={result.passed ? "bg-success text-success-foreground" : ""}
                  >
                    {result.passed ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        PASS
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        FAIL
                      </>
                    )}
                  </Badge>
                  {results[index]?.external_urls?.spotify && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={results[index].external_urls.spotify} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Spotify
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Streams:</span>
                  <span className="font-medium">{result.track.estimatedStreams.toLocaleString()}</span>
                </div>
                {!result.passed && result.reason && (
                  <div className="text-sm text-destructive font-medium">Reason: {result.reason}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
