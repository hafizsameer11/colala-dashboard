import PageHeader from "../../../components/PageHeader";
import { useState } from "react";
import NotificationsFilters from "./components/notificationsfilters";
import NotificationTable from "./components/notificationtable";
import BannerTable from "./components/bannertable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "../../../utils/queries/notifications";
import { getBanners } from "../../../utils/queries/banners";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import images from "../../../constants/images";
import { deleteBanner, updateBanner } from "../../../utils/mutations/banners";
import NewBanner from "./components/newbanner";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("Notification");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 500);
  const [isEditBannerModalOpen, setIsEditBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const queryClient = useQueryClient();

  // Fetch notifications data
  const { data: notificationsData, isLoading: isLoadingNotifications, error: notificationsError } = useQuery({
    queryKey: ['notifications', currentPage, debouncedSearch, activeTab],
    queryFn: () => getNotifications(currentPage, debouncedSearch, undefined, undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: activeTab === "Notification",
  });

  // Fetch banners data
  const { data: bannersData, isLoading: isLoadingBanners, error: bannersError } = useQuery({
    queryKey: ['banners', currentPage, debouncedSearch, activeTab],
    queryFn: () => getBanners(currentPage, debouncedSearch, undefined, undefined, undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: activeTab === "Banner",
  });

  const currentData = activeTab === "Notification" ? notificationsData : bannersData;
  const isLoading = activeTab === "Notification" ? isLoadingNotifications : isLoadingBanners;
  const error = activeTab === "Notification" ? notificationsError : bannersError;

  // Banner mutations
  const deleteBannerMutation = useMutation({
    mutationFn: (bannerId: number | string) => deleteBanner(bannerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err) => {
      console.error("Error deleting banner:", err);
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ bannerId, formData }: { bannerId: number | string; formData: FormData }) =>
      updateBanner(bannerId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsEditBannerModalOpen(false);
      setEditingBanner(null);
    },
    onError: (err) => {
      console.error("Error updating banner:", err);
    },
  });

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setIsEditBannerModalOpen(true);
  };

  const handleDeleteBanner = (bannerId: number) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      deleteBannerMutation.mutate(bannerId);
    }
  };

  const handleUpdateBanner = (bannerId: number | string, formData: FormData) => {
    updateBannerMutation.mutate({ bannerId, formData });
  };

  return (
    <>
      <div>
        <PageHeader title="Notifications" />
        <div className="p-3 sm:p-4 md:p-5">
          {/* Statistics Cards */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              <p>Error loading {activeTab.toLowerCase()} data</p>
            </div>
          ) : currentData?.data ? (
            <StatCardGrid columns={3}>
              {activeTab === "Notification" ? (
                <>
                  <StatCard 
                    icon={images.notifications} 
                    title="Total Notifications" 
                    value={currentData.data.statistics?.total_notifications || 0} 
                    subtitle="All notifications" 
                  />
                  <StatCard 
                    icon={images.notifications} 
                    title="Sent Notifications" 
                    value={currentData.data.statistics?.sent_notifications || 0} 
                    subtitle="Successfully sent" 
                  />
                  <StatCard 
                    icon={images.notifications} 
                    title="Scheduled Notifications" 
                    value={currentData.data.statistics?.scheduled_notifications || 0} 
                    subtitle="Pending delivery" 
                  />
                </>
              ) : (
                <>
                  <StatCard 
                    icon={images.notifications} 
                    title="Total Banners" 
                    value={currentData.data.statistics?.total_banners || 0} 
                    subtitle="All banners" 
                  />
                  <StatCard 
                    icon={images.notifications} 
                    title="Active Banners" 
                    value={currentData.data.statistics?.active_banners || 0} 
                    subtitle="Currently active" 
                  />
                  <StatCard 
                    icon={images.notifications} 
                    title="Total Views" 
                    value={currentData.data.statistics?.total_views || 0} 
                    subtitle="Banner views" 
                  />
                </>
              )}
            </StatCardGrid>
          ) : null}

          {/* Add spacing between cards and filters */}
          <div className="mt-8">
            <NotificationsFilters
            onBulkActionSelect={(a) => console.log("Bulk action:", a)}
            onTabChange={setActiveTab}
            activeTab={activeTab}
            onSearchChange={setSearch}
          />

            {activeTab === "Notification" && (
              <div className="mt-6">
                <NotificationTable
                  searchTerm={search}
                  notificationsData={notificationsData}
                  isLoading={isLoadingNotifications}
                  error={notificationsError}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onRowSelect={(ids) => console.log("Selected IDs:", ids)}
                />
              </div>
            )}

            {activeTab === "Banner" && (
              <div className="mt-6">
                <BannerTable
                  searchTerm={search}
                  bannersData={bannersData}
                  isLoading={isLoadingBanners}
                  error={bannersError}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onRowSelect={(ids) => console.log("Selected IDs:", ids)}
                  onEditBanner={handleEditBanner}
                  onDeleteBanner={handleDeleteBanner}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Banner Modal */}
      <NewBanner
        isOpen={isEditBannerModalOpen}
        onClose={() => {
          setIsEditBannerModalOpen(false);
          setEditingBanner(null);
        }}
        editingBanner={editingBanner}
        onUpdate={handleUpdateBanner}
        isLoading={updateBannerMutation.isPending}
      />
    </>
  );
};

export default Notifications;
