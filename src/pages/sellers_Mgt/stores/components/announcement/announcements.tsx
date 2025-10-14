import images from "../../../../../constants/images";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import { useState } from "react";
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
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch announcements data
  const { data: announcementsData, isLoading: announcementsLoading, error: announcementsError } = useQuery({
    queryKey: ['sellerAnnouncements', storeId, currentPage],
    queryFn: () => {
      console.log('Fetching announcements for storeId:', storeId, 'page:', currentPage);
      return getSellerAnnouncements(storeId!, currentPage);
    },
    enabled: !!storeId && (activeTab === "All" || activeTab === "Text"),
    keepPreviousData: true,
    retry: 1,
    onError: (error) => {
      console.error('Announcements fetch error:', error);
    },
    onSuccess: (data) => {
      console.log('Announcements fetch success:', data);
    },
  });

  // Fetch banners data
  const { data: bannersData, isLoading: bannersLoading, error: bannersError } = useQuery({
    queryKey: ['sellerBanners', storeId, currentPage],
    queryFn: () => {
      console.log('Fetching banners for storeId:', storeId, 'page:', currentPage);
      return getSellerBanners(storeId!, currentPage);
    },
    enabled: !!storeId && activeTab === "Banner",
    keepPreviousData: true,
    retry: 1,
    onError: (error) => {
      console.error('Banners fetch error:', error);
    },
    onSuccess: (data) => {
      console.log('Banners fetch success:', data);
    },
  });

  // Try different possible data structures
  const announcements = announcementsData?.data?.announcements || announcementsData?.announcements || [];
  const banners = bannersData?.data?.banners || bannersData?.banners || [];
  const announcementsPagination = announcementsData?.data?.pagination || announcementsData?.pagination;
  const bannersPagination = bannersData?.data?.pagination || bannersData?.pagination;

  // Determine current data based on active tab
  const currentData = activeTab === "Banner" ? banners : announcements;
  const currentPagination = activeTab === "Banner" ? bannersPagination : announcementsPagination;
  const isLoading = activeTab === "Banner" ? bannersLoading : announcementsLoading;
  const error = activeTab === "Banner" ? bannersError : announcementsError;

  // Debug logging
  console.log('Active tab:', activeTab);
  console.log('Announcements data:', announcementsData);
  console.log('Banners data:', bannersData);
  console.log('Current data:', currentData);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: (message: string) => createSellerAnnouncement(storeId!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAnnouncements', storeId] });
      setShowAnnouncementModal(false);
    },
    onError: (error) => {
      console.error('Failed to create announcement:', error);
      alert('Failed to create announcement. Please try again.');
    },
  });

  // Update announcement mutation
  const updateMutation = useMutation({
    mutationFn: ({ announcementId, message }: { announcementId: string; message: string }) => 
      updateSellerAnnouncement(storeId!, announcementId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerAnnouncements', storeId] });
      setEditingAnnouncement(null);
    },
    onError: (error) => {
      console.error('Failed to update announcement:', error);
      alert('Failed to update announcement. Please try again.');
    },
  });

  const handleCreateAnnouncement = (message: string) => {
    createMutation.mutate(message);
  };

  const handleUpdateAnnouncement = (announcementId: string, message: string) => {
    updateMutation.mutate({ announcementId, message });
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  // Banner mutations
  const createBannerMutation = useMutation({
    mutationFn: (formData: FormData) => createSellerBanner(storeId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerBanners', storeId] });
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
    },
    onError: (error) => {
      console.error('Failed to delete banner:', error);
      alert('Failed to delete banner. Please try again.');
    },
  });

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

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
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
              <div>Today</div>
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
                placeholder="Search"
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
          {/* Debug info */}
          {/* <div className="mb-4 p-4 bg-gray-100 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Store ID: {storeId}</p>
            <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Has Error: {error ? 'Yes' : 'No'}</p>
            <p>Announcements Count: {announcements.length}</p>
            <p>Raw Data: {JSON.stringify(announcementsData, null, 2)}</p>
          </div> */}
          
          <AnnouncementsTable 
            announcements={activeTab === "Banner" ? banners : announcements}
            isLoading={isLoading}
            error={error as any}
            pagination={currentPagination}
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
