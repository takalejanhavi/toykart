import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ products: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Fetch Cart Data
  const fetchCart = useCallback(async () => {
    if (!userId) return; // Avoid fetching cart if user is not logged in
    try {
      const response = await axios.get(`https://toykart-2.onrender.com/api/cart/view/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setCart(response.data || { products: [], totalPrice: 0 });
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCart({ products: [], totalPrice: 0 }); // Fallback if cart fetch fails
    }
  }, [userId, token]);

  // Fetch Product List
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://toykart-2.onrender.com/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchCart(); // Fetch cart data when component mounts
  }, [fetchCart]);

  // Add Product to Cart
  const handleAddToCart = async (productId) => {
    if (!token || !userId) {
      alert("Please login first to add to cart.");
      return;
    }
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
      alert('✅ Product added to cart!');
      // Optimistically update cart
      const updatedCart = { ...cart, products: [...cart.products, { productId, quantity: 1 }] };
      setCart(updatedCart);
    } catch (err) {
      alert("❌ Failed to add to cart");
      console.error(err);
    }
  };

  // Remove Product from Cart
  const handleRemoveFromCart = async (productId) => {
    if (!token || !userId) {
      alert("Please login first.");
      return;
    }
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
      alert('🗑️ Product removed from cart!');
      // Optimistically update cart
      const updatedCart = { ...cart, products: cart.products.filter(item => item.productId !== productId) };
      setCart(updatedCart);
    } catch (err) {
      alert("❌ Failed to remove from cart");
      console.error(err);
    }
  };

  if (loading) return <div className="message">Loading products...</div>;
  if (error) return <div className="message error">{error}</div>;

  return (
    <div className="home-container">
      <h1 className="hero-title">Welcome to ToyKart!</h1>
      <p className="hero-subtitle">Fun. Smart. Safe Toys for All Ages.</p>

      <div className="product-grid">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">₹{product.price}</p>

              <div className="cart-controls">
                <button className="cart-btn" onClick={() => handleAddToCart(product._id)}>+</button>
                <button className="cart-btn" onClick={() => handleRemoveFromCart(product._id)}>-</button>
              </div>
            </div>
          ))
        ) : (
          <div className="message">No products available.</div>
        )}
      </div>

      <div className="cart-summary">
        <h2>🛒 Cart Items: {cart.products.length}</h2>
        <h3>💵 Total Price: ₹{cart.totalPrice}</h3>
      </div>
    </div>
  );
};

export default Home;
