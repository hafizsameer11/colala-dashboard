import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrands, createBrand, updateBrand, deleteBrand } from "../../../../utils/queries/users";
import BrandModal from "./brandModal";
import images from "../../../../constants/images";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  description: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface BrandsManagementProps {
  onBack?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isThisWeekDropdownOpen: boolean;
  setIsThisWeekDropdownOpen: (open: boolean) => void;
}

const BrandsManagement: React.FC<BrandsManagementProps> = ({ 
  activeTab, 
  setActiveTab, 
  isThisWeekDropdownOpen, 
  setIsThisWeekDropdownOpen 
}) => {
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const queryClient = useQueryClient();

  // Fetch brands
  const { data: brandsData, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setIsBrandModalOpen(false);
    },
    onError: (error) => {
      console.error('Error creating brand:', error);
      alert('Failed to create brand. Please try again.');
    },
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setIsBrandModalOpen(false);
      setEditingBrand(null);
    },
    onError: (error) => {
      console.error('Error updating brand:', error);
      alert('Failed to update brand. Please try again.');
    },
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand. Please try again.');
    },
  });

  const brands: Brand[] = brandsData?.data || [];

  // Filter brands based on search term
  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const term = searchTerm.toLowerCase();
    return brands.filter(brand => 
      brand.name.toLowerCase().includes(term) ||
      brand.description.toLowerCase().includes(term) ||
      brand.status.toLowerCase().includes(term)
    );
  }, [brands, searchTerm]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands(filteredBrands.map(brand => brand.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual brand selection
  const handleBrandSelect = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Update select all state when filtered brands change
  useEffect(() => {
    setSelectAll(selectedBrands.length === filteredBrands.length && filteredBrands.length > 0);
  }, [selectedBrands, filteredBrands]);

  const handleAddBrand = () => {
    setEditingBrand(null);
    setIsBrandModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsBrandModalOpen(true);
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      deleteBrandMutation.mutate(brand.id);
    }
  };

  const handleSaveBrand = (brandData: {
    name: string;
    description: string;
    logo?: File | null;
    status: "active" | "inactive";
  }) => {
    const formData = new FormData();
    formData.append('name', brandData.name);
    formData.append('description', brandData.description);
    formData.append('status', brandData.status);
    if (brandData.logo) {
      formData.append('logo', brandData.logo);
    }

    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createBrandMutation.mutate(formData);
    }
  };

  const handleCloseModal = () => {
    setIsBrandModalOpen(false);
    setEditingBrand(null);
  };

  const CustomHeader = () => (
    <div className="flex items-center justify-between p-6 bg-white border-b border-t border-[#787878]">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="flex items-center gap-3">
        {/* Main Tabs Group */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 overflow-x-auto">
          {["General", "Admin Management", "Categories", "Brands", "FAQs", "Knowledge Base", "Terms"].map((tab) => {
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
          {/* Brands Content */}
          <div className="space-y-6">
            {/* Search and Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                onClick={handleAddBrand}
                className="px-6 py-3 bg-[#E53E3E] text-white font-medium rounded-lg hover:bg-[#D32F2F] cursor-pointer transition-colors"
              >
                Add New Brand
              </button>
            </div>

            {/* Brands Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Brands</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll && filteredBrands.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700">Logo</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left font-medium text-gray-700">Description</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700">Status</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700">Created</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          Loading brands...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                          Error loading brands. Please try again.
                        </td>
                      </tr>
                    ) : filteredBrands.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? "No brands match your search." : "No brands found."}
                        </td>
                      </tr>
                    ) : (
                      filteredBrands.map((brand) => (
                        <tr key={brand.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand.id)}
                              onChange={() => handleBrandSelect(brand.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              {brand.logo ? (
                                <img
                                  src={`https://colala.hmstech.xyz/storage/${brand.logo}`}
                                  alt={brand.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = images.img;
                                  }}
                                />
                              ) : (
                                <img src={images.img} alt="No logo" className="w-6 h-6" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{brand.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600 text-sm">
                              {brand.description || "No description"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                brand.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {brand.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-600 text-sm">
                              {new Date(brand.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditBrand(brand)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <img src={images.edit1} alt="Edit" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBrand(brand)}
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
            </div>
          </div>
        </div>
      </div>

      {/* Brand Modal */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBrand}
        editingBrand={editingBrand}
      />
    </>
  );
};

export default BrandsManagement;
