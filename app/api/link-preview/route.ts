export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("[v0] API proxy error:", error)
    return Response.json({ error: "Failed to fetch link preview" }, { status: 500 })
  }
}
