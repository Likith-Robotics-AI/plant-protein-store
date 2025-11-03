'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useSearch } from '@/lib/search-context';
import { supabase } from '@/lib/supabase';
import { Star, Award, Shield, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { addToCart } = useCart();
  const { searchQuery } = useSearch();

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Offers ticker state
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=400&fit=crop",
      alt: "Delicious protein shake",
      title: "25g Plant Protein",
      subtitle: "Per Serving"
    },
    {
      url: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=400&fit=crop",
      alt: "Healthy lifestyle",
      title: "Real Fruit Powder",
      subtitle: "No Artificial Flavours"
    },
    {
      url: "https://images.unsplash.com/photo-1567694191700-56b1be0b5d8f?w=500&h=400&fit=crop",
      alt: "Product range",
      title: "Zero Artificial",
      subtitle: "Pure Ingredients"
    },
    {
      url: "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=500&h=400&fit=crop",
      alt: "Fitness nutrition",
      title: "Sustainable & Ethical",
      subtitle: "From Trusted Farms"
    }
  ];

  const offers = [
    {
      icon: "🔥",
      badge: "FLASH SALE",
      badgeColor: "bg-white text-red-600",
      message: "Buy 1 Get 2nd HALF PRICE!",
      gradient: "from-red-600 via-orange-500 to-yellow-500"
    },
    {
      icon: "🚚",
      badge: "FREE SHIPPING",
      badgeColor: "bg-white text-green-600",
      message: "On Orders Over £30!",
      gradient: "from-green-600 via-emerald-500 to-teal-500"
    },
    {
      icon: "📦",
      badge: "BULK SAVINGS",
      badgeColor: "bg-white text-purple-600",
      message: "Up to 20% OFF on Bulk Orders!",
      gradient: "from-purple-600 via-violet-500 to-indigo-500"
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate offers ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4000); // Change offer every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, activeFilter, searchQuery]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.flavor.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Then apply category filters
    if (activeFilter === 'all') {
      setFilteredProducts(filtered);
    } else if (activeFilter === 'popular') {
      // Sort by stock (assuming popular = high stock)
      filtered = filtered.sort((a, b) => b.stock - a.stock).slice(0, 8);
      setFilteredProducts(filtered);
    } else if (activeFilter === 'new') {
      // Show newest first
      filtered = filtered.slice(0, 8);
      setFilteredProducts(filtered);
    } else if (activeFilter === 'fruit-flavour') {
      filtered = filtered.filter(p => ['vanilla', 'berry', 'green', 'strawberry', 'mango'].includes(p.flavor));
      setFilteredProducts(filtered);
    } else if (activeFilter === 'chocolate') {
      filtered = filtered.filter(p => p.flavor === 'chocolate' || p.flavor.includes('chocolate'));
      setFilteredProducts(filtered);
    } else if (activeFilter === 'chocolate-fusion') {
      filtered = filtered.filter(p => p.flavor.includes('chocolate') || p.name.toLowerCase().includes('chocolate'));
      setFilteredProducts(filtered);
    } else if (activeFilter === 'protein-powder') {
      filtered = filtered.filter(p => p.category === 'protein-powder');
      setFilteredProducts(filtered);
    } else if (activeFilter === 'protein-bar') {
      filtered = filtered.filter(p => p.category === 'protein-bar');
      setFilteredProducts(filtered);
    } else if (activeFilter === 'ready-to-drink') {
      filtered = filtered.filter(p => p.category === 'ready-to-drink');
      setFilteredProducts(filtered);
    } else if (activeFilter === 'protein-snack') {
      filtered = filtered.filter(p => p.category === 'protein-snack');
      setFilteredProducts(filtered);
    } else {
      // Filter by flavor
      filtered = filtered.filter(p => p.flavor === activeFilter);
      setFilteredProducts(filtered);
    }
  };

  const handleAddToCart = async (product: Product) => {
    addToCart(product);

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'add_to_cart',
          product_id: product.id,
          page: '/',
        }),
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const filterOptions = [
    { id: 'all', label: 'All Products', icon: '🌟' },
    { id: 'popular', label: 'Popular', icon: '🔥' },
    { id: 'new', label: 'New Arrivals', icon: '✨' },
    { id: 'fruit-flavour', label: 'Fruit Flavours', icon: '🍓' },
    { id: 'chocolate', label: 'Chocolate', icon: '🍫' },
    { id: 'chocolate-fusion', label: 'Chocolate Fusion', icon: '🎯' },
    { id: 'protein-powder', label: 'Protein Powders', icon: '💪' },
    { id: 'protein-bar', label: 'Protein Bars', icon: '🍫' },
    { id: 'ready-to-drink', label: 'Ready to Drink', icon: '🥤' },
    { id: 'protein-snack', label: 'Protein Snacks', icon: '🍪' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fitness Enthusiast',
      rating: 5,
      text: 'Best plant protein I\'ve ever tried! The vanilla blend is absolutely delicious and keeps me energized throughout my workouts.',
      image: 'https://i.pravatar.cc/150?img=1'
    },
    {
      name: 'Mike Chen',
      role: 'Yoga Instructor',
      rating: 5,
      text: 'Love the natural ingredients! No artificial sweeteners, just pure plant-based goodness. The berry flavor is my favorite!',
      image: 'https://i.pravatar.cc/150?img=33'
    },
    {
      name: 'Emma Davis',
      role: 'Nutritionist',
      rating: 5,
      text: 'I recommend these products to all my clients. Great protein content, excellent taste, and ethically sourced ingredients.',
      image: 'https://i.pravatar.cc/150?img=5'
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-0">
      {/* Single Rotating Offer Ticker - Sticky Below Header */}
      <div className={`bg-gradient-to-r ${offers[currentOfferIndex].gradient} text-white py-3 overflow-hidden sticky top-[64px] z-40 transition-all duration-1000 w-full`}>
        <div className="container mx-auto px-4">
          <button
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-3 w-full hover:scale-105 transition-transform text-base font-bold"
          >
            <span className="text-2xl">{offers[currentOfferIndex].icon}</span>
            <span className={`${offers[currentOfferIndex].badgeColor} px-3 py-1.5 rounded-full font-black`}>
              {offers[currentOfferIndex].badge}
            </span>
            <span>{offers[currentOfferIndex].message}</span>

            {/* Offer indicator dots */}
            <span className="hidden sm:flex items-center gap-1.5 ml-4">
              {offers.map((_, index) => (
                <span
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentOfferIndex ? 'bg-white w-6' : 'bg-white/40'
                  }`}
                />
              ))}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Section - Original Vibrant Design */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-green-500 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">

            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-block bg-yellow-400 text-primary-900 px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-lg">
                100% Plant-Based Nutrition
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight">
                Fuel Your Body with<br />
                <span className="text-yellow-300">Pure Plant Power</span>
              </h1>

              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Premium plant protein with real fruit powder. 25g protein per serving.
              </p>

              {/* Key Product Stats */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                  <div className="text-3xl font-black text-primary-700">25g</div>
                  <div className="text-xs font-bold text-gray-700">Protein</div>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                  <div className="text-3xl font-black text-green-600">0g</div>
                  <div className="text-xs font-bold text-gray-700">Sugar</div>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                  <div className="text-3xl font-black text-blue-600">100</div>
                  <div className="text-xs font-bold text-gray-700">Calories</div>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                  <div className="text-lg font-black text-purple-600">From</div>
                  <div className="text-xs font-bold text-gray-700">£19.99</div>
                </div>
              </div>

              {/* Enhanced CTA Section */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-6">
                <button
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative bg-gradient-to-r from-yellow-400 to-yellow-300 text-primary-900 px-10 py-4 rounded-xl font-black text-lg hover:from-yellow-300 hover:to-yellow-200 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 animate-pulse-slow w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Shop Now - Limited Stock
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/90 hover:text-white underline font-semibold text-base transition-all"
                >
                  4.8★ from 1,234 reviews →
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl mb-1">✓</div>
                  <div className="text-xs font-bold">Certified Organic</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="text-xs font-bold">Free Shipping £30+</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-2xl mb-1">↩️</div>
                  <div className="text-xs font-bold">30-Day Returns</div>
                </div>
              </div>

              {/* Social Proof Badge */}
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 text-sm text-white/80">
                  <span className="animate-pulse">🔥</span>
                  <span className="font-semibold">10,000+ Happy Customers</span>
                  | Order before 2pm for next-day delivery
                </span>
              </div>
            </div>

            {/* Right Side - Revolving Carousel Images */}
            <div className="relative lg:mt-0 mt-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Main Carousel Image */}
                <div className="relative h-64 md:h-80 lg:h-96">
                  {carouselImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                        priority={index === 0}
                        quality={85}
                      />
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                      {/* Text Overlay */}
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h3 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-lg">{image.title}</h3>
                        <p className="text-lg md:text-xl font-bold drop-shadow-lg">{image.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 transition"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 transition"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Carousel Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Clean Benefits Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">25g Protein</h3>
                <p className="text-gray-600 text-sm">Complete amino acid profile from premium plant sources</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Plant Power</h3>
                <p className="text-gray-600 text-sm">Essential vitamins & minerals from real plants</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Real Fruit</h3>
                <p className="text-gray-600 text-sm">Authentic taste, no artificial flavors</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sustainable</h3>
                <p className="text-gray-600 text-sm">Ethically sourced from trusted farms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section - Moved to Top */}
      <div id="products" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-gray-900">Our Premium Collection</h2>
            <p className="text-xl text-gray-600">Choose from our range of delicious plant-based proteins</p>
          </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                activeFilter === filter.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Testimonials Section - Visual */}
      <div id="testimonials" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4">⭐ Customer Love</h2>
            <div className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-800">
              <span className="text-yellow-400">★★★★★</span>
              <span>4.8/5</span>
              <span className="text-gray-400">from</span>
              <span className="text-primary-600">1,234 reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition text-center relative">
                {/* Verified Badge */}
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  ✓ Verified Purchase
                </div>

                <div className="relative w-28 h-28 mx-auto mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={112}
                    height={112}
                    className="rounded-full border-4 border-primary-200"
                    loading="lazy"
                  />
                </div>

                <div className="flex gap-1 mb-3 justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <h3 className="font-black text-xl mb-1">{testimonial.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{testimonial.role}</p>
                <p className="text-gray-400 text-xs mb-4">Reviewed on {new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-gray-700 italic text-lg leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story & Why We're Different - Shortened */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

            {/* Our Story Section */}
            <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-8 md:p-10 shadow-lg">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Our Story
              </h2>

              <div className="space-y-4 text-base text-gray-800 leading-relaxed">
                <p>
                  We created LIVOZA because we believe healthy nutrition shouldn't mean compromising on taste or the planet. Using real fruit powder instead of artificial flavors, we've crafted protein that's pure, powerful, and delicious.
                </p>
                <p>
                  Every scoop delivers 25g of premium plant protein with all essential nutrients intact. No fillers, no shortcuts—just honest nutrition from sustainable sources.
                </p>
                <div className="pt-4">
                  <Link href="/about" className="text-primary-600 hover:text-primary-700 transition-colors font-bold underline inline-flex items-center gap-2">
                    Read our full story →
                  </Link>
                </div>
              </div>
            </div>

            {/* Why We're Different Section */}
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border-2 border-primary-100">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Why Choose LIVOZA
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Nutrition</h3>
                  <p className="text-gray-700 text-sm">Full amino acid profile with vitamins, fiber, and antioxidants preserved through gentle processing.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Real Ingredients</h3>
                  <p className="text-gray-700 text-sm">Actual fruit powder, not artificial flavors. What you see on the label is what's in the product.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sustainably Sourced</h3>
                  <p className="text-gray-700 text-sm">Premium ingredients from ethical farms worldwide. Good for you, good for the planet.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
