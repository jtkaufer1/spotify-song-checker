import { type NextRequest, NextResponse } from "next/server"
import { getSpotifyAccessToken, searchSpotifyArtists } from "@/lib/spotify"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const accessToken = await getSpotifyAccessToken()
    const artists = await searchSpotifyArtists(query, accessToken)

    return NextResponse.json({ artists })
  } catch (error) {
    console.error("Error searching artists:", error)
    return NextResponse.json({ error: "Failed to search artists" }, { status: 500 })
  }
}
