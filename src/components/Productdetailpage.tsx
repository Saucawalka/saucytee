import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getproducts/${id}`)
      .then(res => {
        setProduct(res.data);
      })
      .catch(err => {
        console.error("Error fetching product:", err);
      });
  }, [id]);

  const addToCart = (product: Product) => {
    // Get the current cart from localStorage or initialize an empty cart
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if the product is already in the cart
    const existingProductIndex = cart.findIndex((item) => item._id === product._id);
    if (existingProductIndex !== -1) {
      // If the product exists, increment its quantity
      cart[existingProductIndex].quantity += 1;
    } else {
      // If the product is not in the cart, add it with quantity 1
      cart.push({ ...product, quantity: 1 });
    }

    // Save the updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Product added to cart!");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
      >
        ← Back to Home
      </button>

      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {product.images?.map((img, idx) => (
          <img
            key={idx}
            src={`data:image/jpeg;base64,${img}`}
            className="w-full h-64 object-cover rounded"
            alt={`Product Image ${idx + 1}`}
          />
        ))}
      </div>

      <p className="text-lg font-semibold text-gray-700">₦{product.price}</p>
      <p className="text-gray-600 mt-2">{product.description}</p>

      <button
        onClick={() => addToCart(product)}
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetail;
