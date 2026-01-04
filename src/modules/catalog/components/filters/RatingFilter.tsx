"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface RatingFilterProps {
  selectedRating?: number
  onChange: (rating: number | undefined) => void
  counts?: Record<number, number>
}

export function RatingFilter({ selectedRating, onChange, counts }: RatingFilterProps) {
  const ratingOptions = [5, 4, 3, 2, 1]

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1.5 text-sm text-gray-600">&amp; up</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <RadioGroup
        value={selectedRating?.toString()}
        onValueChange={(value) => onChange(value ? parseInt(value) : undefined)}
      >
        {ratingOptions.map((rating) => (
          <div key={rating} className="flex items-center space-x-3">
            <RadioGroupItem
              value={rating.toString()}
              id={`rating-${rating}`}
              className="data-[state=checked]:border-orange-600 data-[state=checked]:text-orange-600"
            />
            <Label
              htmlFor={`rating-${rating}`}
              className="flex-1 cursor-pointer flex items-center justify-between"
            >
              {renderStars(rating)}
              {counts?.[rating] !== undefined && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts[rating]}
                </Badge>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedRating && (
        <button
          onClick={() => onChange(undefined)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear Rating Filter
        </button>
      )}
    </div>
  )
}

