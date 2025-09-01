import images from "../../../constants/images";
import StateDropdown from "../../../components/stateDropdown";
import type { DeliveryPricingEntry } from "./addNewDeliveryPricing";
import { useState } from "react";

interface DeliveryPricingProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onAddNewDeliveryPricing?: () => void;
  deliveryPricingEntries?: DeliveryPricingEntry[];
  onEditDeliveryPricing?: (
    id: string,
    updatedEntry: DeliveryPricingEntry
  ) => void;
  onDeleteDeliveryPricing?: (id: string) => void;
}

const DeliveryPricing: React.FC<DeliveryPricingProps> = ({
  isOpen,
  onClose,
  onBack,
  onAddNewDeliveryPricing,
  deliveryPricingEntries = [],
  onEditDeliveryPricing,
  onDeleteDeliveryPricing,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    state: string;
    lga: string;
    price: string;
    isFreeDelivery: boolean;
  }>({
    state: "",
    lga: "",
    price: "",
    isFreeDelivery: false,
  });

  const handleEdit = (entry: DeliveryPricingEntry) => {
    setEditingId(entry.id);
    setEditFormData({
      state: entry.state,
      lga: entry.lga,
      price: entry.price === "Free" ? "" : entry.price.replace("N", ""),
      isFreeDelivery: entry.isFreeDelivery,
    });
  };

  const handleSaveEdit = (id: string) => {
    const updatedEntry: DeliveryPricingEntry = {
      id,
      state: editFormData.state,
      lga: editFormData.lga,
      price: editFormData.isFreeDelivery ? "Free" : `N${editFormData.price}`,
      isFreeDelivery: editFormData.isFreeDelivery,
    };

    if (onEditDeliveryPricing) {
      onEditDeliveryPricing(id, updatedEntry);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      state: "",
      lga: "",
      price: "",
      isFreeDelivery: false,
    });
  };

  const handleDelete = (id: string) => {
    if (onDeleteDeliveryPricing) {
      onDeleteDeliveryPricing(id);
    }
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
          <h2 className="text-xl font-semibold">Delivery Pricing</h2>
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5">
          <div className="flex flex-row justify-between items-center">
            <div>
              <StateDropdown
                onStateSelect={(state) => {
                  console.log("Selected state in Delivery Pricing:", state);
                }}
              />
            </div>
            <div>
              <button
                onClick={onAddNewDeliveryPricing}
                className="px-6 py-3.5 bg-[#E53E3E] text-white rounded-lg cursor-pointer"
              >
                Add New Price
              </button>
            </div>
          </div>
          <div className="mt-5">
            {deliveryPricingEntries.length > 0 ? (
              deliveryPricingEntries.map((entry, index) => (
                <div key={entry.id} className="mb-5">
                  <div className="flex flex-col border border-[#CDCDCD] rounded-2xl">
                    <div className="bg-[#E53E3E] rounded-t-2xl text-white font-bold text-2xl p-3">
                      Delivery pricing {index + 1}
                    </div>
                    <div className="flex flex-col">
                      {editingId === entry.id ? (
                        // Edit Mode
                        <>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              State
                            </div>
                            <input
                              type="text"
                              value={editFormData.state}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  state: e.target.value,
                                }))
                              }
                              className="font-semibold text-xl border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              Local Government
                            </div>
                            <input
                              type="text"
                              value={editFormData.lga}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  lga: e.target.value,
                                }))
                              }
                              className="font-semibold text-xl border border-gray-300 rounded px-2 py-1"
                            />
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              Price
                            </div>
                            <input
                              type="text"
                              value={editFormData.price}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  price: e.target.value,
                                }))
                              }
                              disabled={editFormData.isFreeDelivery}
                              className="font-bold text-xl border border-gray-300 rounded px-2 py-1"
                              placeholder="Enter price"
                            />
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              Free Delivery
                            </div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editFormData.isFreeDelivery}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    isFreeDelivery: e.target.checked,
                                    price: e.target.checked ? "" : prev.price,
                                  }))
                                }
                                className="mr-2"
                              />
                              <span className="font-semibold text-xl">
                                {editFormData.isFreeDelivery ? "Yes" : "No"}
                              </span>
                            </label>
                          </div>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              State
                            </div>
                            <div className="font-semibold text-xl">
                              {entry.state}
                            </div>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              Local Government
                            </div>
                            <div className="font-semibold text-xl">
                              {entry.lga}
                            </div>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              Price
                            </div>
                            <div className="font-bold text-xl">
                              {entry.price}
                            </div>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] p-3">
                            <div className="text-[#00000080] text-xl w-45">
                              Free Delivery
                            </div>
                            <div className="font-semibold text-xl">
                              {entry.isFreeDelivery ? "Yes" : "No"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-row p-5 items-center gap-5">
                      {editingId === entry.id ? (
                        // Edit mode buttons
                        <>
                          <div>
                            <button
                              onClick={() => handleSaveEdit(entry.id)}
                              className="bg-[#02B15A] px-6 py-2.5 rounded-2xl text-white cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={handleCancelEdit}
                              className="text-[#666666] bg-white cursor-pointer border border-gray-300 px-6 py-2.5 rounded-2xl"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        // View mode buttons
                        <>
                          <div>
                            <button
                              onClick={() => handleEdit(entry)}
                              className="bg-[#FF0000] px-6 py-2.5 rounded-2xl text-white cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-[#FF0000] bg-white cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No delivery pricing entries found. Click "Add New Price" to
                create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPricing;
