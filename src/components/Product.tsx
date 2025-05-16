import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export interface Product {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  createdAt?: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getproducts`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (product: Product) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      toast.warning("Please log in to add items to your cart.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart/`, {
        userId: user._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images,
      });
      toast.success("Product added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add product to cart.");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Product List</h1>
      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            <img
              src={product.images && product.images.length > 0 ? `data:image/jpeg;base64,${product.images[0]}` : "/placeholder.jpg"}
              alt={product.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-700 font-medium">₦{product.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              <div className="mt-4 flex justify-between">
                <Link
                  to={`/product/${product._id}`}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  View
                </Link>
                <button
                  onClick={() => addToCart(product)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
