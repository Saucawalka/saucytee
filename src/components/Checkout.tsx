import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface Product {
  _id?: string;
  name: string;
  price: number;
  image?: string;
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

interface Address {
  _id: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
}

interface PaystackWindow extends Window {
  PaystackPop: {
    setup: (options: PaystackOptions) => {
      openIframe: () => void;
      close: () => void;
    };
  };
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  useEffect(() => {
    const loadPaystackScript = () => {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    };

    loadPaystackScript();

    return () => {
      const script = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (script) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const user = getUserFromLocalStorage();
      if (!user) return;

      try {
        const [cartResponse, addressResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
            params: { userId: user._id },
          }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/address`, {
            params: { userId: user._id },
          }),
        ]);
        setCartItems(cartResponse.data.items || []);
        setSavedAddresses(addressResponse.data);
      } catch (err) {
        toast.error("Failed to load cart or address data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    const user = getUserFromLocalStorage();
    if (!user) return;

    if (!form.fullName || !form.address || !form.city || !form.state || !form.zip) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    const orderData = {
      userId: user._id,
      items: cartItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      shippingAddress: form,
      paymentMethod,
      totalPrice: total,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, orderData);
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/clear`, {
        params: { userId: user._id },
      });

      toast.success("Order placed successfully!");
      navigate("/order-success", {
        state: {
          orderId: response.data._id,
          totalAmount: total,
        },
      });
    } catch (err) {
      toast.error("Something went wrong while placing your order.");
      console.error(err);
    }
  };

  const handlePaystackPayment = () => {
    const user = getUserFromLocalStorage();
    if (!user?.email) {
      toast.error("User email required for payment.");
      return;
    }

    const paystackWindow = window as unknown as PaystackWindow;
    if (!paystackWindow.PaystackPop) {
      toast.error("Paystack script failed to load.");
      return;
    }

    const handler = paystackWindow.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK,
      email: user.email,
      amount: total * 100,
      currency: "NGN",
      callback: async (response: PaystackResponse) => {
        try {
          const verifyResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/verify/verify-payment`, {
            reference: response.reference,
          });

          if (verifyResponse.data.status === "success") {
            toast.success("Payment successful!");
            handlePlaceOrder();
          } else {
            toast.error("Payment verification failed.");
          }
        } catch (err) {
          toast.error("Error verifying payment.");
          console.error(err);
        }
      },
      onClose: () => toast.info("Payment cancelled."),
    });

    handler.openIframe();
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  if (loading) return <div className="p-6">Loading checkout...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Info */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
          {savedAddresses.length > 0 && (
            <select
              className="w-full px-4 py-2 border rounded mb-4"
              value={selectedAddressId ?? ""}
              onChange={(e) => {
                const selected = savedAddresses.find((addr) => addr._id === e.target.value);
                if (selected) {
                  setSelectedAddressId(selected._id);
                  setForm({
                    fullName: selected.fullName,
                    address: selected.address,
                    city: selected.city,
                    state: selected.state,
                    zip: selected.zip,
                  });
                }
              }}
            >
              <option value="">Select an address</option>
              {savedAddresses.map((addr) => (
                <option key={addr._id} value={addr._id}>
                  {addr.address}, {addr.city}, {addr.state}
                </option>
              ))}
            </select>
          )}
          {["fullName", "address", "city", "state", "zip"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={form[field as keyof typeof form]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded mb-2"
              required
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p>₦{(item.product.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-semibold text-lg">
            <p>Total</p>
            <p>₦{total.toLocaleString()}</p>
          </div>

          {/* Payment */}
          <div className="mt-4 space-y-2">
            <label className="block">
              <input
                type="radio"
                value="Cash on Delivery"
                checked={paymentMethod === "Cash on Delivery"}
                onChange={handlePaymentMethodChange}
                className="mr-2"
              />
              Cash on Delivery
            </label>
            <label className="block">
              <input
                type="radio"
                value="Credit Card"
                checked={paymentMethod === "Credit Card"}
                onChange={handlePaymentMethodChange}
                className="mr-2"
              />
              Pay with Card
            </label>

            {paymentMethod === "Credit Card" ? (
              <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded" onClick={handlePaystackPayment}>
                Pay with Paystack
              </button>
            ) : (
              <button className="w-full mt-3 bg-green-600 text-white py-2 rounded" onClick={handlePlaceOrder}>
                Confirm Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
