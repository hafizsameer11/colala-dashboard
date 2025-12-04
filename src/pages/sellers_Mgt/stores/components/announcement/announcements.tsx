import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSellerAnnouncements, createSellerAnnouncement, updateSellerAnnouncement, getSellerBanners, createSellerBanner, updateSellerBanner, deleteSellerBanner } from "../../../../../utils/queries/users";
import NewBanner from "../../../Modals/newBanner";
import NewAnnouncement from "../../../Modals/newAnnouncement";
import AnnouncementsTable from "./announcementTable";

const Announcements = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Text", "Banner"];
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAnnouncement, setEditingAnnouncement] = useState<{ id: string; message: string } | null>(null);
  const [editingBanner, setEditingBanner] = useState<{ id: string; title: string; description: string; image: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  const queryClient = useQueryClient();

  // Ensure data is fetched when component mounts
  useEffect(() => {
    if (storeId) {
      console.log('Component mounted, fetching data for storeId:', storeId);
      // The queries will automatically run due to enabled: !!storeId
    }
  }, [storeId]);

  // Fetch announcements data - always load when page loads
  const { data: announcementsData, isLoading: announcementsLoading, error: announcementsError, refetch: refetchAnnouncements } = useQuery({
    queryKey: ['sellerAnnouncements', storeId],
    queryFn: () => {
      console.log('Fetching announcements for storeId:', storeId);
      return getSellerAnnouncements(storeId!, 1); // Load first page initially
    },
    enabled: !!storeId,
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for more fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Fetch banners data - always load when page loads
  const { data: bannersData, isLoading: bannersLoading, error: bannersError, refetch: refetchBanners } = useQuery({
    queryKey: ['sellerBanners', storeId],
    queryFn: () => {
      console.log('Fetching banners for storeId:', storeId);
      return getSellerBanners(storeId!, 1); // Load first page initially
    },
    enabled: !!storeId,
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for more fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Extract data from API responses with better error handling
  const allAnnouncements = React.useMemo(() => {
    if (!announcementsData) return [];

    // Handle different possible response structures
    const data = announcementsData as any;
    const announcements = data?.data?.announcements ||
      data?.announcements ||
      data?.data ||
      [];

    return Array.isArray(announcements) ? announcements : [];
  }, [announcementsData]);

  const allBanners = React.useMemo(() => {
    if (!bannersData) return [];

    // Handle different possible response structures
    const data = bannersData as any;
    const banners = data?.data?.banners ||
      data?.banners ||
      data?.data ||
      [];

    return Array.isArray(banners) ? banners : [];
  }, [bannersData]);

  // Combine all data for filtering with proper type assignment
  const allData = React.useMemo(() => {
    const combinedData = [
      ...allAnnouncements.map((item: any) => ({
        ...item,
        type: 'text',
        id: item.id || item.announcement_id || Math.random().toString(),
        created_at: item.created_at || item.createdAt || item.date || new Date().toISOString(),
        title: item.title || item.message || 'Announcement',
        content: item.message || item.content || item.description || ''
      })),
      ...allBanners.map((item: any) => ({
        ...item,
        type: 'banner',
        id: item.id || item.banner_id || Math.random().toString(),
        created_at: item.created_at || item.createdAt || item.date || new Date().toISOString(),
        title: item.title || item.name || 'Banner',
        content: item.description || item.content || item.message || ''
      }))
    ];

    return combinedData;
  }, [allAnnouncements, allBanners]);

  // Filter data based on active tab with improved logic
  const getFilteredData = React.useMemo(() => {
    let filtered = [...allData]; // Create a copy to avoid mutating original array

    console.log('Starting filter with:', {
      totalItems: filtered.length,
      activeTab,
      searchTerm,
      dateFilter
    });

    // Filter by type (tab)
    if (activeTab === "Text") {
      filtered = filtered.filter(item => item.type === 'text');
    } else if (activeTab === "Banner") {
      filtered = filtered.filter(item => item.type === 'banner');
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const searchableText = [
          item.title || '',
          item.content || '',
          item.message || '',
          item.description || '',
          item.name || ''
        ].join(' ').toLowerCase();

        return searchableText.includes(searchLower);
      });
    }

    // Filter by date
    if (dateFilter !== "All") {
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      switch (dateFilter) {
        case "Today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "Yesterday":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "This Week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "This Month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          break;
      }

      if (startDate) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.created_at || item.updated_at || item.createdAt || item.updatedAt);

          if (endDate) {
            return itemDate >= startDate! && itemDate < endDate;
          } else {
            return itemDate >= startDate!;
          }
        });
      }
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || a.createdAt || a.updatedAt);
      const dateB = new Date(b.created_at || b.updated_at || b.createdAt || b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [allData, activeTab, searchTerm, dateFilter]);

  const filteredData = getFilteredData;
  const isLoading = announcementsLoading || bannersLoading;
  const error = announcementsError || bannersError;

  // All mutations must be defined before any early returns
  const createMutation = useMutation({
    mutationFn: (message: string) => createSellerAnnouncement(storeId!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAnnouncements', storeId] });
      queryClient.invalidateQueries({ queryKey: ['sellerBanners', storeId] });
      setShowAnnouncementModal(false);
    },
    onError: (error) => {
      console.error('Failed to create announcement:', error);
      alert('Failed to create announcement. Please try again.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ announcementId, message }: { announcementId: string; message: string }) =>
      updateSellerAnnouncement(storeId!, announcementId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAnnouncements', storeId] });
      queryClient.invalidateQueries({ queryKey: ['sellerBanners', storeId] });
      setEditingAnnouncement(null);
    },
    onError: (error) => {
      console.error('Failed to update announcement:', error);
      alert('Failed to update announcement. Please try again.');
    },
  });

  const createBannerMutation = useMutation({
    mutationFn: (formData: FormData) => createSellerBanner(storeId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerBanners', storeId] });
      queryClient.invalidateQueries({ queryKey: ['sellerAnnouncements', storeId] });
      setShowBannerModal(false);
    },
    onError: (error) => {
      console.error('Failed to create banner:', error);
      alert('Failed to create banner. Please try again.');
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ bannerId, formData }: { bannerId: string; formData: FormData }) =>
      updateSellerBanner(storeId!, bannerId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerBanners', storeId] });
      queryClient.invalidateQueries({ queryKey: ['sellerAnnouncements', storeId] });
      setEditingBanner(null);
    },
    onError: (error) => {
      console.error('Failed to update banner:', error);
      alert('Failed to update banner. Please try again.');
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (bannerId: string) => deleteSellerBanner(storeId!, bannerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerBanners', storeId] });
      queryClient.invalidateQueries({ queryKey: ['sellerAnnouncements', storeId] });
    },
    onError: (error) => {
      console.error('Failed to delete banner:', error);
      alert('Failed to delete banner. Please try again.');
    },
  });

  // Handle API errors
  const handleRetry = () => {
    refetchAnnouncements();
    refetchBanners();
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleCreateAnnouncement = (message: string) => {
    createMutation.mutate(message);
  };

  const handleUpdateAnnouncement = (announcementId: string, message: string) => {
    updateMutation.mutate({ announcementId, message });
  };

  const handleEditAnnouncement = (announcement: any) => {
    // Ensure we extract the message from the correct field
    const message = announcement.message || announcement.content || announcement.description || '';
    setEditingAnnouncement({
      id: announcement.id,
      message: message
    });
    setShowAnnouncementModal(true);
  };

  const handleCreateBanner = (formData: FormData) => {
    createBannerMutation.mutate(formData);
  };

  const handleUpdateBanner = (bannerId: string, formData: FormData) => {
    updateBannerMutation.mutate({ bannerId, formData });
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      deleteBannerMutation.mutate(bannerId);
    }
  };

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setShowBannerModal(true);
  };

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements and banners...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
          <p className="text-gray-600 mb-4">
            {error?.message || 'An error occurred while loading announcements and banners.'}
          </p>
          <button
            onClick={handleRetry}
            className="bg-[#E53E3E] text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div>
        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div>
              <TabButtons />
            </div>
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="All">All Time</option>
              </select>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
          <div className="flex gap-2">
            <div>
              <button
                className="bg-[#000] text-white px-8 py-3.5 cursor-pointer rounded-xl"
                onClick={() => setShowBannerModal(true)}
              >
                New Banner
              </button>
            </div>
            <div>
              <button
                className="bg-[#E53E3E] text-white px-4 py-3.5 cursor-pointer rounded-xl"
                onClick={() => setShowAnnouncementModal(true)}
              >
                New Announcement
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search announcements and banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
        </div>
        <div className="mt-5">

          <AnnouncementsTable
            announcements={Array.isArray(filteredData) ? filteredData : []}
            isLoading={isLoading}
            error={error as any}
            pagination={undefined} // We're doing client-side filtering now
            currentPage={currentPage}
            onPageChange={handlePageChange}
            activeTab={activeTab}
            onEditAnnouncement={handleEditAnnouncement}
            onEditBanner={handleEditBanner}
            onDeleteBanner={handleDeleteBanner}
          />
        </div>

        <NewBanner
          isOpen={showBannerModal}
          onClose={() => {
            setShowBannerModal(false);
            setEditingBanner(null);
          }}
          editingBanner={editingBanner}
          onCreateBanner={handleCreateBanner}
          onUpdateBanner={handleUpdateBanner}
          isLoading={createBannerMutation.isPending || updateBannerMutation.isPending}
        />
        <NewAnnouncement
          isOpen={showAnnouncementModal}
          onClose={() => {
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
          }}
          editingAnnouncement={editingAnnouncement}
          onCreateAnnouncement={handleCreateAnnouncement}
          onUpdateAnnouncement={handleUpdateAnnouncement}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </>
  );
};

export default Announcements;
