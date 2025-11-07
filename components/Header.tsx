// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, User, Heart, Package, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useSearch } from '@/lib/search-context';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { cart } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { customer, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    setAccountMenuOpen(false);
    router.push('/');
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

            {/* Account Menu - Desktop */}
            {isAuthenticated && customer ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 text-primary-900 font-semibold hover:text-primary-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{customer.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">My Account</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">Orders</span>
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">Wishlist</span>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-600">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-primary-900 font-semibold hover:text-primary-700 transition-colors"
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            )}

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

              {/* Account Menu - Mobile */}
              {isAuthenticated && customer ? (
                <>
                  <div className="border-t border-primary-900/20 my-2"></div>
                  <div className="text-xs font-bold text-primary-900/60 uppercase px-2">
                    {customer.name}
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-primary-900 font-semibold hover:text-primary-700 transition-colors py-2 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-primary-900 font-semibold hover:text-primary-700 transition-colors py-2 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Orders
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-primary-900 font-semibold hover:text-primary-700 transition-colors py-2 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-red-600 font-semibold hover:text-red-700 transition-colors py-2 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-primary-900/20 my-2"></div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-primary-900 font-semibold hover:text-primary-700 transition-colors py-2 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
