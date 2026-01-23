import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      fetchCart();
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [token, user]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    if (token) {
      try {
        const response = await axios.post(`${API}/cart`, item, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data.items || []);
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(i => i.item_id === item.item_id);
        if (existing) {
          return prev.map(i =>
            i.item_id === item.item_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, item];
      });
    }
  };

  const removeFromCart = async (item_id) => {
    if (token) {
      try {
        await axios.delete(`${API}/cart/${item_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchCart();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.item_id !== item_id));
    }
  };

  const updateQuantity = (item_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(item_id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.item_id === item_id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};