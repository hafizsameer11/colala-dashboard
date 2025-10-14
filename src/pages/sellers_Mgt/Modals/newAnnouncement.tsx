import images from "../../../constants/images";
import { useState, useEffect } from "react";

interface NewAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
  editingAnnouncement?: any;
  onCreateAnnouncement?: (message: string) => void;
  onUpdateAnnouncement?: (announcementId: string, message: string) => void;
  isLoading?: boolean;
}

const NewAnnouncement: React.FC<NewAnnouncementProps> = ({ 
  isOpen, 
  onClose, 
  editingAnnouncement,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  isLoading = false
}) => {
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (editingAnnouncement) {
      setMessage(editingAnnouncement.message || "");
      setLink(""); // Links not supported in current API
    } else {
      setMessage("");
      setLink("");
    }
  }, [editingAnnouncement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (editingAnnouncement && onUpdateAnnouncement) {
      onUpdateAnnouncement(editingAnnouncement.id, message);
    } else if (onCreateAnnouncement) {
      onCreateAnnouncement(message);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-140 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}
            </h2>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              <label htmlFor="typeAnnouncement" className="text-xl font-medium">
                Message
              </label>
              <textarea 
                name="typeAnnouncement" 
                rows={6} 
                id="typeAnnouncement" 
                placeholder="Type your announcement message (max 200 characters)" 
                className="border border-[#989898] p-5 rounded-xl"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                required
              />
              <div className="text-sm text-gray-500">
                {message.length}/200 characters
              </div>
            </div>
            <div className="mt-5">
              <button 
                type="submit"
                className="bg-[#E53E3E] text-white py-4 w-full rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? "Saving..." : (editingAnnouncement ? "Update Announcement" : "Create Announcement")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAnnouncement;
