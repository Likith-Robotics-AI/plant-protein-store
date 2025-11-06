// @ts-nocheck
'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Check, Image as ImageIcon } from 'lucide-react';
import { Review } from '@/lib/types';
import Image from 'next/image';

interface Props {
  review: Review;
}

export default function ReviewCard({ review }: Props) {
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleHelpful = async () => {
    if (helpful) return; // Already voted

    // Optimistic UI update
    setHelpful(true);
    setHelpfulCount((prev) => prev + 1);

    // Update database
    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id }),
      });

      if (!response.ok) {
        // Revert on error
        setHelpful(false);
        setHelpfulCount((prev) => prev - 1);
      }
    } catch (error) {
      // Revert on error
      setHelpful(false);
      setHelpfulCount((prev) => prev - 1);
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{review.user_name}</span>
              {review.verified_purchase && (
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  <Check className="w-3 h-3" />
                  Verified Purchase
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">{timeAgo(review.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <h4 className="font-bold text-gray-900 mb-2 text-base">{review.title}</h4>
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>

        {/* Photo Thumbnails */}
        {review.photo_urls && review.photo_urls.length > 0 && (
          <div className="flex gap-2 mb-4">
            {review.photo_urls.map((url, index) => (
              <button
                key={index}
                onClick={() => setSelectedPhoto(url)}
                className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-600 transition-all"
              >
                <Image
                  src={url}
                  alt={`Review photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Helpful Button */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleHelpful}
            disabled={helpful}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              helpful
                ? 'bg-green-50 text-green-700 cursor-default'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${helpful ? 'fill-green-700' : ''}`} />
            Helpful ({helpfulCount})
          </button>
          <span className="text-xs text-gray-500">Was this review helpful?</span>
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedPhoto}
              alt="Review photo"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
