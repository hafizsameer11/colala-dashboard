import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../../constants/images";
import NewNotification from "./newnotification";
import { createNotification, updateNotificationStatus, deleteNotification } from "../../../../utils/mutations/notifications";
import { useToast } from "../../../../contexts/ToastContext";
import { filterByPeriod } from "../../../../utils/periodFilter";

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
  selectedPeriod?: string;
}

const NotificationTable: React.FC<NotificationTableProps> = ({
  onRowSelect,
  searchTerm = "",
  notificationsData,
  isLoading = false,
  error,
  currentPage = 1,
  onPageChange,
  selectedPeriod = "All time",
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<NotificationData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<{ id: number; status: string } | null>(null);
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const createNotificationMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsNewNotificationModalOpen(false);
      showToast('Notification created successfully', 'success');
    },
    onError: (error: any) => {
      console.error('Error creating notification:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create notification';
      showToast(errorMessage, 'error');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      updateNotificationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setEditingStatus(null);
      showToast('Notification status updated successfully', 'success');
    },
    onError: (error: any) => {
      console.error('Error updating notification status:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update notification status';
      showToast(errorMessage, 'error');
      setEditingStatus(null);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowDeleteConfirm(false);
      setNotificationToDelete(null);
      showToast('Notification deleted successfully', 'success');
    },
    onError: (error: any) => {
      console.error('Error deleting notification:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete notification';
      showToast(errorMessage, 'error');
      setShowDeleteConfirm(false);
    },
  });

  // Transform API data to match component expectations
  const allNotifications: NotificationData[] = useMemo(() => {
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

  // Filter by date period
  const periodFilteredNotifications = useMemo(() => {
    if (selectedPeriod === "All time") {
      return allNotifications;
    }
    return filterByPeriod(allNotifications, selectedPeriod, ['created_at', 'sent_at', 'scheduled_for', 'formatted_date', 'date']);
  }, [allNotifications, selectedPeriod]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return periodFilteredNotifications;
    return periodFilteredNotifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.link && n.link.toLowerCase().includes(q)) ||
        n.status.toLowerCase().includes(q) ||
        n.audience_type.toLowerCase().includes(q)
    );
  }, [searchTerm, periodFilteredNotifications]);

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

  const handleEditStatus = (notification: NotificationData) => {
    setEditingStatus({ id: notification.id, status: notification.status });
  };

  const handleStatusChange = (newStatus: string) => {
    if (editingStatus) {
      updateStatusMutation.mutate({ id: editingStatus.id, status: newStatus });
    }
  };

  const handleDeleteClick = (notification: NotificationData) => {
    setNotificationToDelete(notification);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      deleteNotificationMutation.mutate(notificationToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setNotificationToDelete(null);
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ['draft', 'scheduled', 'sent', 'failed'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewNotificationSubmit = (data: any) => {
    // Convert the form data to FormData for the API
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
      <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#E5E7EB] rounded-t-lg flex items-center justify-between">
        <h3 className="text-base font-medium text-[#111827]">
          Latest Notifications
        </h3>
        <button 
          onClick={handleSendNew}
          className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer hover:bg-[#d32f2f] text-sm"
        >
          Send New Notification
        </button>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        {editingStatus?.id === notification.id ? (
                          <select
                            value={editingStatus.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            onBlur={() => setEditingStatus(null)}
                            className="px-3 py-2 border border-[#989898] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53E3E] cursor-pointer"
                            autoFocus
                          >
                            <option value={editingStatus.status}>{editingStatus.status}</option>
                            {getStatusOptions(editingStatus.status).map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <>
                            <span className={`px-3 py-1.5 rounded-md text-xs font-medium ${getStatusColor(notification.status)}`}>
                              {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                            </span>
                            <button
                              onClick={() => handleEditStatus(notification)}
                              className="ml-2 border border-[#989898] rounded-xl p-2 hover:bg-gray-50 transition-colors"
                              title="Edit Status"
                            >
                              <img
                                src={images.PencilSimpleLine}
                                alt="Edit Status"
                                className="w-5 h-5 cursor-pointer"
                              />
                            </button>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteClick(notification)}
                        className="border border-[#989898] rounded-xl p-2 hover:bg-red-50 transition-colors"
                        title="Delete Notification"
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <img
                          src={images.TrashSimple}
                          alt="Delete"
                          className="w-5 h-5 cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && notificationToDelete && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Notification</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the notification <span className="font-semibold">"{notificationToDelete.title}"</span>? This will permanently delete the notification and all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteNotificationMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteNotificationMutation.isPending}
                className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg transition-colors ${
                  deleteNotificationMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                {deleteNotificationMutation.isPending ? 'Deleting...' : 'Delete Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTable;
