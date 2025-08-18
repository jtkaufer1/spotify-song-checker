const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{
    id: string
    name: string
  }>
  popularity: number
  external_urls: {
    spotify: string
  }
}

interface SpotifyArtist {
  id: string
  name: string
  followers: {
    total: number
  }
  external_urls: {
    spotify: string
  }
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
  artists: {
    items: SpotifyArtist[]
  }
}

// Get Spotify access token using client credentials flow
export async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token")
  }

  const data: SpotifyTokenResponse = await response.json()
  return data.access_token
}

// Search for tracks on Spotify
export async function searchSpotifyTracks(query: string, accessToken: string): Promise<SpotifyTrack[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to search Spotify tracks")
  }

  const data: SpotifySearchResponse = await response.json()
  return data.tracks.items
}

// Search for artists on Spotify
export async function searchSpotifyArtists(query: string, accessToken: string): Promise<SpotifyArtist[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to search Spotify artists")
  }

  const data: SpotifySearchResponse = await response.json()
  return data.artists.items
}

// Get detailed track information including audio features for stream count estimation
export async function getTrackDetails(
  trackId: string,
  accessToken: string,
): Promise<SpotifyTrack & { popularity: number }> {
  const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get track details")
  }

  return response.json()
}
