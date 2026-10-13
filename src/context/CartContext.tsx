'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as fpixel from '@/lib/fpixel';

export interface CartProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  genericSaltName: string;
  strength: string;
  form: string;
  packSize: string;
  mrp: number; // paise
  sellingPrice: number; // paise
  stock: number;
  scheduleType: string;
  isColdChain: boolean;
  maxOrderQuantity: number;
  images: string; // JSON array string
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  totalMrpAmount: number; // paise
  totalSellingAmount: number; // paise
  totalDiscountAmount: number; // paise
  deliveryCharge: number; // paise
  coldChainFee: number; // paise
  finalPayableAmount: number; // paise
  hasColdChainItem: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('medicare_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setMounted(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('medicare_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, mounted]);

  const addToCart = (product: CartProduct, quantity = 1) => {
    try {
      fpixel.event('AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: (product.sellingPrice * quantity) / 100,
        currency: 'INR',
      });
    } catch {
      // ignore tracking errors
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIndex].quantity + quantity,
          product.maxOrderQuantity,
          product.stock
        );
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        const safeQty = Math.min(quantity, product.maxOrderQuantity, product.stock);
        return [...prev, { product, quantity: safeQty }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clampedQty = Math.min(quantity, item.product.maxOrderQuantity, item.product.stock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalMrpAmount = items.reduce(
    (sum, item) => sum + item.product.mrp * item.quantity,
    0
  );

  const totalSellingAmount = items.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );

  const totalDiscountAmount = Math.max(0, totalMrpAmount - totalSellingAmount);

  const hasColdChainItem = items.some((item) => item.product.isColdChain);

  // Delivery fee rules: Free for online payment. For COD, ₹100 is added at checkout/order placement.
  const deliveryCharge = 0;

  // Cold chain packaging fee: ₹100 (10000 paise) if refrigerated medicine present
  const coldChainFee = hasColdChainItem ? 10000 : 0;

  const finalPayableAmount = totalSellingAmount + deliveryCharge + coldChainFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        totalMrpAmount,
        totalSellingAmount,
        totalDiscountAmount,
        deliveryCharge,
        coldChainFee,
        finalPayableAmount,
        hasColdChainItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
