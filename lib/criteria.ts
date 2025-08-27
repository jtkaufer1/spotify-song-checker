export interface CriteriaConfig {
  maxStreams: number
  bannedArtists: string[]
}

export const DEFAULT_CRITERIA: CriteriaConfig = {
  maxStreams: 500000000,
  bannedArtists: [],
}

export interface TrackCheckResult {
  passed: boolean
  reason?: string
  track: {
    name: string
    artists: string[]
    estimatedStreams: number
  }
}

// Check if a track passes the criteria
export function checkTrackCriteria(
  track: {
    name: string
    artists: Array<{ name: string }>
    popularity: number
  },
  criteria: CriteriaConfig,
): TrackCheckResult {
  const artistNames = track.artists.map((artist) => artist.name)

  // Estimate streams based on popularity (Spotify popularity is 0-100)
  // This is a rough estimation: popularity * 100,000 as stream count
  const estimatedStreams = track.popularity * 100000

  // Check if any artist is banned
  const hasBannedArtist = artistNames.some((artistName) =>
    criteria.bannedArtists.some((bannedArtist) => bannedArtist.toLowerCase() === artistName.toLowerCase()),
  )

  if (hasBannedArtist) {
    return {
      passed: false,
      reason: "Artist is in the banned list",
      track: {
        name: track.name,
        artists: artistNames,
        estimatedStreams,
      },
    }
  }

  // Check if streams exceed maximum
  if (estimatedStreams > criteria.maxStreams) {
    return {
      passed: false,
      reason: `Estimated streams (${estimatedStreams.toLocaleString()}) exceed maximum (${criteria.maxStreams.toLocaleString()})`,
      track: {
        name: track.name,
        artists: artistNames,
        estimatedStreams,
      },
    }
  }

  return {
    passed: true,
    track: {
      name: track.name,
      artists: artistNames,
      estimatedStreams,
    },
  }
}
