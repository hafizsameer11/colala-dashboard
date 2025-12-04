import React, { useState, useEffect } from "react";
import images from "../../../constants/images";

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

interface VariantDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    variantSizes: string[];
    variantDetailData: VariantDetailData | null;
    onSave: (data: VariantDetailData) => void;
    defaultPrice: string;
    defaultDiscountPrice: string;
}

const VariantDetailsModal: React.FC<VariantDetailsModalProps> = ({
    isOpen,
    onClose,
    variantSizes,
    variantDetailData,
    onSave,
    defaultPrice,
    defaultDiscountPrice,
}) => {
    const [localData, setLocalData] = useState<VariantDetailData>({
        color: {},
        size: {},
    });

    useEffect(() => {
        if (isOpen) {
            // Initialize local data with existing data or defaults
            const initialSizeData: Record<string, any> = {};

            variantSizes.forEach((size) => {
                if (variantDetailData?.size?.[size]) {
                    initialSizeData[size] = { ...variantDetailData.size[size] };
                } else {
                    initialSizeData[size] = {
                        price: defaultPrice || "",
                        compare: defaultDiscountPrice || "",
                        images: [],
                    };
                }
            });

            setLocalData({
                color: variantDetailData?.color || {},
                size: initialSizeData,
            });
        }
    }, [isOpen, variantSizes, variantDetailData, defaultPrice, defaultDiscountPrice]);

    const handlePriceChange = (size: string, field: 'price' | 'compare', value: string) => {
        setLocalData((prev) => ({
            ...prev,
            size: {
                ...prev.size,
                [size]: {
                    ...prev.size[size],
                    [field]: value,
                },
            },
        }));
    };

    const handleImageUpload = (size: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));

        if (imageFiles.length > 0) {
            const currentImages = localData.size[size]?.images || [];
            const remainingSlots = 6 - currentImages.length;
            const filesToAdd = imageFiles.slice(0, remainingSlots);

            const newImages = filesToAdd.map((file) => ({
                fileObject: file,
                uri: URL.createObjectURL(file),
            }));

            setLocalData((prev) => ({
                ...prev,
                size: {
                    ...prev.size,
                    [size]: {
                        ...prev.size[size],
                        images: [...currentImages, ...newImages],
                    },
                },
            }));

            // Reset input
            event.target.value = "";
        }
    };

    const removeImage = (size: string, index: number) => {
        setLocalData((prev) => {
            const currentImages = [...prev.size[size].images];
            // Revoke object URL if it was created locally
            if (currentImages[index].fileObject) {
                URL.revokeObjectURL(currentImages[index].uri);
            }
            currentImages.splice(index, 1);

            return {
                ...prev,
                size: {
                    ...prev.size,
                    [size]: {
                        ...prev.size[size],
                        images: currentImages,
                    },
                },
            };
        });
    };

    const handleSave = () => {
        onSave(localData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] bg-[#00000080] bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-[800px] max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold">Variant Details</h3>
                    <button onClick={onClose}>
                        <img className="w-6 h-6" src={images.close} alt="Close" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">
                        {variantSizes.map((size) => (
                            <div key={size} className="border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg font-medium">
                                        Size: {size}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price (₦)
                                        </label>
                                        <input
                                            type="number"
                                            value={localData.size[size]?.price || ""}
                                            onChange={(e) => handlePriceChange(size, 'price', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Compare Price (₦)
                                        </label>
                                        <input
                                            type="number"
                                            value={localData.size[size]?.compare || ""}
                                            onChange={(e) => handlePriceChange(size, 'compare', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Images (Max 6)
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {localData.size[size]?.images.map((image, index) => (
                                            <div key={index} className="relative w-20 h-20 border border-gray-200 rounded-lg overflow-hidden">
                                                <img
                                                    src={image.uri}
                                                    alt={`Variant ${size} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={() => removeImage(size, index)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center text-xs hover:bg-opacity-70"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}

                                        {(localData.size[size]?.images.length || 0) < 6 && (
                                            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#E53E3E] hover:bg-gray-50">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(size, e)}
                                                />
                                                <span className="text-2xl text-gray-400">+</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#E53E3E] text-white rounded-xl hover:bg-red-600 font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantDetailsModal;
