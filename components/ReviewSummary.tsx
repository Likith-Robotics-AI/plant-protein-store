// @ts-nocheck
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  productId: string;
  averageRating: number;
  reviewCount: number;
  onWriteReview: () => void;
}

export default async function ReviewSummary({ productId, averageRating, reviewCount, onWriteReview }: Props) {
  // Fetch rating distribution
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  const ratingCounts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews?.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating]++;
    }
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-black text-gray-900 mb-6">Customer Reviews & Ratings</h2>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-6">
        {/* Large Rating Display */}
        <div className="text-center">
          <div className="text-6xl font-black text-gray-900 mb-2">
            {reviewCount > 0 ? averageRating.toFixed(1) : 'N/A'}
          </div>
          <div className="flex gap-1 justify-center mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(averageRating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution Bars */}
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating];
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="text-xs font-semibold text-gray-600 w-12 flex items-center gap-1">
                  {rating}
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 w-12 text-right">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review CTA - This will be a client component button */}
      <div className="border-t border-gray-200 pt-6">
        <p className="text-sm text-gray-600 mb-3">
          Share your experience to help other customers and{' '}
          <span className="font-bold text-green-600">get 10% off your next order!</span>
        </p>
        {/* Button placeholder - will be replaced with client component */}
        <div id="write-review-button"></div>
      </div>
    </div>
  );
}
