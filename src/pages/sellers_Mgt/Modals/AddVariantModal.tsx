import React, { useState } from "react";
import images from "../../../constants/images";
import SizePickerModal from "./SizePickerModal";
import VariantDetailsModal from "./VariantDetailsModal";

interface VariantImage {
    fileObject?: File;
    uri: string;
}

interface VariantDetailData {
    color: Record<string, unknown>;
    size: {
        [size: string]: {
            price: string;
            compare: string;
            images: VariantImage[];
        };
    };
}

interface AddVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    variantTypes: string[];
    setVariantTypes: (types: string[]) => void;
    variantSizes: string[];
    setVariantSizes: (sizes: string[]) => void;
    useDefaultVariantPricing: boolean;
    setUseDefaultVariantPricing: (value: boolean) => void;
    variantDetailData: VariantDetailData | null;
    setVariantDetailData: (data: VariantDetailData | null) => void;
    defaultPrice: string;
    defaultDiscountPrice: string;
}

const AddVariantModal: React.FC<AddVariantModalProps> = ({
    isOpen,
    onClose,
    variantTypes,
    setVariantTypes,
    variantSizes,
    setVariantSizes,
    useDefaultVariantPricing,
    setUseDefaultVariantPricing,
    variantDetailData,
    setVariantDetailData,
    defaultPrice,
    defaultDiscountPrice,
}) => {
    const [showSizePicker, setShowSizePicker] = useState(false);
    const [showVariantDetails, setShowVariantDetails] = useState(false);

    if (!isOpen) return null;

    const handleTypeSelect = (type: string) => {
        if (variantTypes.includes(type)) {
            setVariantTypes(variantTypes.filter((t) => t !== type));
        } else {
            setVariantTypes([...variantTypes, type]);
        }
    };

    const handleSizeSave = (sizes: string[]) => {
        setVariantSizes(sizes);

        // Initialize variant detail data for new sizes if not exists
        const currentData = variantDetailData || { color: {}, size: {} };
        const newSizeData = { ...currentData.size };

        sizes.forEach(size => {
            if (!newSizeData[size]) {
                newSizeData[size] = {
                    price: defaultPrice,
                    compare: defaultDiscountPrice,
                    images: []
                };
            }
        });

        setVariantDetailData({
            ...currentData,
            size: newSizeData
        });
    };

    const handleVariantDetailsSave = (data: VariantDetailData) => {
        setVariantDetailData(data);
    };

    return (
        <>
            <div className="fixed inset-0 z-[1100] bg-[#00000080] bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl w-[600px] max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold">Add Variant</h3>
                        <button onClick={onClose}>
                            <img className="w-6 h-6" src={images.close} alt="Close" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Variant Type Selection */}
                        <div className="mb-8">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Variant Type</h4>
                            <button
                                onClick={() => handleTypeSelect("Size")}
                                className={`w-full p-4 rounded-xl border flex justify-between items-center transition-colors ${variantTypes.includes("Size")
                                        ? "bg-red-50 border-[#E53E3E]"
                                        : "bg-white border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${variantTypes.includes("Size") ? "bg-[#E53E3E] border-[#E53E3E]" : "border-gray-300"
                                        }`}>
                                        {variantTypes.includes("Size") && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`font-medium ${variantTypes.includes("Size") ? "text-[#E53E3E]" : "text-gray-700"}`}>
                                        Size
                                    </span>
                                </div>
                            </button>
                        </div>

                        {/* Size Selection */}
                        {variantTypes.includes("Size") && (
                            <div className="mb-8 animate-fade-in">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Sizes</h4>
                                <button
                                    onClick={() => setShowSizePicker(true)}
                                    className="w-full p-3 border border-gray-300 rounded-xl flex justify-between items-center hover:bg-gray-50 text-left"
                                >
                                    <span className={variantSizes.length > 0 ? "text-gray-900" : "text-gray-500"}>
                                        {variantSizes.length > 0
                                            ? `${variantSizes.length} sizes selected`
                                            : "Select sizes"
                                        }
                                    </span>
                                    <img src={images.rightarrow} alt="Select" className="w-4 h-4 transform rotate-90" />
                                </button>

                                {variantSizes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {variantSizes.map((size) => (
                                            <span
                                                key={size}
                                                className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700"
                                            >
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Variant Details Configuration */}
                        {variantSizes.length > 0 && (
                            <div className="mb-8 animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-gray-700">Variant Details</h4>
                                    <button
                                        onClick={() => setShowVariantDetails(true)}
                                        className="text-[#E53E3E] text-sm font-medium hover:underline"
                                    >
                                        Configure prices & images
                                    </button>
                                </div>

                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={useDefaultVariantPricing}
                                        onChange={(e) => setUseDefaultVariantPricing(e.target.checked)}
                                        className="w-5 h-5 text-[#E53E3E] border-gray-300 rounded focus:ring-[#E53E3E]"
                                    />
                                    <div>
                                        <span className="block font-medium text-gray-900">Use default pricing and images</span>
                                        <span className="block text-sm text-gray-500">
                                            Apply main product price and images to all variants
                                        </span>
                                    </div>
                                </label>

                                {/* Summary Preview */}
                                {!useDefaultVariantPricing && variantDetailData && (
                                    <div className="mt-4 space-y-2">
                                        {variantSizes.map((size) => {
                                            const details = variantDetailData.size[size];
                                            return (
                                                <div key={size} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900">Size: {size}</span>
                                                        {details?.images?.length > 0 && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                {details.images.length} images
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {details?.price ? `₦${details.price}` : 'Default Price'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-[#E53E3E] text-white rounded-xl hover:bg-red-600 font-medium"
                        >
                            Save Variants
                        </button>
                    </div>
                </div>
            </div>

            <SizePickerModal
                isOpen={showSizePicker}
                onClose={() => setShowSizePicker(false)}
                selectedSizes={variantSizes}
                onSave={handleSizeSave}
            />

            <VariantDetailsModal
                isOpen={showVariantDetails}
                onClose={() => setShowVariantDetails(false)}
                variantSizes={variantSizes}
                variantDetailData={variantDetailData}
                onSave={handleVariantDetailsSave}
                defaultPrice={defaultPrice}
                defaultDiscountPrice={defaultDiscountPrice}
            />
        </>
    );
};

export default AddVariantModal;
