import { useState, useEffect, } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaUser,
  FaShoppingCart,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";

// Define a User type
interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
}

interface CartItem {
  _id: string;
  quantity: number;
  product: { name: string; price: number; image: string };
}

interface Category {
  _id: string;
  name: string;
}

const Navbar = () => {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    }
  }, []);

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

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cate`);
        setCategories(response.data); // Assuming response.data is an array of categories
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
   
    setUser(null);
    navigate("/");
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left: Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
                className="text-gray-600 text-2xl focus:outline-none"
              >
                <FaBars />
              </button>
              {hamburgerOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10 border">
                  <ul className="py-2 text-gray-700 text-sm">
                    {/* Hoverable Categories Dropdown */}
                    <li className="group relative">
                      <span className="block px-4 py-2 hover:bg-gray-100">All Categories</span>
                      <div className="absolute left-full top-0 hidden group-hover:block w-48 bg-white shadow-md rounded-md border">
                        <ul className="py-2 text-gray-700">
                          {categories.map((category) => (
                            <li key={category._id}>
                              <Link
                                to={`/category/${category._id}`}
                                className="block px-4 py-2 hover:bg-gray-100"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                    {/* Other Menu Items */}
                  </ul>
                </div>
              )}
            </div>
            <Link to="/" className="text-xl font-bold text-indigo-600">Saucytee</Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-6 relative">
            {/* Search input logic here */}
          </div>

          {/* Right side: Help, User, Cart */}
          <div className="flex items-center space-x-6 text-sm text-gray-700">
            <Link to="/help" className="flex items-center gap-1 hover:text-indigo-600">
              <FaQuestionCircle /> Help
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 hover:text-indigo-600"
              >
                <FaUser />
                {user ? `Hi, ${user.username}` : "Account"}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md z-10 border py-2 text-gray-700 text-sm">
                  {!user ? (
                    <Link to="/signin" className="block px-4 py-2 font-semibold text-indigo-600 hover:bg-gray-100">Sign In</Link>
                  ) : (
                    <>
                      <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">My Dashboard</Link>
                      <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                      <Link to="/inbox" className="block px-4 py-2 hover:bg-gray-100">Inbox</Link>
                      <Link to="/wishlist" className="block px-4 py-2 hover:bg-gray-100">Wishlist</Link>
                      <Link to="/vouchers" className="block px-4 py-2 hover:bg-gray-100">Vouchers</Link>
                      <div className="border-t my-2" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        <FaSignOutAlt /> Sign Out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/cart" className="relative inline-block text-xl hover:text-indigo-600">
  <FaShoppingCart />

  {cartItems.length > 0 && (
    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] leading-none font-semibold rounded-full w-4 h-4 flex items-center justify-center">
      {totalQuantity}
    </span>
  )}
</Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
