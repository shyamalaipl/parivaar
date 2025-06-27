import { createContext, useState } from "react";

// Create Context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  return (
    <Context.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </Context.Provider>
  );
};
