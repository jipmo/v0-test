import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
    const data = await response.json()

    if (!response.ok || !data.data) {
      return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 400 })
    }

    const metadata = data.data
    const ogImage = metadata.image?.url || ""
    const ogTitle = metadata.title || ""
    const ogDescription = metadata.description || ""
    const publisher = metadata.publisher || ""

    return NextResponse.json({
      company: publisher,
      logo: ogImage,
      title: ogTitle,
      description: ogDescription,
    })
  } catch (error) {
    console.error("[v0] Metadata fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
