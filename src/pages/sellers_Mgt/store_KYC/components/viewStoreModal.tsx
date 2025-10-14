import images from "../../../../constants/images";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminStoreDetails, updateStoreStatus, updateStoreLevel } from "../../../../utils/queries/users";
import ViewLevel1 from "./viewLevel1";
import ViewLevel2 from "./viewLevel2";
import ViewLevel3 from "./viewLevel3";

interface ViewStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: number | string;
}

const ViewStoreModal: React.FC<ViewStoreModalProps> = ({
  isOpen,
  onClose,
  storeId,
}) => {
  const [activeTab, setActiveTab] = useState<"Level 1" | "Level 2" | "Level 3">("Level 1");
  const queryClient = useQueryClient();

  // Fetch store details
  const { data: storeDetails, isLoading, error } = useQuery({
    queryKey: ['adminStoreDetails', storeId],
    queryFn: () => getAdminStoreDetails(storeId!),
    enabled: isOpen && !!storeId,
    staleTime: 2 * 60 * 1000,
  });

  // Update store status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ storeId, status, notes, sendNotification }: { storeId: number | string, status: string, notes?: string, sendNotification?: boolean }) =>
      updateStoreStatus(storeId, status, notes, sendNotification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStoreDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
    },
  });

  // Update store level mutation
  const updateLevelMutation = useMutation({
    mutationFn: ({ storeId, level, notes }: { storeId: number | string, level: number, notes?: string }) =>
      updateStoreLevel(storeId, level, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStoreDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
    },
  });

  // Set initial tab based on store's onboarding level
  useEffect(() => {
    if (storeDetails?.data?.onboarding_progress?.onboarding_level) {
      const level = storeDetails.data.onboarding_progress.onboarding_level;
      if (level === 1) setActiveTab("Level 1");
      else if (level === 2) setActiveTab("Level 2");
      else if (level === 3) setActiveTab("Level 3");
    }
  }, [storeDetails]);

  const handleStatusUpdate = (status: string, notes?: string, sendNotification?: boolean) => {
    if (storeId) {
      updateStatusMutation.mutate({
        storeId,
        status,
        notes,
        sendNotification: sendNotification ?? true
      });
    }
  };

  const handleLevelUpdate = (level: number, notes?: string) => {
    if (storeId) {
      updateLevelMutation.mutate({
        storeId,
        level,
        notes
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10">
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img 
              src={images.close} 
              alt="Close" 
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDdMMjEgMjFMMjEgN0wyMSAyMVoiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTcgN0wyMSAyMSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjEgN0w3IDIxIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==';
              }}
            />
          </button>
          <h2 className="text-xl font-semibold">
            {isLoading ? "Loading Store..." : storeDetails?.data?.store_info?.name || "Store Details"}
          </h2>
        </div>

        <div className="p-5 pb-8">
          {isLoading ? (
            <div className="text-center py-8">Loading store details...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Failed to load store details</div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex p-1 gap-4 border border-[#989898] rounded-lg mt-5 w-83.5">
                <button
                  onClick={() => setActiveTab("Level 1")}
                  className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                    activeTab === "Level 1"
                      ? "bg-[#E53E3E] text-white "
                      : "bg-transparent text-black"
                  }`}
                >
                  Level 1
                </button>
                <button
                  onClick={() => setActiveTab("Level 2")}
                  className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                    activeTab === "Level 2"
                      ? "bg-red-500 text-white"
                      : "bg-transparent text-black"
                  }`}
                >
                  Level 2
                </button>
                <button
                  onClick={() => setActiveTab("Level 3")}
                  className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                    activeTab === "Level 3"
                      ? "bg-red-500 text-white"
                      : "bg-transparent text-black"
                  }`}
                >
                  Level 3
                </button>
              </div>

              {/* Tab Content */}
              <div className="">
                {activeTab === "Level 1" && (
                  <ViewLevel1
                    storeDetails={storeDetails?.data}
                    onStatusUpdate={handleStatusUpdate}
                    onLevelUpdate={handleLevelUpdate}
                    isLoading={updateStatusMutation.isPending || updateLevelMutation.isPending}
                  />
                )}
                {activeTab === "Level 2" && (
                  <ViewLevel2
                    storeDetails={storeDetails?.data}
                    onStatusUpdate={handleStatusUpdate}
                    onLevelUpdate={handleLevelUpdate}
                    isLoading={updateStatusMutation.isPending || updateLevelMutation.isPending}
                  />
                )}
                {activeTab === "Level 3" && (
                  <ViewLevel3
                    storeDetails={storeDetails?.data}
                    onStatusUpdate={handleStatusUpdate}
                    onLevelUpdate={handleLevelUpdate}
                    isLoading={updateStatusMutation.isPending || updateLevelMutation.isPending}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStoreModal;
