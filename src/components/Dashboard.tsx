import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
}

interface Address {
  _id?: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserAndDefaultAddress = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/address/api/address/default`, {
            params: { userId: parsedUser._id },
          });
          setDefaultAddress(res.data);
        } catch (err) {
          console.error("Error fetching default address:", err);
          setDefaultAddress(null);
        } finally {
          setLoadingAddress(false);
        }
      }
    };

    fetchUserAndDefaultAddress();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">My Account</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li><Link to="/orders" className="hover:text-indigo-600">Orders</Link></li>
            <li><Link to="/dashboard/inbox" className="hover:text-indigo-600">Inbox</Link></li>
            <li><Link to="/dashboard/pending-reviews" className="hover:text-indigo-600">Pending Reviews</Link></li>
            <li><Link to="/dashboard/voucher" className="hover:text-indigo-600">Voucher</Link></li>
            <li><Link to="/dashboard/wishlist" className="hover:text-indigo-600">Wishlist</Link></li>
            <li><Link to="/dashboard/followed-sellers" className="hover:text-indigo-600">Followed Sellers</Link></li>
            <li><Link to="/dashboard/recently-viewed" className="hover:text-indigo-600">Recently Viewed</Link></li>
            <li className="mt-6 text-xs text-gray-500 uppercase">Settings</li>
            <li><Link to="/dashboard/accmanagement" className="hover:text-indigo-600">Account Management</Link></li>
            <li><Link to="/dashboard/payment-settings" className="hover:text-indigo-600">Payment Settings</Link></li>
            <li><Link to="/address" className="hover:text-indigo-600">Address Book</Link></li>
            <li><Link to="/dashboard/newsletter-preferences" className="hover:text-indigo-600">Newsletter Preferences</Link></li>
            <li><Link to="/dashboard/close-account" className="hover:text-red-500">Close Account</Link></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <h1 className="text-xl font-semibold text-gray-800">Account Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Account Details</h3>
              <p className="text-sm text-gray-700">{user?.name || "Your Name"}</p>
              <p className="text-sm text-gray-500">{user?.email || "your.email@example.com"}</p>
            </div>

            {/* Address Book */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Address Book</h3>
              <p className="text-sm text-gray-700 mb-2">Your default shipping address:</p>
              {loadingAddress ? (
                <p className="text-sm text-gray-500 italic">Loading address...</p>
              ) : defaultAddress ? (
                <div>
                  <p className="text-sm text-gray-700">{defaultAddress.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.zip}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No default shipping address available.</p>
              )}
              <Link to='/address'>
                <button className="text-sm text-orange-600 mt-2">Manage Address Book</button>
              </Link>
            </div>

            {/* Store Credit */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Store Credit</h3>
              <p className="text-sm text-blue-700 font-medium">💳 Saucytee store credit balance: ₦ 0</p>
            </div>

            {/* Newsletter Preferences */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Newsletter Preferences</h3>
              <p className="text-sm text-gray-700">
                Manage your email communications to stay updated with the latest news and offers.
              </p>
              <button className="text-sm text-orange-600 mt-2">Edit Newsletter Preferences</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
