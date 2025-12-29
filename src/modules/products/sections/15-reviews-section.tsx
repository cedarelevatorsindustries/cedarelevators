"use client"

import { useState, forwardRef } from "react"
import { Star, ThumbsUp, CircleCheck, ChevronDown, ChevronUp, Image as ImageIcon, Filter } from "lucide-react"

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  verified?: boolean
  helpful?: number
  images?: string[]
}

interface ReviewsSectionProps {
  reviews: Review[]
  productId: string
}

const ReviewsSection = forwardRef<HTMLDivElement, ReviewsSectionProps>(
  ({ reviews, productId }, ref) => {
    const [showAll, setShowAll] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [filterRating, setFilterRating] = useState<number | 'all' | 'images'>('all')
    const [sortBy, setSortBy] = useState<'relevant' | 'recent' | 'helpful'>('relevant')
    const [newReview, setNewReview] = useState({
      rating: 5,
      name: '',
      comment: ''
    })

    const INITIAL_DISPLAY_COUNT = 3

    // Filter reviews
    const filteredReviews = reviews.filter(review => {
      if (filterRating === 'all') return true
      if (filterRating === 'images') return review.images && review.images.length > 0
      return review.rating === filterRating
    })

    // Sort reviews
    const sortedReviews = [...filteredReviews].sort((a, b) => {
      if (sortBy === 'helpful') return (b.helpful || 0) - (a.helpful || 0)
      if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime()
      return 0 // relevant - default order
    })

    const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, INITIAL_DISPLAY_COUNT)
    const hasMore = sortedReviews.length > INITIAL_DISPLAY_COUNT

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
    }))

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Submit review:', { ...newReview, productId })
      // TODO: Implement review submission
      setShowReviewForm(false)
      setNewReview({ rating: 5, name: '', comment: '' })
    }

    const reviewsWithImages = reviews.filter(r => r.images && r.images.length > 0).length

    return (
      <div ref={ref} className="bg-white rounded-xl p-6 lg:p-8 space-y-6 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4 border-2 border-blue-200 animate-slideDown">
            <h3 className="text-lg font-semibold text-gray-900">Share Your Experience</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="reviewName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  id="reviewName"
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  id="reviewComment"
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your experience with this product..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {reviews.length > 0 ? (
          <>
            {/* Rating Summary - Full Width */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-start gap-12">
                {/* Overall Rating */}
                <div className="flex flex-col items-center">
                  <div className="text-6xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-medium whitespace-nowrap">
                    {reviews.length} Ratings & {reviews.length} Reviews
                  </p>
                </div>

                {/* Rating Distribution - Takes remaining space */}
                <div className="flex-1 space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1 w-12">
                        {rating} <Star className="w-3 h-3 fill-current" />
                      </span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
              {/* Filter Buttons */}
              <button
                onClick={() => setFilterRating('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterRating === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              
              <button
                onClick={() => setFilterRating('images')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterRating === 'images'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                With Images ({reviewsWithImages})
              </button>

              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    filterRating === rating
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating} <Star className="w-3 h-3 fill-current" />
                </button>
              ))}

              {/* Sort Dropdown */}
              <div className="ml-auto flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevant">Sort by: Most relevant</option>
                  <option value="recent">Sort by: Most recent</option>
                  <option value="helpful">Sort by: Most helpful</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {displayedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  {/* Review Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {review.name?.charAt(0) || "?"}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{review.name || "Anonymous"}</p>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CircleCheck className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.images.map((image, idx) => (
                        <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={image}
                            alt={`Review image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  {review.helpful !== undefined && (
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  {showAll ? (
                    <>
                      Show Less
                      <ChevronUp className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Show All {reviews.length} Reviews
                      <ChevronDown className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No reviews yet</p>
            <p className="text-sm text-gray-600">Be the first to review this product!</p>
          </div>
        )}

        <style jsx>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}</style>
      </div>
    )
  }
)

ReviewsSection.displayName = 'ReviewsSection'

export default ReviewsSection
