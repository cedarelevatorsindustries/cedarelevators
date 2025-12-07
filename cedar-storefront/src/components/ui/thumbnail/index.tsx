import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: HttpTypes.StoreProductImage[] | null
  size?: "small" | "medium" | "large" | "full"
  className?: string
}

const Thumbnail = ({
  thumbnail,
  images,
  size = "small",
  className,
}: ThumbnailProps) => {
  const initialImage = thumbnail || images?.[0]?.url

  const sizeMap = {
    small: 64,
    medium: 128,
    large: 256,
    full: 512,
  }

  return (
    <div className={`relative aspect-square overflow-hidden ${className || ""}`}>
      {initialImage ? (
        <Image
          src={initialImage}
          alt="Product thumbnail"
          fill
          className="object-cover"
          sizes={`${sizeMap[size]}px`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <span className="text-gray-400">No image</span>
        </div>
      )}
    </div>
  )
}

export default Thumbnail
