import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Adjust path as needed

interface Order {
  _id: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

const Orders = () => {
  const { user } = useAuth(); // Get the logged-in user from context
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Handle case where user is not logged in
      console.error("User not authenticated");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/orders/user/${user._id}`, // Use user._id here
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Depend on user, so it runs when the user is available

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow bg-white">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 text-sm rounded bg-indigo-100 text-indigo-700">
                  {order.status}
                </span>
              </div>

              <div className="divide-y text-sm">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₦{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-right font-semibold">
                Total: ₦{order.totalPrice}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
