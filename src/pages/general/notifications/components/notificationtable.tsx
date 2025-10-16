import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../../constants/images";
import NewNotification from "./newnotification";
import { createNotification } from "../../../../utils/mutations/notifications";

interface NotificationData {
  id: number;
  title: string;
  message: string;
  link?: string;
  attachment?: string;
  audience_type: string;
  target_user_ids?: number[];
  status: string;
  scheduled_for?: string;
  sent_at?: string;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  total_recipients: number;
  successful_deliveries: number;
  failed_deliveries: number;
  created_at: string;
}

interface NotificationTableProps {
  onRowSelect?: (selectedIds: number[]) => void;
  searchTerm?: string;
  notificationsData?: any;
  isLoading?: boolean;
  error?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const NotificationTable: React.FC<NotificationTableProps> = ({
  onRowSelect,
  searchTerm = "",
  notificationsData,
  isLoading = false,
  error,
  currentPage = 1,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  const createNotificationMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsNewNotificationModalOpen(false);
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      // You could add a toast notification here
    },
  });

  // Transform API data to match component expectations
  const notifications: NotificationData[] = useMemo(() => {
    if (!notificationsData?.data?.notifications) return [];
    
    return notificationsData.data.notifications.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      attachment: notification.attachment,
      audience_type: notification.audience_type,
      target_user_ids: notification.target_user_ids,
      status: notification.status,
      scheduled_for: notification.scheduled_for,
      sent_at: notification.sent_at,
      created_by: notification.created_by,
      total_recipients: notification.total_recipients,
      successful_deliveries: notification.successful_deliveries,
      failed_deliveries: notification.failed_deliveries,
      created_at: notification.created_at,
    }));
  }, [notificationsData]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.link && n.link.toLowerCase().includes(q)) ||
        n.status.toLowerCase().includes(q) ||
        n.audience_type.toLowerCase().includes(q)
    );
  }, [searchTerm, notifications]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filtered.map((n) => n.id); // <- select filtered only
      setSelectedRows(allIds);
      onRowSelect?.(allIds);
    } else {
      setSelectedRows([]);
      onRowSelect?.([]);
    }
  };

  const handleRowSelect = (id: number) => {
    const newSelected = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelected);
    onRowSelect?.(newSelected);
  };

  const handleSendNew = () => {
    setIsNewNotificationModalOpen(true);
  };

  const handleNewNotificationSubmit = (data: any) => {
    // Convert the form data to FormData for the API
    const formData = new FormData();
    formData.append('title', data.subject);
    formData.append('message', data.message);
    formData.append('link', data.link);
    
    // Parse audience data - it comes as comma-separated string from the modal
    const audienceUserIds = data.audience ? data.audience.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)) : [];
    
    if (audienceUserIds.length > 0) {
      // Check if all buyers or all sellers are selected
      // This is a simplified check - in a real app you'd want to compare with actual buyer/seller lists
      formData.append('audience_type', 'specific');
      // Append each user ID separately for FormData
      audienceUserIds.forEach((userId: number) => {
        formData.append('target_user_ids[]', userId.toString());
      });
    } else {
      formData.append('audience_type', 'all');
    }
    
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }
    
    createNotificationMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
        <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
          <h3 className="text-base font-medium text-[#111827]">
            Latest Notifications
          </h3>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
        <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
          <h3 className="text-base font-medium text-[#111827]">
            Latest Notifications
          </h3>
        </div>
        <div className="text-center text-red-500 py-4">
          <p>Error loading notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 bg-white border border-[#E5E7EB] rounded-lg">
      <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg">
        <h3 className="text-base font-medium text-[#111827]">
          Latest Notifications
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9FAFB]">
            <tr className="border-b border-[#E5E7EB]">
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#E53E3E] focus:ring-[#E53E3E]"
                  onChange={handleSelectAll}
                  checked={
                    filtered.length > 0 &&
                    selectedRows.length === filtered.length
                  }
                />
              </th>
              <th className="p-3 text-left font-normal text-[#000]">
                Notification
              </th>
              <th className="p-3 text-center font-normal text-[#000]">Link</th>
              <th className="p-3 text-left font-normal text-[#000]">Date</th>
              <th className="p-3 text-left font-normal text-[#000]">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              filtered.map((notification, index) => (
                <tr
                  key={notification.id}
                  className={`hover:bg-[#F9FAFB] ${
                    index !== filtered.length - 1
                      ? "border-b border-[#E5E7EB]"
                      : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#E53E3E] focus:ring-[#E53E3E]"
                      checked={selectedRows.includes(notification.id)}
                      onChange={() => handleRowSelect(notification.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="max-w-sm">
                      <h4 className="text font-semibold text-[#000] mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-[#000] leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#D9D9D9] rounded-sm"></div>
                      <span className=" text-[#000]">{notification.link || 'No link'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className=" text-[#000]">
                      {notification.sent_at 
                        ? new Date(notification.sent_at).toLocaleDateString()
                        : notification.created_at 
                        ? new Date(notification.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleSendNew}
                        className="bg-[#E53E3E] text-white px-4 py-3 rounded-lg font-medium  transition-colors cursor-pointer"
                      >
                        Send New
                      </button>
                      <button className="border border-[#989898] rounded-xl p-2 ">
                        <img
                          src={images.PencilSimpleLine}
                          alt="Edit "
                          className="w-7 h-7 cursor-pointer"
                        />
                      </button>
                      <button className="border border-[#989898] rounded-xl p-2 ">
                        <img
                          src={images.TrashSimple}
                          className="w-7 h-7 cursor-pointer"
                        />
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
      {notificationsData?.data?.pagination && (
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {notificationsData.data.pagination.from || 0} to {notificationsData.data.pagination.to || 0} of {notificationsData.data.pagination.total || 0} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {notificationsData.data.pagination.last_page || 1}
            </span>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= (notificationsData.data.pagination.last_page || 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* New Notification Modal */}
      <NewNotification
        isOpen={isNewNotificationModalOpen}
        onClose={() => setIsNewNotificationModalOpen(false)}
        onSubmit={handleNewNotificationSubmit}
        isLoading={createNotificationMutation.isPending}
      />
    </div>
  );
};

export default NotificationTable;
