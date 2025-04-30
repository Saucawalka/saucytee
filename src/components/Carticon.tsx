import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
interface Product {
    _id: string;
    name: string;
    price: number;
    image?: string;
  }
  
  interface CartItem {
    _id: string;
    product: Product;
    quantity: number;
  }

const CartIcon = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart/`, {
          params: { userId: user._id },
        });
        setCartItems(response.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch cart items", err);
      }
    };

    fetchCart();
  }, [user]);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/cart" className="relative">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-8 h-8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18l-2 12H5L3 3z" />
      </svg>
      {totalQuantity > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
