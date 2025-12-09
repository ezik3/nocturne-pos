import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface POSContextType {
  orders: any[];
  cart: CartItem[];
  menu: MenuItem[];
  currentStaff: Staff | null;
  venueId: string;
  addToCart: (item: MenuItem, quantity?: number, selectedSize?: MenuItemSize | null) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderData: any) => Promise<void>;
  setCurrentStaff: (staff: Staff | null) => void;
  refreshMenu: () => void;
}

interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: MenuItemSize | null;
  modifiers?: any[];
  notes?: string;
}

interface MenuItemSize {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  price: number; // Computed price (base or size)
  sizes?: MenuItemSize[];
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

const MENU_STORAGE_KEY = "venue_menu_items";

export function POSProvider({ children, venueId = 'default' }: { children: ReactNode; venueId?: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

  // Load menu from localStorage (synced with VenueMenu)
  const loadMenu = () => {
    try {
      const savedItems = localStorage.getItem(MENU_STORAGE_KEY);
      if (savedItems) {
        const items = JSON.parse(savedItems);
        // Transform to POS format with computed price
        const posItems: MenuItem[] = items.map((item: any) => ({
          ...item,
          price: item.basePrice || (item.sizes?.[0]?.price || 0)
        }));
        setMenu(posItems);
      } else {
        // Default demo items if no menu configured
        setMenu([
          { id: '1', name: 'Espresso', category: 'Coffee', basePrice: 3.50, price: 3.50, available: true },
          { id: '2', name: 'Cappuccino', category: 'Coffee', basePrice: 4.50, price: 4.50, available: true },
          { id: '3', name: 'Latte', category: 'Coffee', basePrice: 4.75, price: 4.75, available: true },
          { id: '4', name: 'Americano', category: 'Coffee', basePrice: 3.75, price: 3.75, available: true },
          { id: '5', name: 'Croissant', category: 'Food', basePrice: 3.00, price: 3.00, available: true },
          { id: '6', name: 'Muffin', category: 'Food', basePrice: 3.50, price: 3.50, available: true },
        ]);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
    }
  };

  useEffect(() => {
    loadMenu();
    
    // Listen for menu updates from VenueMenu
    const handleMenuUpdate = (event: CustomEvent) => {
      const items = event.detail;
      const posItems: MenuItem[] = items.map((item: any) => ({
        ...item,
        price: item.basePrice || (item.sizes?.[0]?.price || 0)
      }));
      setMenu(posItems);
    };

    window.addEventListener('menu-updated', handleMenuUpdate as EventListener);
    return () => {
      window.removeEventListener('menu-updated', handleMenuUpdate as EventListener);
    };
  }, []);

  const addToCart = (item: MenuItem, quantity = 1, selectedSize: MenuItemSize | null = null) => {
    setCart(prev => {
      const cartItemId = selectedSize ? `${item.id}-${selectedSize.id}` : item.id;
      const existing = prev.find(cartItem => 
        selectedSize 
          ? cartItem.menuItem.id === item.id && cartItem.selectedSize?.id === selectedSize.id
          : cartItem.menuItem.id === item.id && !cartItem.selectedSize
      );
      
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === existing.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${cartItemId}`,
        menuItem: {
          ...item,
          price: selectedSize ? selectedSize.price : item.basePrice || item.price
        },
        quantity,
        selectedSize
      };
      return [...prev, newItem];
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

  const refreshMenu = () => {
    loadMenu();
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
        refreshMenu,
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
