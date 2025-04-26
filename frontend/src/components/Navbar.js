import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Check if the user is logged in by reading from localStorage or sessionStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      setIsAuthenticated(true);
      setUser(user);
      // Fetch cart item count
      fetchCartItemCount(user._id);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const fetchCartItemCount = (userId) => {
    // You can fetch the cart data from your backend
    fetch(`https://toykart-2.onrender.com/api/cart/view/${userId}`)
      .then(response => response.json())
      .then(data => {
        setCartItemCount(data.products.length);
      })
      .catch(err => {
        console.error('Error fetching cart item count:', err);
      });
  };

  const handleLogout = () => {
    // Clear the user data and token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">ToyKart</Link>
        </div>

        {/* Navigation Links */}
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          
          {/* Conditional rendering for Cart */}
          <li>
            <Link to="/cart">
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
          </li>

          <li><Link to="/checkout">Checkout</Link></li>

          {/* Conditional rendering based on authentication */}
          {isAuthenticated ? (
            <>
              <li><span>Welcome, {user.name}</span></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
