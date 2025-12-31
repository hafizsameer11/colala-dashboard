import PageHeader from "../../../components/PageHeader";
import { useState, useEffect, useMemo } from "react";
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
import { filterByPeriod } from "../../../utils/periodFilter";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("Notification");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [isEditBannerModalOpen, setIsEditBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const queryClient = useQueryClient();
  
  // Date period options
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

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

  // Fetch all notifications and banners for export
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [allBanners, setAllBanners] = useState<any[]>([]);
  const [isLoadingExportData, setIsLoadingExportData] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoadingExportData(true);
        
        // Fetch all notifications by checking pagination
        const allNotifs: any[] = [];
        let notificationPage = 1;
        let hasMoreNotifications = true;
        
        while (hasMoreNotifications && notificationPage <= 100) { // Safety limit
          const result = await getNotifications(notificationPage);
          const notifications = result?.data?.notifications || [];
          if (notifications.length > 0) {
            allNotifs.push(...notifications);
            const pagination = result?.data?.pagination;
            if (pagination && notificationPage >= pagination.last_page) {
              hasMoreNotifications = false;
            } else {
              notificationPage++;
            }
          } else {
            hasMoreNotifications = false;
          }
        }
        setAllNotifications(allNotifs);
        
        // Fetch all banners by checking pagination
        const allBans: any[] = [];
        let bannerPage = 1;
        let hasMoreBanners = true;
        
        while (hasMoreBanners && bannerPage <= 100) { // Safety limit
          const result = await getBanners(bannerPage);
          const banners = result?.data?.banners || [];
          if (banners.length > 0) {
            allBans.push(...banners);
            const pagination = result?.data?.pagination;
            if (pagination && bannerPage >= pagination.last_page) {
              hasMoreBanners = false;
            } else {
              bannerPage++;
            }
          } else {
            hasMoreBanners = false;
          }
        }
        setAllBanners(allBans);
      } catch (error) {
        console.error('Error fetching data for export:', error);
      } finally {
        setIsLoadingExportData(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Filter notifications and banners by period
  const periodFilteredNotifications = filterByPeriod(allNotifications, selectedPeriod, ['created_at', 'sent_at', 'scheduled_for', 'formatted_date', 'date']);
  const periodFilteredBanners = filterByPeriod(allBanners, selectedPeriod, ['created_at', 'start_date', 'end_date', 'formatted_date', 'date']);

  // Transform notifications for BulkActionDropdown export
  const notificationsForExport = useMemo(() => {
    return periodFilteredNotifications.map((notification: any) => ({
      id: notification.id?.toString() || '',
      title: notification.title || 'N/A',
      message: notification.message || 'N/A',
      link: notification.link || '',
      attachment: notification.attachment || '',
      audience_type: notification.audience_type || 'all',
      audienceType: notification.audience_type || 'all',
      target_user_ids: notification.target_user_ids || [],
      targetUserIds: notification.target_user_ids || [],
      status: notification.status || 'N/A',
      scheduled_for: notification.scheduled_for || '',
      scheduledFor: notification.scheduled_for || '',
      sent_at: notification.sent_at || '',
      sentAt: notification.sent_at || '',
      created_by: notification.created_by,
      createdBy: notification.created_by,
      total_recipients: notification.total_recipients || 0,
      totalRecipients: notification.total_recipients || 0,
      successful_deliveries: notification.successful_deliveries || 0,
      successfulDeliveries: notification.successful_deliveries || 0,
      failed_deliveries: notification.failed_deliveries || 0,
      failedDeliveries: notification.failed_deliveries || 0,
      created_at: notification.created_at || '',
      createdAt: notification.created_at || '',
      formatted_date: notification.formatted_date || notification.created_at || '',
      formattedDate: notification.formatted_date || notification.created_at || '',
      date: notification.formatted_date || notification.created_at || '',
    }));
  }, [periodFilteredNotifications]);

  // Transform banners for BulkActionDropdown export
  const bannersForExport = useMemo(() => {
    return periodFilteredBanners.map((banner: any) => ({
      id: banner.id?.toString() || '',
      title: banner.title || 'N/A',
      image_url: banner.image_url || '',
      imageUrl: banner.image_url || '',
      link: banner.link || '',
      audience_type: banner.audience_type || 'all',
      audienceType: banner.audience_type || 'all',
      target_user_ids: banner.target_user_ids || [],
      targetUserIds: banner.target_user_ids || [],
      position: banner.position || 'top',
      is_active: banner.is_active !== undefined ? banner.is_active : false,
      isActive: banner.is_active !== undefined ? banner.is_active : false,
      start_date: banner.start_date || '',
      startDate: banner.start_date || '',
      end_date: banner.end_date || '',
      endDate: banner.end_date || '',
      created_by: banner.created_by,
      createdBy: banner.created_by,
      total_views: banner.total_views || 0,
      totalViews: banner.total_views || 0,
      total_clicks: banner.total_clicks || 0,
      totalClicks: banner.total_clicks || 0,
      click_through_rate: banner.click_through_rate || 0,
      clickThroughRate: banner.click_through_rate || 0,
      is_currently_active: banner.is_currently_active !== undefined ? banner.is_currently_active : false,
      isCurrentlyActive: banner.is_currently_active !== undefined ? banner.is_currently_active : false,
      created_at: banner.created_at || '',
      createdAt: banner.created_at || '',
      formatted_date: banner.formatted_date || banner.created_at || '',
      formattedDate: banner.formatted_date || banner.created_at || '',
      date: banner.formatted_date || banner.created_at || '',
    }));
  }, [periodFilteredBanners]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

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
        <PageHeader 
          title="Notifications" 
          onPeriodChange={handlePeriodChange}
          defaultPeriod={selectedPeriod}
          timeOptions={datePeriodOptions}
        />
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
            notificationsForExport={notificationsForExport}
            bannersForExport={bannersForExport}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            datePeriodOptions={datePeriodOptions}
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
                  selectedPeriod={selectedPeriod}
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
                  selectedPeriod={selectedPeriod}
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
