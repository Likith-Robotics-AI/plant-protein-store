'use client';

import { useState, useRef } from 'react';
import { X, Star, Upload, Check, AlertCircle, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateReviewDiscountCode, getDiscountExpiryDate, REVIEW_DISCOUNT, formatExpiryDate } from '@/lib/discount-codes';
import Image from 'next/image';

interface Props {
  productId: string;
  productName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WriteReviewModal({ productId, productName, onClose, onSuccess }: Props) {
  // Verification states
  const [verificationStep, setVerificationStep] = useState<'email' | 'verified' | 'form'>('email');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [purchaseVerified, setPurchaseVerified] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);

  // Form states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingEmail(true);
    setVerificationError('');

    try {
      const response = await fetch('/api/reviews/verify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, productId }),
      });

      const data = await response.json();

      if (data.verified && data.hasPurchased) {
        setPurchaseVerified(true);
        setPurchaseDate(data.purchaseDate);
        setVerificationStep('form');
      } else {
        setVerificationError(data.message || 'No purchase found for this product with your email address.');
      }
    } catch (error) {
      setVerificationError('Failed to verify purchase. Please try again.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 5MB per photo.`);
        return false;
      }
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(`${file.name} is not a valid image format. Use JPG, PNG, or WEBP.`);
        return false;
      }
      return true;
    });

    // Limit to 3 photos total
    const newPhotos = [...photos, ...validFiles].slice(0, 3);
    setPhotos(newPhotos);

    // Generate previews
    const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const filename = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${
        photo.type.split('/')[1]
      }`;

      const { data, error } = await supabase.storage
        .from('review-photos')
        .upload(filename, photo, {
          contentType: photo.type,
          upsert: false,
        });

      if (error) {
        console.error('Photo upload error:', error);
        throw new Error('Failed to upload photo');
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload photos first
      const photoUrls = await uploadPhotos();

      // Generate discount code
      const code = generateReviewDiscountCode();
      const expiry = getDiscountExpiryDate();

      // Submit review
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_name: name,
        user_email: email,
        rating,
        title,
        comment,
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
        verified_purchase: purchaseVerified,
        purchase_date: purchaseDate,
        status: 'approved', // Auto-approved per your choice
        discount_code: code,
        discount_expires_at: expiry.toISOString(),
      });

      if (error) throw error;

      // Success!
      setDiscountCode(code);
      setExpiryDate(formatExpiryDate(expiry));
      setSubmitted(true);

      // Call success callback after 3 seconds
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 5000);
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Failed to submit review. Please try again.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-700 mb-6">Your review has been published successfully.</p>

          {/* Discount Code Reward */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-black text-gray-900">Your Reward!</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">Here's your {REVIEW_DISCOUNT.percentage}% discount code:</p>
            <div className="bg-white border-2 border-dashed border-green-600 rounded-lg p-4 mb-3">
              <div className="text-2xl font-black text-green-600 tracking-wider">{discountCode}</div>
            </div>
            <p className="text-xs text-gray-600">
              Valid until {expiryDate}
              <br />
              One-time use on your next order
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Email Verification Step
  if (verificationStep === 'email') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">Verify Purchase</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              To ensure authentic reviews, please enter the email address you used when purchasing <span className="font-bold">{productName}</span>.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Why do we verify?</p>
                <p>We verify purchases to maintain trust and authenticity in our review system. Only verified purchasers can submit reviews.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="your.email@example.com"
                required
                disabled={verifyingEmail}
              />
            </div>

            {verificationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{verificationError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={verifyingEmail || !email}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {verifyingEmail ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Purchase'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-black text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Reviewing: <span className="font-bold text-gray-900">{productName}</span>
            </p>
          </div>

          {/* Incentive Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Get {REVIEW_DISCOUNT.percentage}% Off!</h3>
                <p className="text-sm text-gray-700">
                  Receive a unique discount code instantly after submitting your review.
                </p>
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Rating * <span className="text-red-500">required</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      i <= (hoverRating || rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-600 ml-2 self-center">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Your Name * <span className="text-red-500">required</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="e.g., Sarah M."
              required
            />
            <p className="text-xs text-gray-500 mt-1">This will be displayed publicly with your review</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Email Address * <span className="text-red-500">required</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send your discount code here. Not displayed publicly.
            </p>
          </div>

          {/* GDPR Consent */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <input
              type="checkbox"
              id="gdpr-consent"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="gdpr-consent" className="text-sm text-gray-700">
              <span className="font-bold">Privacy Policy:</span> I consent to LIVOZA storing my email address for the
              purpose of sending my discount code and potentially following up about my review. My email will not be
              shared with third parties or used for marketing without my permission.{' '}
              <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Review Title * <span className="text-red-500">required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Great taste, mixes well"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Your Review * <span className="text-red-500">required</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              placeholder="Tell us about your experience with this product... What did you like? How do you use it? Any tips for other customers?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              minLength={50}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length} characters (minimum 50)</p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Add Photos (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-600 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop photos or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 font-bold hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">Max 3 photos, 5MB each (JPG, PNG, WEBP)</p>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="flex gap-3 mt-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={!rating || !gdprConsent || submitting || comment.length < 50}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-black text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </span>
              ) : (
                `Submit Review & Get ${REVIEW_DISCOUNT.percentage}% Off`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
