'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useSearch } from '@/lib/search-context';

export default function Header() {
  const { cart } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Scroll to products section when user starts typing
    const productsSection = document.getElementById('products');
    if (productsSection && e.target.value.length > 0) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleProductsClick = () => {
    // Navigate to products page
    window.location.href = '/products';
  };

  return (
    <header className="bg-yellow-400 shadow-lg sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
            <span className="text-2xl">🌱</span>
            <span className="text-xl md:text-2xl font-black text-primary-900">LIVOZA</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-900/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full bg-white text-primary-900 placeholder-primary-900/50 px-4 py-2.5 pl-11 rounded-full border-2 border-transparent hover:border-primary-900/20 focus:outline-none focus:border-primary-900 focus:shadow-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-900/50 hover:text-primary-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={handleProductsClick}
              className="text-primary-900 font-semibold hover:text-primary-700 transition-colors"
            >
              Products
            </button>
            <Link
              href="/about"
              className="text-primary-900 font-semibold hover:text-primary-700 transition-colors"
            >
              About
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-primary-900 text-yellow-400 px-6 py-2.5 rounded-full font-bold hover:bg-primary-800 transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button & Cart */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-primary-900" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-primary-900 hover:text-primary-700 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-primary-900/20">
            {/* Mobile Search */}
            <div className="relative mt-4 mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-900/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full bg-white text-primary-900 placeholder-primary-900/50 px-4 py-2.5 pl-11 rounded-full border-2 border-transparent focus:outline-none focus:border-primary-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-900/50 hover:text-primary-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleProductsClick();
                }}
                className="text-primary-900 font-semibold hover:text-primary-700 transition-colors py-2 text-left"
              >
                Products
              </button>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-primary-900 font-semibold hover:text-primary-700 transition-colors py-2"
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
