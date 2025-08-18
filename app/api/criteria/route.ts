import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { DEFAULT_CRITERIA, type CriteriaConfig } from "@/lib/criteria"

const CRITERIA_FILE = path.join(process.cwd(), "data", "criteria.json")

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(CRITERIA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Read criteria from file
async function readCriteria(): Promise<CriteriaConfig> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(CRITERIA_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    // If file doesn't exist, return default criteria
    return DEFAULT_CRITERIA
  }
}

// Write criteria to file
async function writeCriteria(criteria: CriteriaConfig): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(CRITERIA_FILE, JSON.stringify(criteria, null, 2))
}

export async function GET() {
  try {
    const criteria = await readCriteria()
    return NextResponse.json(criteria)
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

    await writeCriteria(criteria)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save criteria:", error)
    return NextResponse.json({ error: "Failed to save criteria" }, { status: 500 })
  }
}
