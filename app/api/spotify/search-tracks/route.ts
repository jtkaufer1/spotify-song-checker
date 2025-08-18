import { type NextRequest, NextResponse } from "next/server"
import { getSpotifyAccessToken, searchSpotifyTracks } from "@/lib/spotify"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const accessToken = await getSpotifyAccessToken()
    const tracks = await searchSpotifyTracks(query, accessToken)

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("Error searching tracks:", error)
    return NextResponse.json({ error: "Failed to search tracks" }, { status: 500 })
  }
}
