import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Redirect to login if token is not present
  useEffect(() => {
    if (!token || !userId) {
      navigate('/login'); // or handle with a message
    }
  }, [token, userId, navigate]);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    if (!token || !userId) {
      setError("User not logged in!");
      return;
    }
    try {
      const response = await axios.get(`https://toykart-2.onrender.com/api/cart/view/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Error fetching cart.');
      console.error('Error fetching cart:', err);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add product to cart
  const handleAddToCart = async (productId) => {
    if (!token || !userId) {
      alert("User not logged in");
      return;
    }
    try {
      await axios.post(
        'https://toykart-2.onrender.com/api/cart/add',
        { userId, productId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCart(); // Update cart after adding product
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart.');
    }
  };

  // Remove product from cart
  const handleRemoveFromCart = async (productId) => {
    if (!token || !userId) {
      alert("User not logged in");
      return;
    }
    try {
      await axios.post(
        'https://toykart-2.onrender.com/api/cart/remove',
        { userId, productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCart(); // Update cart after removing product
    } catch (err) {
      console.error('Error removing from cart:', err);
      alert('Failed to remove product from cart.');
    }
  };

  // Loading and error states
  if (loading) return <div className="cart-loading">Loading cart...</div>;
  if (error) return <div className="cart-error">{error}</div>;

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cart && cart.products.length > 0 ? (
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
