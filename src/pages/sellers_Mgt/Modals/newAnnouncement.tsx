import images from "../../../constants/images";

interface NewAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewAnnouncement: React.FC<NewAnnouncementProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-140 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Announcement</h2>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-md  cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-5" >
            <form action="#">
                <div className="flex flex-col gap-3" >
                    <label htmlFor="typeAnnouncement" className="text-xl font-medium" >Type Announcement</label>
                    <textarea name="typeAnnouncement" rows={6} id="typeAnnouncement" placeholder="Type Announcement" className="border border-[#989898] p-5 rounded-xl" />
                </div>
                <div className="mt-5 flex flex-col gap-3" >
                    <label htmlFor="link" className="text-xl font-medium" >Link</label>
                    <input type="text" name="link" id="link" className="border border-[#989898] p-5 rounded-xl" placeholder="Enter link" />
                </div>
                <div className="mt-5" ><button className="bg-[#E53E3E] text-white py-4 w-full rounded-xl cursor-pointer" >Send Post</button></div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default NewAnnouncement;
