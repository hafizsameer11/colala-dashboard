import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKnowledgeBase } from "../../../../utils/queries/users";
import { 
  createKnowledgeBase, 
  updateKnowledgeBase, 
  deleteKnowledgeBase, 
  toggleKnowledgeBaseStatus 
} from "../../../../utils/mutations/users";
import KnowledgeBaseModal from "./knowledgeBaseModal";
import images from "../../../../constants/images";

interface KnowledgeBaseItem {
  id: number;
  title: string;
  description: string;
  type: "general" | "buyer" | "seller";
  url: string | null;
  video: string | null;
  media_url: string | null;
  is_active: boolean;
  view_count: number;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

interface KnowledgeBaseProps {
  onBack?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isThisWeekDropdownOpen: boolean;
  setIsThisWeekDropdownOpen: (open: boolean) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ 
  activeTab, 
  setActiveTab, 
  isThisWeekDropdownOpen, 
  setIsThisWeekDropdownOpen 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch knowledge base items
  const { data: kbData, isLoading, error } = useQuery({
    queryKey: ['knowledgeBase', currentPage],
    queryFn: () => getKnowledgeBase(currentPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: createKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error('Error creating knowledge base item:', error);
      alert('Failed to create item. Please try again.');
    },
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: {
      title?: string;
      description?: string;
      type?: 'general' | 'buyer' | 'seller';
      url?: string;
      video?: File | null;
      is_active?: boolean;
    }}) => updateKnowledgeBase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      console.error('Error updating knowledge base item:', error);
      alert('Failed to update item. Please try again.');
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
    },
    onError: (error) => {
      console.error('Error deleting knowledge base item:', error);
      alert('Failed to delete item. Please try again.');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: toggleKnowledgeBaseStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
    },
    onError: (error) => {
      console.error('Error toggling status:', error);
      alert('Failed to update status. Please try again.');
    },
  });

  const statistics = kbData?.data?.statistics || {};
  const pagination = kbData?.data?.pagination || {};

  // Memoize items to prevent unnecessary re-renders
  const items: KnowledgeBaseItem[] = useMemo(() => {
    return kbData?.data?.knowledge_base || [];
  }, [kbData?.data?.knowledge_base]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual item selection
  const handleItemSelect = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Update select all state when filtered items change
  useEffect(() => {
    setSelectAll(selectedItems.length === filteredItems.length && filteredItems.length > 0);
  }, [selectedItems, filteredItems]);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: KnowledgeBaseItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (item: KnowledgeBaseItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleToggleStatus = async (item: KnowledgeBaseItem) => {
    toggleStatusMutation.mutate(item.id);
  };

  const handleSaveItem = (kbData: {
    title: string;
    description?: string;
    type: "general" | "buyer" | "seller";
    url?: string;
    video?: File | null;
    is_active?: boolean;
  }) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: kbData });
    } else {
      createMutation.mutate(kbData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const CustomHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="flex items-center gap-3">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 overflow-x-auto">
          {["General", "Admin Management", "Categories", "Service Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? "bg-[#E53E3E] text-white" 
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        
        {/* This Week Dropdown - Separate */}
        <div className="relative">
          <div className="bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => setIsThisWeekDropdownOpen(!isThisWeekDropdownOpen)}
              className="flex items-center p-4 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg transition-all duration-200"
            >
              <span className="cursor-pointer">This Week</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                  isThisWeekDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          
          {isThisWeekDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {["This Week", "Last Week", "This Month", "Last Month"].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setIsThisWeekDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CustomHeader />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Items</div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{statistics.total_items || 0}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Active Items</div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{statistics.active_items || 0}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Views</div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{statistics.total_views || 0}</div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Search and Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setSearchTerm((e.target as any).value);
                    }}
                    className="pl-12 pr-6 py-3 border border-gray-300 rounded-lg text-sm w-[300px] focus:outline-none bg-white shadow-sm placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAddItem}
                className="px-6 py-3 bg-[#E53E3E] text-white font-medium rounded-lg hover:bg-[#D32F2F] cursor-pointer transition-colors"
              >
                Add New Item
              </button>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Knowledge Base Items</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll && filteredItems.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700">Title</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700">Type</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700">Media</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700">Views</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700">Status</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700">Created</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          Loading items...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                          Error loading items. Please try again.
                        </td>
                      </tr>
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? "No items match your search." : "No items found."}
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleItemSelect(item.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <span className="font-medium text-gray-900">{item.title}</span>
                              {item.description && (
                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600 text-sm">
                              {item.video ? "Video File" : item.url ? "URL" : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-600">{item.view_count || 0}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-600 text-sm">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <img src={images.edit1} alt="Edit" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(item)}
                                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors cursor-pointer"
                                title="Toggle Status"
                              >
                                <img src={images.bell} alt="Toggle Status" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <img src={images.delete1} alt="Delete" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm">
                      Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />
    </>
  );
};

export default KnowledgeBase;

