import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  createdAt?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/getproducts/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product.");
      });
  }, [id]);

  const addToCart = (product: Product) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingIndex = cart.findIndex((item) => item._id === product._id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Product added to cart!");
  };

  if (!product) return <p className="p-6">Loading product...</p>;

  return (
    <div className=" product-deatail-container p-4 sm:p-6 max-w-4xl mx-auto bg-white shadow rounded">
      <ToastContainer />

      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
      >
        ← Back to Home
      </button>

      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

      {/* Product Images */}
      {product.images && product.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {product.images.map((img, idx) => (
            <img
              key={idx}
              src={`data:image/jpeg;base64,${img}`}
              alt={`Product ${idx + 1}`}
              className=" product-image w-full h-40 object-cover rounded border"
            />
          ))}
        </div>
      )}

      <p className="text-xl font-semibold text-gray-800 mb-2">
        ₦{product.price.toLocaleString()}
      </p>
      <p className="text-gray-600 mb-6">{product.description}</p>

      <button
        onClick={() => addToCart(product)}
        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetail;
