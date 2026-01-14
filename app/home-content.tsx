"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  seller: string
  imageUrl: string
  company?: string
  link?: string
}

interface CompanyInfo {
  company: string
  logo: string
  title: string
  description: string
}

const getCompanyName = (company?: string, seller?: string): string => {
  return company || seller || "판매자"
}

const getCompanyLogo = (company: string): string => {
  return company.charAt(0)
}

const getProductLink = (index: number): string => {
  const links = [
    "https://brand.naver.com/atez/products/12410254221?NaPm=ct%3Dmkdf1llc%7Cci%3D26ac4a334957f5d4ea7eb5ca22ae315f3e2f82a1%7Ctr%3Dslslsp%7Csn%3D12125186%7Chk%3D060849b8d067cd7e9023fd63fbd96cd28d2fad18&nl-au=3c06864a95844a4db31bb084ca377fda&nl-query=%EB%B0%94%EC%A7%80",
    "https://www.musinsa.com/products/2307747?srsltid=AfmBOoqKAzPzX8JoR8YSJ-ocqwsEIlM8m57BWizWgqv2wjDqBwBkpXYo-zo",
  ]
  return links[index % links.length]
}

const getProductTitle = (link?: string, productName?: string): string => {
  if (!link) return productName || "상품"

  // Extract product name from common e-commerce URLs
  if (link.includes("coupang")) {
    const match = link.match(/[?&]q=([^&]+)/)
    if (match) return decodeURIComponent(match[1])
  }
  if (link.includes("naver")) {
    const match = link.match(/[?&]query=([^&]+)/)
    if (match) return decodeURIComponent(match[1])
  }

  return productName || "상품"
}

const getCompanyIcon = (company: string, logo?: string): React.ReactNode => {
  if (logo) {
    return (
      <img
        src={logo || "/placeholder.svg"}
        alt={company}
        className="w-5 h-5 rounded-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    )
  }

  switch (company) {
    case "쿠팡":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#FF6B6B" />
          <text x="12" y="15" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
            쿠
          </text>
        </svg>
      )
    case "네이버":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <rect width="24" height="24" fill="#00C73C" />
          <text x="12" y="15" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
            네
          </text>
        </svg>
      )
    case "메시":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#4267B2" />
          <text x="12" y="15" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
            메
          </text>
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#9CA3AF" />
          <text x="12" y="15" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
            {company.charAt(0)}
          </text>
        </svg>
      )
  }
}

export default function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [companyCache, setCompanyCache] = useState<Map<string, CompanyInfo>>(new Map())
  const [loading, setLoading] = useState(true)
  const hasInitializedRef = useRef(false)

  const fetchCompanyMetadata = async (url: string): Promise<CompanyInfo> => {
    try {
      const response = await fetch("/api/link-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          company: data.company || "판매자",
          logo: data.logo || "",
          title: data.title || "",
          description: data.description || "",
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch company metadata:", error)
    }

    return { company: "판매자", logo: "", title: "", description: "" }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://e153e320-4faa-4d1b-acbb-3196e5a4ecd6.mock.pstmn.io/products")
      const data = await response.json()
      const productsWithLinks = (data.products || []).map((product: Product, index: number) => ({
        ...product,
        link: getProductLink(index),
      }))
      setProducts(productsWithLinks)

      const newCache = new Map(companyCache)
      for (const product of productsWithLinks) {
        if (product.link && !newCache.has(product.link)) {
          const metadata = await fetchCompanyMetadata(product.link)
          newCache.set(product.link, metadata)
        }
      }
      setCompanyCache(newCache)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasInitializedRef.current) {
      fetchProducts()
      hasInitializedRef.current = true
    }
  }, [])

  useEffect(() => {
    const refresh = searchParams.get("refresh")
    if (refresh === "true") {
      fetchProducts()
      router.replace("/") // Remove the refresh param
    }
  }, [searchParams, router])

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10 border-b">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-accent-brand">아마따</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 pb-32">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-brand"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const metadata = product.link ? companyCache.get(product.link) : undefined
                const ogImage = metadata?.logo
                const ogTitle = metadata?.title || product.name
                const ogDescription = metadata?.description

                return (
                  <div
                    key={product.id}
                    className="flex gap-3 p-4 bg-white rounded-lg border border-border hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-2">{product.name}</h3>
                        {/* OG Information Row - Wrapped in anchor tag to make it clickable */}
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 mt-2 min-w-0 overflow-hidden hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          {ogImage && (
                            <img
                              src={ogImage || "/placeholder.svg"}
                              alt="og-image"
                              className="w-6 h-6 flex-shrink-0 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          )}
                          <p className="text-xs text-gray-600 truncate">
                            <span className="font-medium">{ogTitle}</span>
                            {ogDescription && (
                              <>
                                <span> · </span>
                                <span>{ogDescription}</span>
                              </>
                            )}
                          </p>
                        </a>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-accent-brand">₩{product.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Link href="/create" className="fixed bottom-0 right-0">
        <button
          className="fab-button m-6 w-14 h-14 rounded-full bg-accent-brand text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-50"
          aria-label="Add new product"
        >
          <Plus size={24} />
        </button>
      </Link>
    </div>
  )
}
