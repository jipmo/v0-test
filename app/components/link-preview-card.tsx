"use client"

import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"

interface LinkMetadata {
  title: string
  publisher: string
  logo: string
}

interface LinkPreviewCardProps {
  url: string
  productName: string
}

export function LinkPreviewCard({ url, productName }: LinkPreviewCardProps) {
  const [meta, setMeta] = useState<LinkMetadata | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinkPreview = async () => {
      try {
        console.log("[v0] Fetching preview for URL:", url)
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
        const data = await response.json()
        console.log("[v0] Preview data received:", data)

        if (data.data) {
          setMeta({
            title: data.data.title || productName,
            publisher: data.data.publisher || "상품",
            logo: data.data.logo?.url || "",
          })
        }
      } catch (error) {
        console.error("[v0] Failed to fetch link preview:", error)
        // Fallback to basic info if API fails
        setMeta({
          title: productName,
          publisher: "상품",
          logo: "",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLinkPreview()
  }, [url, productName])

  if (loading) {
    return <div className="h-12 bg-gray-100 rounded-md animate-pulse" />
  }

  if (!meta) {
    return null
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
    >
      {/* Logo Circle */}
      {meta.logo ? (
        <img
          src={meta.logo || "/placeholder.svg"}
          alt={meta.publisher}
          className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
        />
      ) : (
        <div className="w-6 h-6 bg-accent-brand rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {meta.publisher.charAt(0)}
        </div>
      )}

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground">
          <span className="font-semibold">{meta.publisher}</span>
          <span className="text-gray-600"> | {meta.title}</span>
        </span>
      </div>

      {/* Chevron Icon */}
      <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
    </a>
  )
}
