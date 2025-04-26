import React, { useState } from 'react';
import axios from 'axios';
import './Checkout.css'; // Import custom CSS

const Checkout = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cvv: '',
    expiryDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?._id) {
      alert("User not logged in");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        'https://toykart-2.onrender.com/api/checkout',
        { userId: user._id, paymentDetails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      setLoading(false);
      setSuccess("Payment Successful! Transaction ID: " + response.data?.payment?.transactionId);
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.msg || "Payment failed. Please try again.";
      setError(msg);
      console.error("Checkout Error:", err);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <form onSubmit={(e) => e.preventDefault()} className="checkout-form">
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={paymentDetails.cardNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          value={paymentDetails.cvv}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="expiryDate"
          placeholder="Expiry Date (MM/YY)"
          value={paymentDetails.expiryDate}
          onChange={handleChange}
          required
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="button" onClick={handleCheckout} disabled={loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
