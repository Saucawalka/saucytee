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

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const getUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  useEffect(() => {
    const loadPaystackScript = () => {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        console.log("Paystack script loaded successfully");
      };
      document.body.appendChild(script);
    };

    loadPaystackScript();

    return () => {
      const script = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (script) {
        document.body.removeChild(script);
      }
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
        console.error("Error fetching data:", err);
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

    if (paymentMethod === "Cash on Delivery") {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, orderData);

        if (response.status === 200 || response.status === 201) {
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/clear`, {
            params: { userId: user._id },
          });

          navigate("/order-success", {
            state: {
              orderId: response.data._id,
              totalAmount: total,
            },
          });
        }
      } catch (err) {
        console.error("Failed to place order:", err);
        toast.error("Something went wrong while placing your order. Please try again.");
      }
    } else if (paymentMethod === "Credit Card") {
      if (!user || !user.email) {
        toast.error("User email is required for payment.");
        return;
      }

      const paystackWindow = window as unknown as PaystackWindow;
      if (!paystackWindow.PaystackPop) {
        console.error("PaystackPop is not available on window.");
        toast.error("Paystack script failed to load. Please try again.");
        return;
      }

      const handler = paystackWindow.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK,
        email: user.email,
        amount: total * 100,
        currency: "NGN",
        callback: (response: PaystackResponse) => {
          console.log("Payment callback:", response);
          if (response && response.reference) {
            axios
              .post(`${import.meta.env.VITE_API_BASE_URL}/api/verify/verify-payment`, { reference: response.reference })
              .then((verifyResponse) => {
                if (verifyResponse.data.status === "success") {
                  console.log("Payment verified successfully");
                  handlePlaceOrder();
                } else {
                  console.error("Payment not successful:", verifyResponse.data);
                  toast.error("Payment verification failed. Order not placed.");
                }
              })
              .catch((error) => {
                console.error("Error verifying payment:", error);
                toast.error("Failed to verify payment. Please contact support.");
              });
          } else {
            toast.error("Payment reference missing or invalid.");
          }
        },
        onClose: () => {
          toast.info("Payment window closed without completing payment.");
        },
      });

      handler.openIframe();
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handlePaystackPayment = () => {
    handlePlaceOrder();
  };

  if (loading) return <div className="p-6">Loading checkout...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Form */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>

          {savedAddresses.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Choose Saved Address</label>
              <select
                className="w-full px-4 py-2 border rounded"
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
            </div>
          )}

          <form className="space-y-4">
            {["fullName", "address", "city", "state", "zip"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field[0].toUpperCase() + field.slice(1)}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
                required
              />
            ))}
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded shadow">
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
          <div className="flex justify-between items-center">
            <p className="font-semibold">Total</p>
            <p className="font-semibold text-xl">
              ₦{total.toLocaleString()}
            </p>
          </div>

          {/* Payment Method */}
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="radio"
                  value="Cash on Delivery"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={handlePaymentMethodChange}
                />
                Cash on Delivery
              </label>
              <label>
                <input
                  type="radio"
                  value="Credit Card"
                  checked={paymentMethod === "Credit Card"}
                  onChange={handlePaymentMethodChange}
                />
                Credit Card
              </label>
            </div>

            {paymentMethod === "Credit Card" && (
              <button
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded"
                onClick={handlePaystackPayment}
              >
                Pay with Paystack
              </button>
            )}
            {paymentMethod === "Cash on Delivery" && (
              <button
                className="w-full mt-4 bg-green-500 text-white py-2 rounded"
                onClick={handlePlaceOrder}
              >
                Pay on Delivery
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
