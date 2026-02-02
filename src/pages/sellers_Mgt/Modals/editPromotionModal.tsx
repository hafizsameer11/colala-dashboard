import images from "../../../constants/images";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePromotion } from "../../../utils/queries/users";
import { useToast } from "../../../contexts/ToastContext";

interface EditPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionId: number | string;
  promotionData?: {
    start_date?: string;
    duration?: number;
    budget?: number;
    location?: string;
    status?: string;
    payment_method?: string;
    payment_status?: string;
  };
}

const EditPromotionModal: React.FC<EditPromotionModalProps> = ({
  isOpen,
  onClose,
  promotionId,
  promotionData,
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    start_date: "",
    duration: "",
    budget: "",
    location: "",
    status: "",
    payment_method: "",
    payment_status: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with promotion data
  useEffect(() => {
    if (promotionData) {
      setFormData({
        start_date: promotionData.start_date ? promotionData.start_date.split(' ')[0] : "",
        duration: promotionData.duration?.toString() || "",
        budget: promotionData.budget?.toString() || "",
        location: promotionData.location || "",
        status: promotionData.status || "",
        payment_method: promotionData.payment_method || "",
        payment_status: promotionData.payment_status || "",
        notes: "",
      });
    }
  }, [promotionData, isOpen]);

  const statusOptions = ["pending", "approved", "active", "stopped", "rejected", "completed", "draft"];
  const paymentMethodOptions = ["wallet", "card", "bank"];
  const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePromotion(promotionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['adminPromotionDetails', promotionId] });
      showToast("Promotion updated successfully", "success");
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to update promotion";
      showToast(errorMessage, "error");
      
      // Set field-specific errors if available
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build update payload - only include fields that have values
    const updatePayload: any = {};
    
    if (formData.start_date) updatePayload.start_date = formData.start_date;
    if (formData.duration) updatePayload.duration = parseInt(formData.duration);
    if (formData.budget) updatePayload.budget = parseFloat(formData.budget);
    if (formData.location) updatePayload.location = formData.location;
    if (formData.status) updatePayload.status = formData.status;
    if (formData.payment_method) updatePayload.payment_method = formData.payment_method;
    if (formData.payment_status) updatePayload.payment_status = formData.payment_status;
    if (formData.notes) updatePayload.notes = formData.notes;

    // Validate at least one field is provided
    if (Object.keys(updatePayload).length === 0) {
      showToast("Please update at least one field", "error");
      return;
    }

    // Validate duration
    if (updatePayload.duration && (updatePayload.duration < 1 || updatePayload.duration > 365)) {
      setErrors({ duration: "Duration must be between 1 and 365 days" });
      return;
    }

    // Validate budget
    if (updatePayload.budget && updatePayload.budget < 0) {
      setErrors({ budget: "Budget must be greater than or equal to 0" });
      return;
    }

    // Validate start_date
    if (updatePayload.start_date) {
      const startDate = new Date(updatePayload.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        setErrors({ start_date: "Start date must be today or in the future" });
        return;
      }
    }

    updateMutation.mutate(updatePayload);
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E53E3E] to-[#D32F2F] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Edit Promotion</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
          >
            <img src={images.close} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                min={today}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] ${
                  errors.start_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                min="1"
                max="365"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] ${
                  errors.duration ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Daily Budget (₦)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] ${
                  errors.budget ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.budget && (
                <p className="text-red-500 text-xs mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                maxLength={255}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                placeholder="e.g., Lagos, Nigeria"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
              >
                <option value="">Select Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => handleInputChange("payment_method", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
              >
                <option value="">Select Payment Method</option>
                {paymentMethodOptions.map((method) => (
                  <option key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => handleInputChange("payment_status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
              >
                <option value="">Select Payment Status</option>
                {paymentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E]"
                placeholder="Add notes for notifications (max 500 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only fields you fill will be updated. Leave fields empty to keep their current values.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              "Update Promotion"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPromotionModal;



