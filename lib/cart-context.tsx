// @ts-nocheck
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CartItemWithProduct } from './types';
import Toast from '@/components/Toast';
import { supabase } from './supabase';

interface CartContextType {
  cart: CartItemWithProduct[];
  addToCart: (product: Product, selectedWeight?: number) => void;
  removeFromCart: (productId: string, selectedWeight: number) => void;
  updateQuantity: (productId: string, selectedWeight: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Store only minimal data (IDs + quantities)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Enriched cart with full product data (always fresh from DB)
  const [cart, setCart] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load cart IDs from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Migrate old cart format if needed
        const migratedCart = migrateOldCart(parsed);
        setCartItems(migratedCart);
      } catch (error) {
        console.error('Error parsing cart:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setIsLoading(false);
  }, []);

  // Save cart IDs to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Fetch fresh product data whenever cart items change
  useEffect(() => {
    if (cartItems.length === 0) {
      setCart([]);
      return;
    }

    fetchProductsAndEnrichCart();
  }, [cartItems]);

  // Migrate old cart format to new format
  const migrateOldCart = (oldCart: any[]): CartItem[] => {
    return oldCart.map(item => {
      if (item.productId) {
        // Already new format
        return item as CartItem;
      } else if (item.product && item.product.id) {
        // Old format - extract only ID and quantities
        return {
          productId: item.product.id,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight || 1,
        };
      }
      return null;
    }).filter(Boolean) as CartItem[];
  };

  // Fetch fresh product data from database
  const fetchProductsAndEnrichCart = async () => {
    try {
      const productIds = [...new Set(cartItems.map(item => item.productId))];

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (error) throw error;

      if (!products || products.length === 0) {
        setCart([]);
        return;
      }

      // Enrich cart items with fresh product data
      const enrichedCart: CartItemWithProduct[] = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;

        const discount = getWeightDiscount(item.selectedWeight);

        return {
          ...item,
          product,
          pricePerKg: product.price,
          appliedDiscount: discount,
        };
      }).filter(Boolean) as CartItemWithProduct[];

      setCart(enrichedCart);
    } catch (error) {
      console.error('Error fetching products for cart:', error);
      setCart([]);
    }
  };

  // Calculate weight-based discount
  const getWeightDiscount = (weight: number): number => {
    if (weight >= 5) return 0.20;
    if (weight >= 4) return 0.15;
    if (weight >= 3) return 0.10;
    if (weight >= 2) return 0.05;
    return 0;
  };

  const addToCart = (product: Product, selectedWeight: number = 1) => {
    setCartItems((prevItems) => {
      // Check if same product with same weight exists
      const existingItem = prevItems.find(
        (item) => item.productId === product.id && item.selectedWeight === selectedWeight
      );

      if (existingItem) {
        // Increment quantity
        return prevItems.map((item) =>
          item.productId === product.id && item.selectedWeight === selectedWeight
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new item (only ID + quantities)
      return [
        ...prevItems,
        {
          productId: product.id,
          quantity: 1,
          selectedWeight,
        },
      ];
    });

    // Show toast notification
    setToastMessage(`${product.name} (${selectedWeight}kg) added to cart!`);
    setShowToast(true);
  };

  const removeFromCart = (productId: string, selectedWeight: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) =>
        !(item.productId === productId && item.selectedWeight === selectedWeight)
      )
    );
  };

  const updateQuantity = (productId: string, selectedWeight: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedWeight);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.selectedWeight === selectedWeight
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCart([]);
  };

  // Calculate total from enriched cart
  const total = cart.reduce((sum, item) => {
    const basePrice = item.pricePerKg * item.selectedWeight * item.quantity;
    const finalPrice = basePrice * (1 - item.appliedDiscount);
    return sum + finalPrice;
  }, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, isLoading }}
    >
      {children}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
