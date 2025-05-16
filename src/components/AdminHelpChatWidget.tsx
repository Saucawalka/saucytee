import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import AdminHelpChat from "./AdminHelpChat"; // adjust path if needed

const AdminHelpChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[400px] h-[500px] bg-white shadow-xl rounded-lg border flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-blue-600 text-white rounded-t-lg">
            <h3 className="font-semibold">Support Chat</h3>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AdminHelpChat />
          </div>
        </div>
      ) : (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AdminHelpChatWidget;
