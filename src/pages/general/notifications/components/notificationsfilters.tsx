import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import NewNotification from "./newnotification";
import NewBanner from "./newbanner";
import BulkActionDropdown from "../../../../components/BulkActionDropdown";
import images from "../../../../constants/images";
import useDebouncedValue from "../../../../hooks/useDebouncedValue";
import { createNotification } from "../../../../utils/mutations/notifications";
import { createBanner } from "../../../../utils/mutations/banners";

interface NotificationsFiltersProps {
  onBulkActionSelect?: (action: string) => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  onSearchChange?: (term: string) => void; // <- NEW
  notificationsForExport?: any[];
  bannersForExport?: any[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  datePeriodOptions?: string[];
}

const NotificationsFilters: React.FC<NotificationsFiltersProps> = ({
  onBulkActionSelect,
  onTabChange,
  activeTab: externalActiveTab,
  onSearchChange, // <- NEW
  notificationsForExport = [],
  bannersForExport = [],
  selectedPeriod = "All time",
  onPeriodChange,
  datePeriodOptions = ["Today", "This Week", "Last Month", "Last 6 Months", "Last Year", "All time"],
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState("Notification");
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] =
    useState(false);
  const [isNewBannerModalOpen, setIsNewBannerModalOpen] = useState(false);
  const [search, setSearch] = useState(""); // <- NEW
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const debounced = useDebouncedValue(search, 450); // <- debounce delay

  const queryClient = useQueryClient();

  const createNotificationMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsNewNotificationModalOpen(false);
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
    },
  });

  const createBannerMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsNewBannerModalOpen(false);
    },
    onError: (error) => {
      console.error('Error creating banner:', error);
    },
  });

  useEffect(() => {
    onSearchChange?.(debounced.trim());
  }, [debounced, onSearchChange]);

  // Handle local date dropdown toggle
  const handleDateDropdownToggle = () => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
  };
  
  // Handle local date period selection
  const handleDatePeriodSelect = (period: string) => {
    onPeriodChange?.(period);
    setIsDateDropdownOpen(false);
  };
  
  // Close date dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };

    if (isDateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDateDropdownOpen]);

  const activeTab = externalActiveTab || internalActiveTab;
  const tabs = ["Notification", "Banner"];

  const handleTabChange = (tab: string) => {
    if (!externalActiveTab) setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleNewNotificationSubmit = (data: any) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('message', data.message);
    
    if (data.link && data.link.trim()) {
      formData.append('link', data.link.trim());
    }
    
    // Handle audience_type
    formData.append('audience_type', data.audience_type || 'all');
    
    // If specific audience, append target_user_ids
    if (data.audience_type === 'specific' && data.target_user_ids && data.target_user_ids.length > 0) {
      data.target_user_ids.forEach((userId: number) => {
        formData.append('target_user_ids[]', userId.toString());
      });
    }
    
    // Handle scheduled_for (optional)
    if (data.scheduled_for && data.scheduled_for.trim()) {
      // Convert datetime-local format to backend expected format
      const scheduledDate = new Date(data.scheduled_for);
      const formattedDate = scheduledDate.toISOString().slice(0, 19).replace('T', ' ');
      formData.append('scheduled_for', formattedDate);
    }
    
    createNotificationMutation.mutate(formData);
  };

  const handleNewBannerSubmit = (data: any) => {
    const formData = new FormData();
    formData.append('title', data.title || 'Banner');
    formData.append('link', data.link);
    
    // Set audience type to 'all' since audience selection is removed
    formData.append('audience_type', 'all');
    
    formData.append('position', 'top'); // Default position
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    createBannerMutation.mutate(formData);
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`py-2 px-6  rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "bg-[#E53E3E] text-white" : "text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    onBulkActionSelect?.(action);
    console.log("Bulk action selected in Referrals:", action);
  };

  return (
    <>
      <div className=" flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <div className="flex items-center">
            <TabButtons />
          </div>

          <div className="relative" ref={dateDropdownRef}>
            <div 
              className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleDateDropdownToggle}
            >
              <div>{selectedPeriod}</div>
              <img 
                className={`w-3 h-3 mt-1 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} 
                src={images.dropdown} 
                alt="" 
              />
            </div>
            {isDateDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#989898] py-2 w-44 z-50 shadow-lg">
                {datePeriodOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleDatePeriodSelect(option)}
                    className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                      selectedPeriod === option ? "bg-gray-100 font-semibold" : ""
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <BulkActionDropdown 
            onActionSelect={handleBulkActionSelect}
            orders={activeTab === "Notification" ? notificationsForExport : bannersForExport}
            dataType={activeTab === "Notification" ? "notifications" : "banners"}
          />
        </div>

        <div className="flex flex-row gap-2">
          <button
            onClick={() => setIsNewNotificationModalOpen(true)}
            className="bg-[#E53E3E]  text-white px-5 py-3.5 rounded-lg hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer"
          >
            Notification
          </button>

          <button
            onClick={() => setIsNewBannerModalOpen(true)}
            className="bg-[#E53E3E] text-white px-5 py-3.5 rounded-lg hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer"
          >
            Banner
          </button>

          {/* Search (debounced) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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

      <NewNotification
        isOpen={isNewNotificationModalOpen}
        onClose={() => setIsNewNotificationModalOpen(false)}
        onSubmit={handleNewNotificationSubmit}
        isLoading={createNotificationMutation.isPending}
      />

      <NewBanner
        isOpen={isNewBannerModalOpen}
        onClose={() => setIsNewBannerModalOpen(false)}
        onSubmit={handleNewBannerSubmit}
        isLoading={createBannerMutation.isPending}
      />
    </>
  );
};

export default NotificationsFilters;
