'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useSearch } from '@/lib/search-context';
import { supabase } from '@/lib/supabase';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { searchQuery } = useSearch();

  // Filter states
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [minProtein, setMinProtein] = useState<number>(0);
  const [maxProtein, setMaxProtein] = useState<number>(30);
  const [minProteinPercentage, setMinProteinPercentage] = useState<number>(0);
  const [maxProteinPercentage, setMaxProteinPercentage] = useState<number>(100);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('name-asc');

  // UI states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    sort: true,
    flavors: true,
    categories: true,
    price: true,
    protein: true,
    percentage: true,
  });

  // Get price and protein bounds from data
  const dataBounds = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 100, minProtein: 0, maxProtein: 30 };

    const prices = products.map(p => p.price);
    const proteins = products.map(p => p.protein || 0);

    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
      minProtein: Math.floor(Math.min(...proteins)),
      maxProtein: Math.ceil(Math.max(...proteins)),
    };
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Initialize range sliders with actual data bounds
  useEffect(() => {
    if (products.length > 0) {
      setMinPrice(dataBounds.minPrice);
      setMaxPrice(dataBounds.maxPrice);
      setMinProtein(dataBounds.minProtein);
      setMaxProtein(dataBounds.maxProtein);
    }
  }, [dataBounds, products.length]);

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

  // Filtered and sorted products with proper memoization
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.flavor.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Flavor filter
    if (selectedFlavors.length > 0) {
      filtered = filtered.filter(p => selectedFlavors.includes(p.flavor));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Price range filter
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Protein range filter
    filtered = filtered.filter(p => {
      const protein = p.protein || 0;
      return protein >= minProtein && protein <= maxProtein;
    });

    // Protein percentage filter
    filtered = filtered.filter(p => {
      const percentage = ((p.protein || 0) / (p.servingSize || 30)) * 100;
      return percentage >= minProteinPercentage && percentage <= maxProteinPercentage;
    });

    // Sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'protein-asc':
        sorted.sort((a, b) => (a.protein || 0) - (b.protein || 0));
        break;
      case 'protein-desc':
        sorted.sort((a, b) => (b.protein || 0) - (a.protein || 0));
        break;
      case 'protein-percentage-desc':
        sorted.sort((a, b) => {
          const percentA = ((a.protein || 0) / (a.servingSize || 30)) * 100;
          const percentB = ((b.protein || 0) / (b.servingSize || 30)) * 100;
          return percentB - percentA;
        });
        break;
      case 'name-asc':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [products, searchQuery, selectedFlavors, selectedCategories, minPrice, maxPrice, minProtein, maxProtein, minProteinPercentage, maxProteinPercentage, sortBy]);

  const handleAddToCart = async (product: Product) => {
    addToCart(product);
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'add_to_cart',
          product_id: product.id,
          page: '/products',
        }),
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors(prev =>
      prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedFlavors([]);
    setSelectedCategories([]);
    setMinPrice(dataBounds.minPrice);
    setMaxPrice(dataBounds.maxPrice);
    setMinProtein(dataBounds.minProtein);
    setMaxProtein(dataBounds.maxProtein);
    setMinProteinPercentage(0);
    setMaxProteinPercentage(100);
    setSortBy('name-asc');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get unique flavors and categories with counts
  const flavorCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach(p => {
      counts[p.flavor] = (counts[p.flavor] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const uniqueFlavors = Object.keys(flavorCounts).sort();
  const uniqueCategories = Object.keys(categoryCounts).sort();

  const activeFiltersCount = selectedFlavors.length + selectedCategories.length +
    (minPrice !== dataBounds.minPrice || maxPrice !== dataBounds.maxPrice ? 1 : 0) +
    (minProtein !== dataBounds.minProtein || maxProtein !== dataBounds.maxProtein ? 1 : 0) +
    (minProteinPercentage !== 0 || maxProteinPercentage !== 100 ? 1 : 0);

  const FilterSection = () => (
    <div className="space-y-4">
      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full text-sm bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Sort */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between text-left mb-3"
        >
          <h3 className="font-bold text-gray-900">Sort By</h3>
          {expandedSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.sort && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="protein-desc">Protein: High to Low</option>
            <option value="protein-asc">Protein: Low to High</option>
            <option value="protein-percentage-desc">Protein %: High to Low</option>
          </select>
        )}
      </div>

      {/* Flavors */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('flavors')}
          className="w-full flex items-center justify-between text-left mb-3"
        >
          <h3 className="font-bold text-gray-900">
            Flavors {selectedFlavors.length > 0 && <span className="text-primary-600">({selectedFlavors.length})</span>}
          </h3>
          {expandedSections.flavors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.flavors && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uniqueFlavors.map(flavor => (
              <label key={flavor} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={selectedFlavors.includes(flavor)}
                  onChange={() => toggleFlavor(flavor)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-600"
                />
                <span className="text-sm text-gray-700 capitalize flex-1">{flavor}</span>
                <span className="text-xs text-gray-500">({flavorCounts[flavor]})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between text-left mb-3"
        >
          <h3 className="font-bold text-gray-900">
            Categories {selectedCategories.length > 0 && <span className="text-primary-600">({selectedCategories.length})</span>}
          </h3>
          {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {uniqueCategories.map(category => (
              <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-600"
                />
                <span className="text-sm text-gray-700 capitalize flex-1">{category.replace(/-/g, ' ')}</span>
                <span className="text-xs text-gray-500">({categoryCounts[category]})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-left mb-3"
        >
          <h3 className="font-bold text-gray-900">Price Range</h3>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>£{minPrice}</span>
              <span>£{maxPrice}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Min</label>
                <input
                  type="range"
                  min={dataBounds.minPrice}
                  max={dataBounds.maxPrice}
                  step="1"
                  value={minPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMinPrice(Math.min(val, maxPrice - 1));
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Max</label>
                <input
                  type="range"
                  min={dataBounds.minPrice}
                  max={dataBounds.maxPrice}
                  step="1"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxPrice(Math.max(val, minPrice + 1));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Protein Range */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('protein')}
          className="w-full flex items-center justify-between text-left mb-3"
        >
          <h3 className="font-bold text-gray-900">Protein Content</h3>
          {expandedSections.protein ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.protein && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>{minProtein}g</span>
              <span>{maxProtein}g</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Min</label>
                <input
                  type="range"
                  min={dataBounds.minProtein}
                  max={dataBounds.maxProtein}
                  step="1"
                  value={minProtein}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMinProtein(Math.min(val, maxProtein - 1));
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Max</label>
                <input
                  type="range"
                  min={dataBounds.minProtein}
                  max={dataBounds.maxProtein}
                  step="1"
                  value={maxProtein}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxProtein(Math.max(val, minProtein + 1));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Protein Percentage Range */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection('percentage')}
          className="w-full flex items-center justify-between text-left mb-3"
        >
          <h3 className="font-bold text-gray-900">Protein %</h3>
          {expandedSections.percentage ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.percentage && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>{minProteinPercentage}%</span>
              <span>{maxProteinPercentage}%</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Min</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step="5"
                  value={minProteinPercentage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMinProteinPercentage(Math.min(val, maxProteinPercentage - 5));
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Max</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step="5"
                  value={maxProteinPercentage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxProteinPercentage(Math.max(val, minProteinPercentage + 5));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <div className="text-xl font-semibold text-gray-600">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-green-500 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Our Products</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Explore our premium collection of plant-based protein products
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {products.length} Total Products
            </div>
            {activeFiltersCount > 0 && (
              <div className="bg-yellow-400 text-primary-900 px-4 py-2 rounded-full font-semibold">
                {filteredProducts.length} Filtered Results
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <FilterSection />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-md">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 font-semibold text-gray-900"
              >
                <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="text-sm font-semibold text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            {showMobileFilters && (
              <>
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
                  onClick={() => setShowMobileFilters(false)}
                />
                <div className="lg:hidden fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 overflow-y-auto shadow-2xl animate-slide-in-right">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                        Filters
                      </h2>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <FilterSection />
                  </div>
                </div>
              </>
            )}

            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of <span className="font-semibold text-gray-900">{products.length}</span> products
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="animate-fade-in">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-gray-900 mb-2">No products found</p>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
