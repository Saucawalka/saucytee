import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminHelpChatWidget from './AdminHelpChatWidget';

interface Product {
  _id?: string;
  name: string;
  price: number;
  images: string[];
}

interface Order {
  _id: string;
  userId: { name: string; email: string };
  items: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"products" | "orders">("products");

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const token = getToken();
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete product failed", err);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const token = getToken();
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => prev.map((order) => (order._id === id ? res.data : order)));
    } catch (err) {
      console.error("Update order status failed", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <button
          onClick={() => setTab("products")}
          className={`mr-4 px-4 py-2 rounded ${tab === "products" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded ${tab === "orders" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
        >
          Manage Orders
        </button>
      </div>

      {tab === "products" ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Products</h2>

          <div className="mb-6 flex gap-4">
            <Link to="/productform">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                + Add New Product
              </button>
            </Link>

            <Link to="/adminhelp">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                Chat
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="border p-4 rounded shadow bg-white">
                <img
                  src={
    product.images[0]?.startsWith("data:image/")
      ? product.images[0]
      : `data:image/jpeg;base64,${product.images[0]}`
  }
                />
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p>₦{product.price}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <button
                    onClick={() => deleteProduct(product._id!)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/admin/products/${product._id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Orders</h2>
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border p-4 rounded shadow bg-white">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                    <p className="text-sm text-gray-500">
  Buyer: {order.userId?.name ? `${order.userId.name} (${order.userId.email})` : "Unknown"}
</p>

                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="text-sm px-2 py-1 border rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="divide-y text-sm">
  {order.items.map((item, idx) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    const total = !isNaN(price) && !isNaN(quantity) ? price * quantity : 0;

    return (
      <div key={idx} className="py-2 flex justify-between">
        <span>{item.name || "Unnamed Item"} × {quantity || 0}</span>
        <span>₦{total}</span>
      </div>
    );
  })}
</div>


                <div className="mt-2 text-right font-semibold">
                  Total: ₦{order.totalPrice}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdminHelpChatWidget />
    </div>
  );
};

export default AdminDashboard;
