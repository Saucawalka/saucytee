import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
  // const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/getproducts");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

   

    fetchProducts();
    // loadCart();
  }, []);

  const addToCart = async (product: Product) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
  
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }
  
    try {
      await axios.post("http://localhost:3000/api/cart/", {
        userId: user._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images,
      });
      alert("Product added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add product to cart.");
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Product List</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded shadow hover:shadow-md transition">
            <img
  src={product.images && product.images.length > 0 ? `data:image/jpeg;base64,${product.images[0]}` : "/placeholder.jpg"}
  alt={product.name}
  className="h-40 w-full object-cover rounded"
/>

            <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
            <p className="text-gray-600">₦{product.price}</p>
            <p className="text-sm mt-1 text-gray-500">{product.description}</p>

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
        ))}
      </div>
    </div>
  );
};

export default ProductList;
