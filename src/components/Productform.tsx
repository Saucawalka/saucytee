import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const defaultCategories = ["Phones", "Gadgets", "Accessories"];

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });

  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cate`);
        if (response.data.length > 0) {
          setCategoryList(response.data);
        } else {
          setCategoryList(defaultCategories);
        }
      } catch (err) {
        console.warn("Using fallback categories due to fetch error", err);
        setCategoryList(defaultCategories);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
      setImagePreviews(fileArray.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("category", product.category);

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/product`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully!");
      setProduct({ name: "", price: "", description: "", category: "" });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      console.error("Error adding product", err);
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-8">
      <ToastContainer />
      <h2 className="text-xl font-semibold mb-4">Add a Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border p-2 rounded"
          required
          min="0"
        />
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
        />
        <select
          name="category"
          value={product.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {categoryList.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          name="images"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          multiple
          className="w-full border p-2 rounded"
          required
        />
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2">
            {imagePreviews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Preview ${index + 1}`}
                className="h-20 w-20 object-cover rounded"
              />
            ))}
          </div>
        )}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
