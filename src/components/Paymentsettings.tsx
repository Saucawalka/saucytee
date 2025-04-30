import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentSettings = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
  });

  // Fetch payment method data (e.g., from a database or API)
  useEffect(() => {
    // Replace with an actual API call to fetch existing payment data
    axios.get('/api/payment-method')
      .then(response => {
        setPaymentMethod(response.data.method);
        // You can also set the card details if available from your backend
      })
      .catch(error => {
        console.error('Error fetching payment method:', error);
      });
  }, []);

  const handleCardChange = (e: React.FormEvent<HTMLFormElement>) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Send updated payment method and card details to the backend
    axios.post('/api/update-payment-method', {
      paymentMethod,
      cardDetails,
    })
      .then(response => {
        alert('Payment method updated successfully');
      })
      .catch(error => {
        console.error('Error updating payment method:', error);
        alert('Failed to update payment method');
      });
  };

  return (
    <div>
      <h2>Payment Settings</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Payment Method:
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="credit-card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              {/* Add more options as necessary */}
            </select>
          </label>
        </div>

        {paymentMethod === 'credit-card' && (
          <>
            <div>
              <label>
                Card Number:
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Expiration Date:
                <input
                  type="text"
                  name="expirationDate"
                  value={cardDetails.expirationDate}
                  onChange={handleCardChange}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                CVV:
                <input
                  type="text"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleCardChange}
                  required
                />
              </label>
            </div>
          </>
        )}

        <button type="submit">Save Payment Settings</button>
      </form>
    </div>
  );
};

export default PaymentSettings;
