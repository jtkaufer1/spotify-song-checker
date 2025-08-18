"use client"

import { useEffect, useState } from "react"
import { Shield, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DEFAULT_CRITERIA, type CriteriaConfig } from "@/lib/criteria"

interface CriteriaDisplayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CriteriaDisplay({ open, onOpenChange }: CriteriaDisplayProps) {
  const [criteria, setCriteria] = useState<CriteriaConfig>(DEFAULT_CRITERIA)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadCriteria = async () => {
      if (!open) return

      setIsLoading(true)
      try {
        const response = await fetch("/api/criteria")
        const serverCriteria = await response.json()
        setCriteria(serverCriteria)
      } catch (error) {
        console.error("Failed to load criteria:", error)
        setCriteria(DEFAULT_CRITERIA)
      } finally {
        setIsLoading(false)
      }
    }

    loadCriteria()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Current Song Criteria
          </DialogTitle>
          <DialogDescription>These are the current criteria used to evaluate songs</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Max Streams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Maximum Stream Count
                </CardTitle>
                <CardDescription>Songs with estimated streams above this limit will fail</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{criteria.maxStreams.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">streams (estimated from Spotify popularity)</div>
              </CardContent>
            </Card>

            {/* Banned Artists */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-accent" />
                  Banned Artists
                </CardTitle>
                <CardDescription>Songs by these artists will automatically fail</CardDescription>
              </CardHeader>
              <CardContent>
                {criteria.bannedArtists.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {criteria.bannedArtists.map((artist, index) => (
                      <Badge key={index} variant="destructive">
                        {artist}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">No artists are currently banned</div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
