import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface POSContextType {
  orders: any[];
  cart: CartItem[];
  menu: MenuItem[];
  currentStaff: Staff | null;
  venueId: string;
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderData: any) => Promise<void>;
  setCurrentStaff: (staff: Staff | null) => void;
}

interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  modifiers?: any[];
  notes?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl?: string;
  available: boolean;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  pin?: string;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children, venueId = 'default' }: { children: ReactNode; venueId?: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

  // Mock menu data for now
  useEffect(() => {
    setMenu([
      { id: '1', name: 'Espresso', category: 'Coffee', price: 3.50, available: true },
      { id: '2', name: 'Cappuccino', category: 'Coffee', price: 4.50, available: true },
      { id: '3', name: 'Latte', category: 'Coffee', price: 4.75, available: true },
      { id: '4', name: 'Americano', category: 'Coffee', price: 3.75, available: true },
      { id: '5', name: 'Croissant', category: 'Food', price: 3.00, available: true },
      { id: '6', name: 'Muffin', category: 'Food', price: 3.50, available: true },
    ]);
  }, []);

  const addToCart = (item: MenuItem, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.menuItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.menuItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { id: `cart-${Date.now()}`, menuItem: item, quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItem = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = async (orderData: any) => {
    // Mock order creation - will be replaced with real API
    const newOrder = {
      id: `order-${Date.now()}`,
      items: cart,
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    console.log('Order created:', newOrder);
  };

  return (
    <POSContext.Provider
      value={{
        orders,
        cart,
        menu,
        currentStaff,
        venueId,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        createOrder,
        setCurrentStaff,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within POSProvider');
  }
  return context;
};
