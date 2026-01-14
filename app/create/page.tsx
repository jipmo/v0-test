"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    seller: "",
    imageUrl: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://e153e320-4faa-4d1b-acbb-3196e5a4ecd6.mock.pstmn.io/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number.parseInt(formData.price),
          seller: formData.seller,
          imageUrl: formData.imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("상품 추가에 실패했습니다")
      }

      router.push("/?refresh=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10 border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <button className="p-1 hover:bg-muted rounded-md transition-colors" aria-label="Go back">
              <ArrowLeft size={24} className="text-foreground" />
            </button>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">상품 추가</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              상품명 *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="상품명을 입력하세요"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
              가격 (원) *
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="가격을 입력하세요"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          {/* Seller */}
          <div>
            <label htmlFor="seller" className="block text-sm font-medium text-foreground mb-2">
              판매자 *
            </label>
            <input
              id="seller"
              type="text"
              name="seller"
              value={formData.seller}
              onChange={handleChange}
              required
              placeholder="판매자명을 입력하세요"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-2">
              이미지 URL
            </label>
            <input
              id="imageUrl"
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="이미지 URL을 입력하세요"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-brand"
            />
          </div>

          {/* Image Preview */}
          {formData.imageUrl && (
            <div className="rounded-md overflow-hidden border border-input bg-muted p-2">
              <img
                src={formData.imageUrl || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-40 object-cover rounded"
                onError={() => setError("이미지를 불러올 수 없습니다")}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-accent-brand text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity mt-6"
          >
            {loading ? "추가 중..." : "상품 추가"}
          </button>
        </form>
      </main>
    </div>
  )
}
