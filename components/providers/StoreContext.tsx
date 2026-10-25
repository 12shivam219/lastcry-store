'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartClientItemInput, ValidatedCartResult, PinCodeCheckResult } from '@/lib/db/store';
import { UserAccountRecord } from '@/lib/db/types';

interface StoreContextValue {
  cartItems: CartClientItemInput[];
  validatedCart: ValidatedCartResult | null;
  isValidatingCart: boolean;
  pinCode: string;
  pinCheck: PinCodeCheckResult | null;
  couponCode: string;
  deliveryMethod: 'STANDARD_SURFACE' | 'PRIORITY_LOCAL_COURIER';
  wishlistIds: string[];
  currentUser: Omit<UserAccountRecord, 'passwordHash'> | null;
  toastMessage: string | null;
  setPinCode: (pin: string) => void;
  setCouponCode: (code: string) => void;
  setDeliveryMethod: (method: 'STANDARD_SURFACE' | 'PRIORITY_LOCAL_COURIER') => void;
  addToCart: (item: CartClientItemInput, label?: string) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, productName?: string) => void;
  setCurrentUser: (user: Omit<UserAccountRecord, 'passwordHash'> | null) => void;
  showToast: (msg: string) => void;
  refreshCartValidation: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'lastcry_cart_v1',
  PIN: 'lastcry_pincode_v1',
  WISHLIST: 'lastcry_wishlist_v1',
  USER: 'lastcry_user_v1',
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartClientItemInput[]>([]);
  const [validatedCart, setValidatedCart] = useState<ValidatedCartResult | null>(null);
  const [isValidatingCart, setIsValidatingCart] = useState(false);
  const [pinCode, setPinCodeState] = useState<string>('400001');
  const [pinCheck, setPinCheck] = useState<PinCodeCheckResult | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<
    'STANDARD_SURFACE' | 'PRIORITY_LOCAL_COURIER'
  >('STANDARD_SURFACE');
  const [wishlistIds, setWishlistIds] = useState<string[]>([
    'prod-teak-memorial-frame',
    'prod-remembrance-book',
  ]);
  const [currentUser, setCurrentUserState] = useState<Omit<
    UserAccountRecord,
    'passwordHash'
  > | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) setCartItems(JSON.parse(savedCart));

        const savedPin = localStorage.getItem(STORAGE_KEYS.PIN);
        if (savedPin) setPinCodeState(savedPin);

        const savedWish = localStorage.getItem(STORAGE_KEYS.WISHLIST);
        if (savedWish) setWishlistIds(JSON.parse(savedWish));

        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) setCurrentUserState(JSON.parse(savedUser));
      } catch {
        // Ignore storage access errors
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistIds));
    } catch {
      // Ignore
    }
  }, [wishlistIds, hydrated]);

  const setPinCode = useCallback((pin: string) => {
    const cleaned = pin.trim();
    setPinCodeState(cleaned);
    if (!cleaned || cleaned.length !== 6) {
      setPinCheck(null);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.PIN, cleaned);
    } catch {
      // Ignore
    }
  }, []);

  const setCurrentUser = useCallback(
    (user: Omit<UserAccountRecord, 'passwordHash'> | null) => {
      setCurrentUserState(user);
      try {
        if (user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      } catch {
        // Ignore
      }
    },
    []
  );

  // Check PIN serviceability whenever pinCode changes
  useEffect(() => {
    if (!pinCode || pinCode.length !== 6) {
      return;
    }
    let cancelled = false;
    fetch(`/api/pincode?pin=${encodeURIComponent(pinCode)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPinCheck(data);
      })
      .catch(() => {
        // Ignore
      });
    return () => {
      cancelled = true;
    };
  }, [pinCode]);

  const refreshCartValidation = useCallback(async () => {
    if (cartItems.length === 0) {
      setValidatedCart(null);
      return;
    }
    setIsValidatingCart(true);
    try {
      const res = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          pinCode,
          couponCode,
          deliveryMethod,
        }),
      });
      const data = await res.json();
      setValidatedCart(data);
    } catch {
      // Ignore network errors
    } finally {
      setIsValidatingCart(false);
    }
  }, [cartItems, pinCode, couponCode, deliveryMethod]);

  useEffect(() => {
    if (!hydrated || cartItems.length === 0) return;
    let cancelled = false;
    fetch('/api/cart/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        pinCode,
        couponCode,
        deliveryMethod,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setValidatedCart(data);
      })
      .catch(() => {
        // Ignore network errors
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, cartItems, pinCode, couponCode, deliveryMethod]);

  const addToCart = useCallback(
    (newItem: CartClientItemInput, label?: string) => {
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => {
          if (item.itemType !== newItem.itemType) return false;
          if (item.itemType === 'PRODUCT') {
            return (
              item.productId === newItem.productId &&
              (item.variantId || '') === (newItem.variantId || '')
            );
          }
          const aOpts = (item.selectedOptionalIds || []).slice().sort().join(',');
          const bOpts = (newItem.selectedOptionalIds || []).slice().sort().join(',');
          return item.ritualKitId === newItem.ritualKitId && aOpts === bOpts;
        });

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(20, updated[existingIndex].quantity + newItem.quantity),
          };
          return updated;
        }
        return [...prev, newItem];
      });
      showToast(`Added ${label || 'item'} to your cart.`);
    },
    [showToast]
  );

  const updateCartQuantity = useCallback((index: number, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], quantity: Math.min(20, quantity) };
      }
      return next;
    });
  }, []);

  const removeFromCart = useCallback(
    (index: number) => {
      setCartItems((prev) => prev.filter((_, idx) => idx !== index));
      showToast('Removed item from your cart.');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setValidatedCart(null);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string, productName?: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        const next = exists
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        showToast(
          exists
            ? `Removed ${productName || 'item'} from saved items.`
            : `Saved ${productName || 'item'} to your wishlist.`
        );
        return next;
      });
    },
    [showToast]
  );

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        validatedCart,
        isValidatingCart,
        pinCode,
        pinCheck,
        couponCode,
        deliveryMethod,
        wishlistIds,
        currentUser,
        toastMessage,
        setPinCode,
        setCouponCode,
        setDeliveryMethod,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        setCurrentUser,
        showToast,
        refreshCartValidation,
      }}
    >
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border border-[#D8D0C5] bg-[#1C1B19] px-4 py-3 text-sm text-[#FAF8F5] shadow-lg transition-opacity duration-150"
        >
          {toastMessage}
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
