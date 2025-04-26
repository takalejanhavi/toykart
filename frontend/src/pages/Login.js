import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // React Router for redirection
import './Login.css';  // optional, for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setMessage(res.data.msg || 'Login successful');
      setError('');
      setEmail('');
      setPassword('');

      // Redirect to home after login
      setTimeout(() => navigate('/'), 1000); // delay for success message
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      setMessage('');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message} Redirecting...</p>}
    </div>
  );
};

export default Login;
