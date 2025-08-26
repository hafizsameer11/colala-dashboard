import images from "../../../constants/images";
import StateDropdown from "../../../components/stateDropdown";

interface SavedAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onAddNewAddress?: () => void;
}

const SavedAddressModal: React.FC<SavedAddressModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onAddNewAddress,
}) => {
  const handleStateActionSelect = (state: string) => {
    // Handle the state action selection from the StateDropdown
    console.log("State action selected in Dashboard:", state);
    // Add your custom logic here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto overflow-x-visible">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10 flex items-center">
          <button
            onClick={onBack || onClose}
            className="mr-3 cursor-pointer mt-1"
          >
            <img src={images.rightarrow} alt="Back" className="rotate-180" />
          </button>
          <h2 className="text-xl font-semibold">Saved Address</h2>
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
        </div>

        <div className="p-5 overflow-visible">
          {/* State Dropdown and Add New Address Button */}
          <div className="flex flex-row justify-between items-center mb-5 overflow-visible">
            <div className="overflow-visible">
              <StateDropdown onStateSelect={handleStateActionSelect} />
            </div>
            <button
              onClick={onAddNewAddress}
              className="bg-[#E53E3E] text-white px-5 py-3.5 rounded-lg font-semibold cursor-pointer"
            >
              Add New Address
            </button>
          </div>

          {/* Address Card 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
            {/* Address Header */}
            <div className="bg-[#E53E3E] text-white p-3">
              <h3 className="text-lg font-semibold">Address 1</h3>
            </div>

            {/* Address Details */}
            <div className=" space-y-3">
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">State</span>
                <span className="font-medium">Lagos</span>
              </div>
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">Local Government</span>
                <span className="font-medium">Ikeja</span>
              </div>
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">Full address</span>
                <span className="font-medium">
                  No 2,abcd street, felele, ikeja
                </span>
              </div>
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">Discount Code</span>
                <span className="font-medium">NEW123</span>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="px-4 pb-4 mt-5">
              <div className="bg-red-50 rounded-2xl p-4">
                <div className="flex items-center mb-3">
                  <img
                    src={images.clock}
                    alt="Clock"
                    className="w-5 h-5 mr-2"
                  />
                  <span className="font-semibold">Opening Hours</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Monday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Tuesday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Wednesday</span>
                    <span className="text-[#00000080]">08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Thursday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Friday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Saturday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex px-4 pb-4 space-x-4">
              <button className="p-2">
                <img
                  src={images.edit1}
                  alt="Edit"
                  className="w-8 h-8 cursor-pointer"
                />
              </button>
              <button className="p-2">
                <img
                  src={images.delete1}
                  alt="Delete"
                  className="w-7 h-7 cursor-pointer"
                />
              </button>
            </div>
          </div>

          {/* Address Card 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
            {/* Address Header */}
            <div className="bg-[#E53E3E] text-white p-3">
              <h3 className="text-lg font-semibold">Address 2</h3>
            </div>

            {/* Address Details */}
            <div className=" space-y-3">
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">State</span>
                <span className="font-medium">Lagos</span>
              </div>
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">Local Government</span>
                <span className="font-medium">Ikeja</span>
              </div>
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">Full address</span>
                <span className="font-medium">
                  No 2,abcd street, felele, ikeja
                </span>
              </div>
              <div className="flex border-b border-b-[#CDCDCD] p-3">
                <span className="text-[#00000080] w-45">Discount Code</span>
                <span className="font-medium">NEW123</span>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="px-4 pb-4 mt-5">
              <div className="bg-red-50 rounded-2xl p-4">
                <div className="flex items-center mb-3">
                  <img
                    src={images.clock}
                    alt="Clock"
                    className="w-5 h-5 mr-2"
                  />
                  <span className="font-semibold">Opening Hours</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Monday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Tuesday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Wednesday</span>
                    <span className="text-[#00000080]">08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Thursday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Friday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#00000080] w-30">Saturday</span>
                    <span>08:00 AM - 07:00PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex px-4 pb-4 space-x-4">
              <button className="p-2">
                <img
                  src={images.edit1}
                  alt="Edit"
                  className="w-8 h-8 cursor-pointer"
                />
              </button>
              <button className="p-2">
                <img
                  src={images.delete1}
                  alt="Delete"
                  className="w-7 h-7 cursor-pointer"
                />
              </button>
            </div>
          </div>

          <button className="bg-[#E53E3E] py-3 w-full text-white rounded-lg cursor-pointer text-lg">
            Add New
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedAddressModal;
