import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(`https://toykart-2.onrender.com/api/cart/view/${userId}`);
      setCart(response.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId, fetchCart]);

  const handleAddToCart = async (productId) => {
    try {
      await axios.post(
        'https://toykart-2.onrender.com/api/cart/add',
        { userId, productId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      fetchCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await axios.post(
        'https://toykart-2.onrender.com/api/cart/remove',
        { userId, productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  if (!cart) {
    return <div className="cart-loading">Loading cart...</div>;
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cart.products.length > 0 ? (
        <>
          <div className="cart-items">
            {cart.products.map(item => (
              <div key={item.product._id} className="cart-item">
                <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p>{item.product.description}</p>
                  <p>Price: ₹{item.product.price}</p>
                  <p>Quantity: {item.quantity}</p>

                  <div className="cart-controls">
                    <button className="cart-btn" onClick={() => handleAddToCart(item.product._id)}>+</button>
                    <button className="cart-btn" onClick={() => handleRemoveFromCart(item.product._id)}>-</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total Price: ₹{cart.totalPrice}</h2>
            <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
          </div>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
