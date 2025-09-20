import { type NextRequest, NextResponse } from "next/server"
import { searchVector, initializeVectorSearch } from "@/lib/vector-search"

export async function POST(request: NextRequest) {
  try {
    const { query, topK = 10 } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required and must be a string" }, { status: 400 })
    }

    // Initialize if needed
    await initializeVectorSearch()

    // Perform vector search
    const results = await searchVector(query, topK)

    return NextResponse.json({
      success: true,
      results,
      query,
      count: results.length,
    })
  } catch (error) {
    console.error("[v0] Vector search API error:", error)
    return NextResponse.json({ error: "Internal server error during vector search" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Vector Search API",
    endpoints: {
      "POST /api/vector-search": "Search profiles using vector similarity",
    },
    usage: {
      method: "POST",
      body: {
        query: "string (required) - Natural language search query",
        topK: "number (optional) - Number of results to return (default: 10)",
      },
    },
  })
}
