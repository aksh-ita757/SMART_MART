import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  // items structure: [{ product: {...}, quantity: 1 }]
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Increase quantity if item already in cart
        existingItem.quantity += 1;
      } else {
        // Add new item to cart
        state.items.push({
          product: product,
          quantity: 1,
        });
      }

      saveCartToStorage(state.items);
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product.id !== productId
      );
      saveCartToStorage(state.items);
    },

    // Update item quantity
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(
            (item) => item.product.id !== productId
          );
        } else if (quantity <= item.product.stock) {
          // Update quantity if within stock limit
          item.quantity = quantity;
        }
      }

      saveCartToStorage(state.items);
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },

    // Increase quantity by 1
    incrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item && item.quantity < item.product.stock) {
        item.quantity += 1;
      }

      saveCartToStorage(state.items);
    },

    // Decrease quantity by 1
    decrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // Remove item if quantity becomes 0
          state.items = state.items.filter(
            (item) => item.product.id !== productId
          );
        }
      }

      saveCartToStorage(state.items);
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  incrementQuantity,
  decrementQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;