import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminStores } from "../../../utils/queries/users";

interface Store {
  id: number;
  store_name: string;
  profile_image: string | null;
  banner_image: string | null;
  owner_name: string | null;
  owner_email: string | null;
}

interface StoreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreSelect: (store: Store) => void;
  title?: string;
}

const StoreSelectionModal: React.FC<StoreSelectionModalProps> = ({
  isOpen,
  onClose,
  onStoreSelect,
  title = "Select Store"
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch stores data
  const { data: storesData, isLoading, error } = useQuery({
    queryKey: ['adminStores'],
    queryFn: () => getAdminStores(1), // Get first page of stores
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const stores: Store[] = storesData?.data?.stores || [];


  // Filter stores based on search term
  const filteredStores = stores.filter(store =>
    store.store_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStoreSelect = (store: Store) => {
    onStoreSelect(store);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as any).value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>


        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Loading stores...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">Failed to load stores</div>
              <div className="text-sm text-gray-500 mb-4">Error: {error.message}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">No stores available</div>
              <div className="text-sm">Please check if stores are properly configured in the system.</div>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No stores found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreSelect(store)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-red-500 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Store Image */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {store.profile_image ? (
                      <img
                        src={store.profile_image}
                        alt={store.store_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDEyNSAxMjVMMTAwIDE1MEw3NSAxMjVMMTAwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Store Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{store.store_name}</h3>
                    {store.owner_name && (
                      <p className="text-gray-600 text-sm mb-1">Owner: {store.owner_name}</p>
                    )}
                    {store.owner_email && (
                      <p className="text-gray-500 text-xs">{store.owner_email}</p>
                    )}
                  </div>

                  {/* Select Button */}
                  <div className="mt-3">
                    <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                      Select Store
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreSelectionModal;
