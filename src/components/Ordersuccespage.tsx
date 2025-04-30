import { useLocation, useNavigate } from "react-router-dom";

const Ordersuccesspage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50">
      <div className="bg-white shadow-md rounded p-8 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">🎉 Order Placed Successfully!</h1>
        <p className="text-gray-700 mb-2">Your order ID is:</p>
        <p className="font-mono text-lg mb-4">{orderId || "Unknown"}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Ordersuccesspage;
