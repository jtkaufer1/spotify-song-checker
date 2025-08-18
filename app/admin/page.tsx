"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings, Shield, Users, TrendingUp, Plus, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DEFAULT_CRITERIA, type CriteriaConfig } from "@/lib/criteria"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [criteria, setCriteria] = useState<CriteriaConfig>(DEFAULT_CRITERIA)
  const [maxStreams, setMaxStreams] = useState("")
  const [artistSearch, setArtistSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const authStatus = sessionStorage.getItem("adminAuthenticated")
      if (authStatus === "true") {
        setIsAuthenticated(true)
        try {
          const response = await fetch("/api/criteria")
          const serverCriteria = await response.json()
          setCriteria(serverCriteria)
          setMaxStreams(serverCriteria.maxStreams.toString())
        } catch (error) {
          console.error("Failed to load criteria:", error)
          setCriteria(DEFAULT_CRITERIA)
          setMaxStreams(DEFAULT_CRITERIA.maxStreams.toString())
        }
      } else {
        router.push("/")
      }
      setIsLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  const handleUpdateMaxStreams = async () => {
    const newMaxStreams = Number.parseInt(maxStreams)
    if (isNaN(newMaxStreams) || newMaxStreams < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number for max streams",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const updatedCriteria = { ...criteria, maxStreams: newMaxStreams }

      const response = await fetch("/api/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCriteria),
      })

      if (response.ok) {
        setCriteria(updatedCriteria)
        toast({
          title: "Updated",
          description: "Maximum stream count has been updated",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to update max streams:", error)
      toast({
        title: "Error",
        description: "Failed to update maximum stream count",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSearchArtists = async () => {
    if (!artistSearch.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/spotify/search-artists?q=${encodeURIComponent(artistSearch)}`)
      const data = await response.json()
      setSearchResults(data.artists || [])
    } catch (error) {
      console.error("Artist search failed:", error)
      setSearchResults([])
      toast({
        title: "Search failed",
        description: "Failed to search for artists",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddBannedArtist = async (artistName: string) => {
    if (criteria.bannedArtists.includes(artistName)) {
      toast({
        title: "Already banned",
        description: "This artist is already in the banned list",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const updatedCriteria = {
        ...criteria,
        bannedArtists: [...criteria.bannedArtists, artistName],
      }

      const response = await fetch("/api/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCriteria),
      })

      if (response.ok) {
        setCriteria(updatedCriteria)
        toast({
          title: "Artist banned",
          description: `${artistName} has been added to the banned list`,
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to add banned artist:", error)
      toast({
        title: "Error",
        description: "Failed to add artist to banned list",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveBannedArtist = async (artistName: string) => {
    setIsSaving(true)
    try {
      const updatedCriteria = {
        ...criteria,
        bannedArtists: criteria.bannedArtists.filter((name) => name !== artistName),
      }

      const response = await fetch("/api/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCriteria),
      })

      if (response.ok) {
        setCriteria(updatedCriteria)
        toast({
          title: "Artist unbanned",
          description: `${artistName} has been removed from the banned list`,
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to remove banned artist:", error)
      toast({
        title: "Error",
        description: "Failed to remove artist from banned list",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Configuration Dashboard</h2>
            <p className="text-muted-foreground">Manage song criteria and banned artists</p>
          </div>

          {/* Max Streams Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Maximum Stream Count
              </CardTitle>
              <CardDescription>Set the maximum number of estimated streams allowed for songs to pass</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="maxStreams">Max Streams</Label>
                  <Input
                    id="maxStreams"
                    type="number"
                    value={maxStreams}
                    onChange={(e) => setMaxStreams(e.target.value)}
                    placeholder="Enter maximum stream count"
                    min="0"
                    disabled={isSaving}
                  />
                </div>
                <Button onClick={handleUpdateMaxStreams} disabled={isSaving}>
                  <Settings className="h-4 w-4 mr-2" />
                  {isSaving ? "Updating..." : "Update"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Current limit: <span className="font-medium">{criteria.maxStreams.toLocaleString()}</span> streams
              </div>
            </CardContent>
          </Card>

          {/* Banned Artists Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Banned Artists Management
              </CardTitle>
              <CardDescription>Search for artists on Spotify and manage the banned artists list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Artist Search */}
              <div className="space-y-4">
                <Label>Search Artists</Label>
                <div className="flex gap-2">
                  <Input
                    value={artistSearch}
                    onChange={(e) => setArtistSearch(e.target.value)}
                    placeholder="Search for artists on Spotify..."
                    onKeyDown={(e) => e.key === "Enter" && handleSearchArtists()}
                    disabled={isSaving}
                  />
                  <Button onClick={handleSearchArtists} disabled={isSearching || !artistSearch.trim() || isSaving}>
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Search Results</Label>
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {searchResults.map((artist) => (
                        <div
                          key={artist.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{artist.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {artist.followers.total.toLocaleString()} followers
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddBannedArtist(artist.name)}
                            disabled={criteria.bannedArtists.includes(artist.name) || isSaving}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {criteria.bannedArtists.includes(artist.name)
                              ? "Already Banned"
                              : isSaving
                                ? "Adding..."
                                : "Ban Artist"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Banned Artists */}
              <div className="space-y-4">
                <Label>Currently Banned Artists ({criteria.bannedArtists.length})</Label>
                {criteria.bannedArtists.length > 0 ? (
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {criteria.bannedArtists.map((artist, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg bg-destructive/5"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{artist}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveBannedArtist(artist)}
                          disabled={isSaving}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {isSaving ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground italic">No artists are currently banned</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
