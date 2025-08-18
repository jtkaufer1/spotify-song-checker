import { type NextRequest, NextResponse } from "next/server"
import { DEFAULT_CRITERIA, type CriteriaConfig } from "@/lib/criteria"

let criteriaCache: CriteriaConfig = DEFAULT_CRITERIA

export async function GET() {
  try {
    return NextResponse.json(criteriaCache)
  } catch (error) {
    console.error("Failed to read criteria:", error)
    return NextResponse.json(DEFAULT_CRITERIA)
  }
}

export async function POST(request: NextRequest) {
  try {
    const criteria: CriteriaConfig = await request.json()

    // Validate the criteria structure
    if (typeof criteria.maxStreams !== "number" || !Array.isArray(criteria.bannedArtists)) {
      return NextResponse.json({ error: "Invalid criteria format" }, { status: 400 })
    }

    criteriaCache = criteria
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save criteria:", error)
    return NextResponse.json({ error: "Failed to save criteria" }, { status: 500 })
  }
}
