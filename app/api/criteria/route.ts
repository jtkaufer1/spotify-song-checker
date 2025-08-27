import { type NextRequest, NextResponse } from "next/server"
import { DEFAULT_CRITERIA, type CriteriaConfig } from "@/lib/criteria"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CRITERIA_KEY = "criteria:config"

export async function GET() {
  try {
    const criteria = await redis.get<CriteriaConfig>(CRITERIA_KEY)
    return NextResponse.json(criteria || DEFAULT_CRITERIA)
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

    await redis.set(CRITERIA_KEY, criteria)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save criteria:", error)
    return NextResponse.json({ error: "Failed to save criteria" }, { status: 500 })
  }
}
