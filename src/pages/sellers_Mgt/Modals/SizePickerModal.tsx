import React, { useState, useEffect } from "react";
import images from "../../../constants/images";

interface SizePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSizes: string[];
    onSave: (sizes: string[]) => void;
}

const SizePickerModal: React.FC<SizePickerModalProps> = ({
    isOpen,
    onClose,
    selectedSizes,
    onSave,
}) => {
    const [sizes, setSizes] = useState<string[]>([]);
    const [customSize, setCustomSize] = useState("");
    const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

    useEffect(() => {
        if (isOpen) {
            setSizes([...selectedSizes]);
        }
    }, [isOpen, selectedSizes]);

    const toggleSize = (size: string) => {
        if (sizes.includes(size)) {
            setSizes(sizes.filter((s) => s !== size));
        } else {
            setSizes([...sizes, size]);
        }
    };

    const addCustomSize = () => {
        if (customSize && !sizes.includes(customSize)) {
            setSizes([...sizes, customSize]);
            setCustomSize("");
        }
    };

    const handleSave = () => {
        onSave(sizes);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] bg-[#00000080] bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-[400px] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Select Sizes</h3>
                    <button onClick={onClose}>
                        <img className="w-6 h-6" src={images.close} alt="Close" />
                    </button>
                </div>

                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Standard Sizes</h4>
                    <div className="flex flex-wrap gap-2">
                        {standardSizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`px-4 py-2 rounded-lg border ${sizes.includes(size)
                                        ? "bg-[#E53E3E] text-white border-[#E53E3E]"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Size</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customSize}
                            onChange={(e) => setCustomSize(e.target.value)}
                            placeholder="Enter size"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomSize();
                                }
                            }}
                        />
                        <button
                            onClick={addCustomSize}
                            disabled={!customSize}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {sizes.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Sizes</h4>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((size) => (
                                <div
                                    key={size}
                                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                                >
                                    <span>{size}</span>
                                    <button
                                        onClick={() => toggleSize(size)}
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-[#E53E3E] text-white rounded-xl hover:bg-red-600 font-medium"
                    >
                        Save Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SizePickerModal;
