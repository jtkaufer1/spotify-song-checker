"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

interface BannedArtistsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bannedArtists: string[]
}

export function BannedArtistsModal({ open, onOpenChange, bannedArtists }: BannedArtistsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Banned Artists ({bannedArtists.length})
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {bannedArtists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No banned artists yet</p>
              <p className="text-sm">Admin can add artists to the banned list</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {bannedArtists.map((artist, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-accent" />
                        </div>
                        <span className="font-medium text-foreground">{artist}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
