'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ReviewCard from './ReviewCard';
import { Review } from '@/lib/types';

interface Props {
  productId: string;
  limit?: number;
}

export default function ReviewsList({ productId, limit = 6 }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'approved')
          .order('helpful_count', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          // Silently handle error - reviews table might not exist yet or RLS not configured
          setReviews([]);
          setLoading(false);
          return;
        }

        setReviews(data || []);
      } catch (err) {
        // Silently fail - show "No reviews" instead of error state
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productId, limit]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        <p className="text-gray-600 mt-4">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load reviews at this time.</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-600 mb-2">No reviews yet</p>
        <p className="text-sm text-gray-500">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: Review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {reviews.length === limit && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">Showing {limit} most helpful reviews</p>
        </div>
      )}
    </div>
  );
}
