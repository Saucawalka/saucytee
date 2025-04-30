import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

// Load Stripe.js with your public key
const stripePromise = loadStripe('pk_test_51RITtIHHGwLDKtOfzdLrQg7t3gnp6BFhuet7bm2emrfSVOXtYMyGoZuxTnpgLaeXz7cLjQjPVTEnrhhHtK4esHic00RgBeseHK');  // Use your actual public key

// Payment Form Component
const PaymentForm = () => {
  const [amount] = useState(1000);  // Default amount in cents (e.g., 1000 = ₦10.00)
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);  // Track loading state
  const stripe = useStripe();
  const elements = useElements();

  // Create PaymentIntent on mount
  useEffect(() => {
    if (amount > 0) {
      setLoading(true);  // Set loading to true while the request is being made

      axios.post('http://localhost:3003/api/payment/create-payment-intent', { amount })
        .then(response => {
          setClientSecret(response.data.clientSecret);
        })
        .catch(error => {
          console.error('Error creating payment intent:', error);
          alert('Failed to create payment intent. Please try again.');
        })
        .finally(() => {
          setLoading(false);  // Set loading to false after the request completes
        });
    }
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;  // Stripe.js hasn't loaded yet, or no clientSecret is available
    }

    setLoading(true);  // Show loading state during payment confirmation

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setLoading(false);
      alert('Card element not found');
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Customer Name',  // You can collect customer details as needed
        },
      },
    });

    setLoading(false);  // Hide loading state after payment is confirmed

    if (error) {
      console.log('[Error]', error);
      alert(error.message);  // Display error message to the user
    } else if (paymentIntent.status === 'succeeded') {
      console.log('[PaymentIntent]', paymentIntent);
      alert('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}> 
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

// Payment Page Component (wraps PaymentForm with Elements provider)
const PaymentPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default PaymentPage;
