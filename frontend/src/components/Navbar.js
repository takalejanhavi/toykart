import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate(); // ✅ For redirect after logout

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
      fetchCartItemCount(storedUser._id);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const fetchCartItemCount = (userId) => {
    fetch(`https://toykart-2.onrender.com/api/cart/view/${userId}`)
      .then(response => response.json())
      .then(data => {
        setCartItemCount(data.products?.length || 0); // ✅ Safe check
      })
      .catch(err => {
        console.error('Error fetching cart item count:', err);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login'); // ✅ Redirect to login after logout
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
          
          <li>
            <Link to="/cart">
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
          </li>

          <li><Link to="/checkout">Checkout</Link></li>

          {isAuthenticated ? (
            <>
              <li><span>Welcome, {user?.name}</span></li>
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
