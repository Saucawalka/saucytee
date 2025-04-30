import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export interface Product {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  createdAt?: string;
}

interface CartItem {
  _id: string;
  product: Product;  // Changed to refer to the entire Product object
  quantity: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) return;

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart/`, {
        params: { userId: user._id },
      });

      // Ensure cartItems is always an array
      const cartData = response.data?.items || [];
      setCartItems(cartData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch cart items", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${id}`, { quantity });
      fetchCart();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${id}`);
      fetchCart();
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const totalQuantity = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
const navi=() => {
    navigate("/")
  }
  const checkout = () => {
    navigate("/checkout")
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return <div className="p-6">Loading cart...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Cart</h1>
      {cartItems.length === 0 ? (
       <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
       <div className="bg-white rounded-lg shadow-md p-8 text-center">
         <div className="flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-gray-100">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-12 h-12 text-blue-500">
             <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.082a24 24 0 00-18.65-3.006c.442.423.97.743 1.585.908a24.286 24.286 0 013.908 3.744" />
           </svg>
         </div>
         <h2 className="text-xl font-semibold text-gray-800 mt-6">Your cart is empty!</h2>
         <p className="text-gray-600 mt-2">Browse our categories and discover our best deals!</p>
         <button  onClick={navi}className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md mt-6 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
           Start Shopping
         </button>
       </div>
     </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center border p-4 rounded shadow">
              <img
                src={item.product.image ? `data:image/jpeg;base64,${item.product.image}` : "/placeholder.jpg"}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.product.name}</h2>
                <p className="text-gray-600">₦{item.product.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="px-2 bg-gray-200 rounded"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="px-2 bg-gray-200 rounded"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(item._id)}
                className="text-red-600 ml-4 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
           <div className="text-right text-lg font-semibold mt-4">
            <p>Total Quantity: {totalQuantity}</p> {/* Display total quantity */}
            Total: ₦{total.toLocaleString()}
          </div>
          <button  onClick={checkout}className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
