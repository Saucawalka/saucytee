import { useEffect, useState } from "react";
import axios from "axios";

interface Address {
  _id?: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
}

const AddressBook = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<Address>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchAddresses = async (userId: string) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/address", {
        params: { userId },
      });
      setAddresses(res.data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userFromStorage = localStorage.getItem("user");
    if (userFromStorage) {
      const parsedUser = JSON.parse(userFromStorage);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (user && user._id) {
      fetchAddresses(user._id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = { ...form, userId: user._id };

    try {
      if (editingId) {
        // Update existing address
        await axios.put(`http://localhost:3000/api/address/${editingId}`, payload);
        setEditingId(null);
      } else {
        // Add new address
        await axios.post(`http://localhost:3000/api/address`, payload);
      }
      setForm({ fullName: "", address: "", city: "", state: "", zip: "" });
      fetchAddresses(user._id);
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({
      fullName: addr.fullName,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
    });
    setEditingId(addr._id || null);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !user) return;

    try {
      await axios.delete(`http://localhost:3000/api/address/${id}`);
      fetchAddresses(user._id);
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;

    try {
      await axios.put(`http://localhost:3000/api/address/set-default`, {
        userId: user._id,
        addressId: id,
      });
      fetchAddresses(user._id);
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  if (loading) return <div className="p-6">Loading addresses...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Address Book</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {["fullName", "address", "city", "state", "zip"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={String(form[field as keyof Address]) || ""}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        ))}
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
          {editingId ? "Update Address" : "Add Address"}
        </button>
      </form>

      {addresses.length === 0 ? (
        <p>No saved addresses. Add a new address.</p>
      ) : (
        addresses.map((addr) => (
          <div key={addr._id} className="border p-4 rounded mb-4">
            <p className="font-semibold">{addr.fullName}</p>
            <p>{addr.address}, {addr.city}, {addr.state} - {addr.zip}</p>
            {addr.isDefault && <span className="text-sm text-green-600">Default Address</span>}
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleEdit(addr)}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr._id!)}
                  className="text-green-500 hover:underline"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AddressBook;
