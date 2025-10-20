import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import images from "../../../constants/images";
import { API_ENDPOINTS } from "../../../config/apiConfig";
import Cookies from 'js-cookie';

interface BoostProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string | number;
  productName?: string;
}

interface BoostFormData {
  duration: number;
  budget: number;
  location: string;
}

const BoostProductModal: React.FC<BoostProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName = "Product"
}) => {
  const [formData, setFormData] = useState<BoostFormData>({
    duration: 7,
    budget: 0,
    location: ""
  });

  const [errors, setErrors] = useState<Partial<BoostFormData>>({});

  // Boost product mutation
  const boostMutation = useMutation({
    mutationFn: async (data: BoostFormData) => {
      const token = Cookies.get('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Debug: Log the productId and URL
      console.log('Product ID:', productId);
      console.log('Boost URL:', API_ENDPOINTS.ADMIN_PRODUCTS.Boost(productId));

      if (!productId) {
        throw new Error('Product ID is required for boosting');
      }

      const response = await fetch(API_ENDPOINTS.ADMIN_PRODUCTS.Boost(productId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to boost product');
      }

      return response.json();
    },
    onSuccess: (data) => {
      alert(`Product boost created successfully! Boost ID: ${data.data.boost_id}`);
      onClose();
      setFormData({ duration: 7, budget: 0, location: "" });
      setErrors({});
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<BoostFormData> = {};

    if (!formData.duration || formData.duration < 1 || formData.duration > 365) {
      newErrors.duration = "Duration must be between 1 and 365 days";
    }

    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = "Budget must be greater than 0";
    }

    if (formData.location && formData.location.length > 255) {
      newErrors.location = "Location must be less than 255 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    boostMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof BoostFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen || !productId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Boost Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img className="w-6 h-6" src={images.close} alt="Close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm">
              Boost <span className="font-semibold">{productName}</span> for better visibility
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Days) *
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter duration in days"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₦) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter budget amount"
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                maxLength={255}
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter target location (optional)"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            {/* Boost Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Boost Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your product will be promoted for {formData.duration} days</li>
                <li>• Budget: ₦{formData.budget.toLocaleString()}</li>
                <li>• Status will be set to "pending" until approved</li>
                <li>• Payment method: Admin (no charge)</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={boostMutation.isPending}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {boostMutation.isPending ? 'Creating Boost...' : 'Boost Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoostProductModal;
