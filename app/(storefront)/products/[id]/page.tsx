'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import {
  ShoppingCart,
  ChevronLeft,
  Check,
  Leaf,
  Shield,
  Award,
  Heart,
  Truck,
  Clock,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react';
import WriteReviewModal from '@/components/WriteReviewModal';
import ReviewsList from '@/components/ReviewsList';
import TimeTracker from '@/components/admin/TimeTracker';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const weightOptions = [1, 2, 3, 4, 5];

  const getWeightDiscount = (weight: number): number => {
    if (weight >= 5) return 0.20;
    if (weight >= 4) return 0.15;
    if (weight >= 3) return 0.10;
    if (weight >= 2) return 0.05;
    return 0;
  };

  const calculatePrice = (): { basePrice: number; discount: number; finalPrice: number; savings: number } => {
    if (!product) return { basePrice: 0, discount: 0, finalPrice: 0, savings: 0 };
    const pricePerKg = product.price;
    const basePrice = pricePerKg * selectedWeight;
    const discount = getWeightDiscount(selectedWeight);
    const finalPrice = basePrice * (1 - discount);
    const savings = basePrice - finalPrice;
    return { basePrice, discount, finalPrice, savings };
  };

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    const imageCount = getImageGallery(product).length;
    if (imageCount <= 1) return;
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % imageCount);
    }, 3000);
    return () => clearInterval(interval);
  }, [product]);

  const fetchProduct = async (id: string) => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Stock validation
    if (product.stock < selectedWeight) {
      alert(`Sorry, only ${product.stock}kg available in stock.`);
      return;
    }

    // Add to cart with selected weight
    addToCart(product, selectedWeight);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getImageGallery = (product: Product): { url: string; label: string }[] => {
    const gallery = [{ url: product.image_url, label: 'Product' }];
    if (product.images?.package) gallery.push({ url: product.images.package, label: 'Packaging' });
    if (product.images?.back) gallery.push({ url: product.images.back, label: 'Ingredients' });
    if (product.images?.result) gallery.push({ url: product.images.result, label: 'Prepared' });
    return gallery;
  };

  const proteinPercentage = product?.protein && product?.servingSize
    ? ((product.protein / product.servingSize) * 100).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <div className="text-xl font-semibold text-gray-600">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
          <button onClick={() => router.push('/products')} className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  const imageGallery = getImageGallery(product);
  const benefits = product.benefits || ['Supports muscle growth and recovery', 'High-quality plant-based protein source', 'Easy to digest and absorb', 'Free from artificial additives', 'Sustainably sourced ingredients'];
  const usageInstructions = product.usage_instructions || `Mix 1-2 scoops (30-60g) with 200-300ml of water, milk, or your favorite beverage.\n\nBest consumed:\n• Post-workout for muscle recovery\n• As a meal replacement\n• Between meals as a protein boost\n\nTip: Blend with fruits and vegetables for a delicious smoothie!`;
  const storageInstructions = product.storage_instructions || 'Store in a cool, dry place away from direct sunlight. Keep container tightly closed after use. Best consumed within 3 months of opening.';
  const allergens = product.allergens || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Time Tracker */}
      <TimeTracker page={`/products/${product.id}`} productId={product.id} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-semibold group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - Product Gallery (Larger) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 self-start">
              {/* Main Image - LARGER */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden relative group mb-4" style={{ height: '650px' }}>
                <div className="relative h-full">
                  <Image
                    src={imageGallery[selectedImage].url}
                    alt={imageGallery[selectedImage].label}
                    fill
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                    priority
                  />

                  {/* Urgency Badge */}
                  {product.stock < 20 && product.stock > 0 && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl animate-pulse">
                      🔥 Only {product.stock} left!
                    </div>
                  )}

                  {/* Trust Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-gray-900">Money-Back Guarantee</span>
                    </div>
                  </div>

                  {/* Review Badge */}
                  {product.average_rating && product.average_rating > 0 && (
                    <div className="absolute bottom-4 right-4 bg-yellow-400 text-gray-900 px-3 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gray-900" />
                        <span className="text-sm font-black">{product.average_rating.toFixed(1)}</span>
                        <span className="text-xs font-semibold">({product.review_count})</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails - Horizontal */}
              {imageGallery.length > 1 && (
                <div className="flex gap-2">
                  {imageGallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index
                          ? 'border-primary-600 ring-2 ring-primary-200 scale-105'
                          : 'border-gray-200 hover:border-primary-400'
                      }`}
                    >
                      <Image src={img.url} alt={img.label} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Conversion-Optimized Info */}
          <div className="lg:col-span-1 space-y-3">
            {/* Consolidated Product Card */}
            <div className="bg-white rounded-xl p-4 lg:p-5 shadow-lg">
              {/* Social Proof Banner */}
              {product.review_count && product.review_count > 5 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">{String.fromCharCode(64 + i)}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-green-800">
                      <span className="font-black">{product.review_count}+</span> customers love this product!
                    </span>
                  </div>
                </div>
              )}

              {/* Header Row with Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                  {product.flavor}
                </span>
                {product.average_rating && product.average_rating > 0 ? (
                  <button
                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-1.5 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full hover:bg-yellow-500 transition-colors shadow-md"
                  >
                    <Star className="w-3.5 h-3.5 fill-gray-900" />
                    <span className="text-xs font-black">{product.average_rating.toFixed(1)}</span>
                    <span className="text-xs font-bold">({product.review_count} reviews)</span>
                  </button>
                ) : null}
                {product.stock < 50 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Product Name with Value Prop */}
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-1 leading-tight">{product.name}</h1>
              <p className="text-sm text-primary-600 font-bold mb-2">✓ Premium Plant-Based Nutrition</p>
              <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-3">{product.description}</p>

              {/* Nutrition Highlights - Per Serving */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2 font-semibold">Per Serving (30g)</div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-lg font-black text-white">{String(product.nutrition_info.protein).replace(/[^0-9]/g, '')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">Protein</div>
                      <div className="text-xs font-bold text-gray-900">grams</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-lg font-black text-white">{String(product.nutrition_info.calories).replace(/[^0-9]/g, '')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">Calories</div>
                      <div className="text-xs font-bold text-gray-900">kcal</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-lg font-black text-white">{proteinPercentage ? proteinPercentage : String(product.nutrition_info.fiber || '0').replace(/[^0-9]/g, '')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{proteinPercentage ? 'Protein %' : 'Fiber'}</div>
                      <div className="text-xs font-bold text-gray-900">{proteinPercentage ? 'of total' : 'grams'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight & Price Selector - Integrated */}
              {(() => {
                const pricing = calculatePrice();
                return (
                  <div className="space-y-2">
                    {/* Weight Pills */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Select Weight:</span>
                      <div className="flex gap-1.5 flex-1">
                        {weightOptions.map((weight) => {
                          const discount = getWeightDiscount(weight);
                          const isSelected = selectedWeight === weight;
                          return (
                            <button
                              key={weight}
                              onClick={() => setSelectedWeight(weight)}
                              className={`relative flex-1 py-2 px-2 rounded-lg font-bold text-center transition-all duration-200 overflow-visible ${
                                isSelected
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md scale-105'
                                  : discount > 0
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 text-gray-900 hover:from-green-100 hover:to-emerald-100'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <div className="text-base font-black">{weight}kg</div>
                              {discount > 0 && (
                                <div className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md text-[10px] font-black shadow-lg ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 animate-pulse'
                                    : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                }`}>
                                  -{(discount * 100).toFixed(0)}%
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price & CTA Side by Side */}
                    <div className="flex gap-2 items-stretch">
                      {/* Price Display */}
                      <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 border border-gray-200 flex flex-col justify-center">
                        <div className="flex items-baseline gap-1.5 mb-0.5">
                          {pricing.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through">£{pricing.basePrice.toFixed(2)}</span>
                          )}
                          <span className="text-xl font-black text-gray-900">£{pricing.finalPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-gray-500">({selectedWeight}kg)</span>
                        </div>
                        {pricing.savings > 0 && (
                          <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold w-fit">
                            <Zap className="w-3 h-3" />
                            Save £{pricing.savings.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || addedToCart}
                        className={`flex-1 rounded-xl font-black text-base py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                          addedToCart
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                            : product.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-xl hover:shadow-2xl hover:scale-[1.02]'
                        }`}
                      >
                        {addedToCart ? (
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            <span>Added!</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-5 h-5" />
                              <span>Add to Cart</span>
                            </div>
                            <span className="text-[9px] font-semibold text-white/90 tracking-wide">SHIPS IN 24HRS</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Urgency Timer (if low stock) */}
              {product.stock < 20 && product.stock > 0 && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-xs text-center text-red-800 font-bold">
                    ⚡ Hurry! Only {product.stock} units left in stock
                  </p>
                </div>
              )}

              {/* Trust & Delivery Promises - Compact Grid */}
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700 bg-green-50 rounded-md p-1.5">
                  <Truck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span><span className="font-bold">FREE</span> over £30</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700 bg-blue-50 rounded-md p-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span><span className="font-bold">Ships</span> in 2-3 days</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700 bg-purple-50 rounded-md p-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                  <span><span className="font-bold">30-day</span> guarantee</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700 bg-yellow-50 rounded-md p-1.5">
                  <Award className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
                  <span><span className="font-bold">Lab-tested</span> certified</span>
                </div>
              </div>
            </div>

            {/* Product Details Accordion */}
            <div className="bg-white rounded-xl p-4 lg:p-5 shadow-lg space-y-2">
              {/* Benefits */}
              <details open className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none py-1.5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-green-600" />
                    Key Benefits
                  </h3>
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-400 transition-transform group-open:rotate-[-90deg]" />
                </summary>
                <div className="mt-2 pl-6">
                  <ul className="grid lg:grid-cols-2 gap-x-4 gap-y-1.5">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                        <div className="flex-shrink-0 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="flex-1">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              <hr className="border-gray-50" />

              {/* Nutrition Facts */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none py-1.5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-primary-600" />
                    Nutrition Facts
                  </h3>
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-400 transition-transform group-open:rotate-[-90deg]" />
                </summary>
                <div className="mt-2 pl-6">
                  <div className="max-w-xs">
                    <div className="border-2 border-gray-900 rounded-lg p-2.5 bg-white">
                      <div className="border-b-2 border-gray-900 pb-1 mb-1.5">
                        <div className="text-[10px] text-gray-700">Serving Size: <span className="font-bold">{product.nutrition_info.servingSize}</span></div>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between font-bold border-b border-gray-300 pb-0.5">
                          <span>Calories</span>
                          <span>{product.nutrition_info.calories}</span>
                        </div>
                        <div className="flex justify-between font-bold border-b border-gray-300 pb-0.5">
                          <span>Protein</span>
                          <span>{product.nutrition_info.protein}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-0.5">
                          <span>Carbs</span>
                          <span>{product.nutrition_info.carbs}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-0.5">
                          <span>Fat</span>
                          <span>{product.nutrition_info.fat}</span>
                        </div>
                        {product.nutrition_info.fiber && (
                          <div className="flex justify-between border-b border-gray-300 pb-0.5">
                            <span>Fiber</span>
                            <span>{product.nutrition_info.fiber}</span>
                          </div>
                        )}
                        {product.nutrition_info.sugar && (
                          <div className="flex justify-between">
                            <span>Sugar</span>
                            <span>{product.nutrition_info.sugar}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              <hr className="border-gray-50" />

              {/* Ingredients */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none py-1.5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-600" />
                    Ingredients
                  </h3>
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-400 transition-transform group-open:rotate-[-90deg]" />
                </summary>
                <div className="mt-2 pl-6">
                  <p className="text-xs text-gray-700 leading-relaxed">{product.ingredients}</p>
                </div>
              </details>

              <hr className="border-gray-50" />

              {/* Allergens */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none py-1.5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Allergen Info
                  </h3>
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-400 transition-transform group-open:rotate-[-90deg]" />
                </summary>
                <div className="mt-2 pl-6">
                  {allergens.length > 0 ? (
                    <div className="space-y-1.5">
                      {allergens.map((allergen, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-red-800 font-semibold">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                          {allergen}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <Check className="w-4 h-4 text-green-600" />
                      <p className="text-xs text-green-800 font-semibold">Allergen Free</p>
                    </div>
                  )}
                </div>
              </details>

              <hr className="border-gray-50" />

              {/* Usage */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none py-1.5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    How to Use
                  </h3>
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-400 transition-transform group-open:rotate-[-90deg]" />
                </summary>
                <div className="mt-2 pl-6">
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{usageInstructions}</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Reviews Section - Full Width */}
        <div id="reviews-section" className="mt-6 scroll-mt-20">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg">
            {/* Reviews Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-1">Customer Reviews</h2>
                <p className="text-xs text-gray-600">
                  See what our customers say and{' '}
                  <span className="font-bold text-green-600">get 10% off</span> when you write yours!
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-xs font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
              >
                Write a Review
              </button>
            </div>

            {/* Rating Summary */}
            {product.review_count && product.review_count > 0 ? (
              <div className="mb-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Large Rating Display */}
                  <div className="text-center">
                    <div className="text-4xl lg:text-5xl font-black text-gray-900 mb-1.5">
                      {product.average_rating?.toFixed(1)}
                    </div>
                    <div className="flex gap-0.5 justify-center mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <= Math.round(product.average_rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] font-semibold text-gray-600">
                      {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>

                  {/* Stars Distribution */}
                  <div className="flex-1 w-full max-w-xs">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-0.5 w-10">
                          <span className="text-[10px] font-bold text-gray-700">{stars}</span>
                          <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                        </div>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-600 w-5 text-right">0</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 text-center bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">No reviews yet - be the first!</p>
                <p className="text-[10px] text-green-600 font-semibold">Get 10% off your next order</p>
              </div>
            )}

            {/* Reviews List */}
            <div>
              <ReviewsList productId={product.id} limit={10} />
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <WriteReviewModal
          productId={product.id}
          productName={product.name}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            // Optionally refresh the page to show new review
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
