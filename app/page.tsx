"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search, Music, Shield, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AdminLogin } from "@/components/admin-login"
import { CriteriaDisplay } from "@/components/criteria-display"
import { SearchResults } from "@/components/search-results"
import { BannedArtistsModal } from "@/components/banned-artists-modal"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showCriteria, setShowCriteria] = useState(false)
  const [showBannedArtists, setShowBannedArtists] = useState(false)
  const [criteria, setCriteria] = useState({ maxStreams: 1000000, bannedArtists: [] })
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(true)

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/spotify/search-tracks?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.tracks || [])
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const response = await fetch("/api/criteria")
        if (response.ok) {
          const data = await response.json()
          setCriteria(data)
        }
      } catch (error) {
        console.error("Failed to fetch criteria:", error)
      } finally {
        setIsLoadingCriteria(false)
      }
    }

    fetchCriteria()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        performSearch(searchQuery)
      }
    }

  const formatStreamCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M+`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K+`
    }
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border" style={{ backgroundColor: "#9e00c4" }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-white" />
            <h1 className="text-xl font-semibold text-white">Song Criteria Checker</h1>
          </div>
          <div className="flex items-center gap-4">
            <AdminLogin />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Check if Your Song Meets Our Criteria</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Search for any song on Spotify
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter song title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base"
                disabled={isSearching}
              />
            </div>
            <Button type="submit" size="lg" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Searching..." : "Check Song"}
            </Button>
          </form>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {isLoadingCriteria ? "..." : formatStreamCount(criteria.maxStreams)}
                </div>
                <div className="text-sm text-muted-foreground">Max Stream Limit</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => setShowBannedArtists(true)}
            >
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {isLoadingCriteria ? "..." : criteria.bannedArtists.length}
                </div>
                <div className="text-sm text-muted-foreground">Banned Artists</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Results */}
        <SearchResults results={searchResults} isLoading={isSearching} />
      </main>

      {/* Banned Artists Modal */}
      <BannedArtistsModal
        open={showBannedArtists}
        onOpenChange={setShowBannedArtists}
        bannedArtists={criteria.bannedArtists}
      />
    </div>
  )
}
