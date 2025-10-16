import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import images from "../../../../constants/images";
import { getSupportTicketDetails } from "../../../../utils/queries/support";
import { replyToTicket, updateTicketStatus, resolveTicket, closeTicket } from "../../../../utils/mutations/support";

interface SupportModelProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData?: any;
}

const SupportModel: React.FC<SupportModelProps> = ({ isOpen, onClose, ticketData }) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch ticket details
  const { data: ticketDetails, isLoading, error } = useQuery({
    queryKey: ['supportTicketDetails', ticketData?.id],
    queryFn: () => getSupportTicketDetails(ticketData?.id),
    enabled: !!ticketData?.id && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: (data: string | FormData) => {
      if (typeof data === 'string') {
        return replyToTicket(ticketData?.id, data);
      } else {
        return replyToTicket(ticketData?.id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTicketDetails', ticketData?.id] });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setNewMessage("");
      handleRemoveFile();
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => updateTicketStatus(ticketData?.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTicketDetails', ticketData?.id] });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: () => resolveTicket(ticketData?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTicketDetails', ticketData?.id] });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });

  // Close mutation
  const closeMutation = useMutation({
    mutationFn: () => closeTicket(ticketData?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTicketDetails', ticketData?.id] });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" && !selectedFile) return;
    
    const formData = new FormData();
    formData.append('message', newMessage);
    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }
    
    replyMutation.mutate(formData);
    
    // Clear form after sending
    setNewMessage("");
    handleRemoveFile();
  };

  const handleStatusUpdate = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const handleResolve = () => {
    resolveMutation.mutate();
  };

  const handleClose = () => {
    closeMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[530px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Support</h2>
            <div className="flex flex-row items-center gap-3">
              <div className="rounded-full p-2 border border-[#CDCDCD]">
                <img
                  className="cursor-pointer"
                  src={images.shoppingcart}
                  alt=""
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md  cursor-pointer"
                aria-label="Close"
              >
                <img className="w-7 h-7" src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>
        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <p className="text-sm">Error loading ticket details</p>
          </div>
        ) : ticketDetails?.data ? (
          <div className="pr-5 pl-5 mt-3">
            <div className="flex flex-row justify-between">
              <div className="flex gap-2">
                <div>
                  <img 
                    className="w-14 h-14 rounded-full object-cover" 
                    src={images.admin} 
                    alt="User" 
                    onError={(e) => {
                      e.currentTarget.src = images.admin;
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 items-center justify-center">
                  <span className="text-lg font-semibold">
                    {ticketDetails.data.user_info?.full_name || "Unknown User"}
                  </span>
                  <span className="text-[#00000080] text-[10px] mr-[10px]">
                    {ticketDetails.data.user_info?.email || "No email"}
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <button 
                  onClick={() => handleStatusUpdate('in_progress')}
                  className="px-3 py-2 cursor-pointer text-white bg-[#E53E3E] rounded-lg mr-2"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Start Working'}
                </button>
                <button 
                  onClick={handleResolve}
                  className="px-3 py-2 cursor-pointer text-white bg-green-600 rounded-lg mr-2"
                  disabled={resolveMutation.isPending}
                >
                  {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
                </button>
                <button 
                  onClick={handleClose}
                  className="px-3 py-2 cursor-pointer text-white bg-black rounded-lg"
                  disabled={closeMutation.isPending}
                >
                  {closeMutation.isPending ? 'Closing...' : 'Close'}
                </button>
              </div>
            </div>
            {/* Ticket Information */}
            <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
              <div className="flex flex-col">
                <div className="flex flex-row justify-between items-center">
                  <span className="font-semibold text-lg">Ticket Information</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                    ticketDetails.data.ticket_info?.status === 'open' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                      : ticketDetails.data.ticket_info?.status === 'resolved'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : ticketDetails.data.ticket_info?.status === 'closed'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}>
                    {ticketDetails.data.ticket_info?.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Ticket ID</span>
                    <span className="text-sm text-gray-900">#{ticketDetails.data.ticket_info?.id || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Subject</span>
                    <span className="text-sm text-gray-900">{ticketDetails.data.ticket_info?.subject || 'No subject'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Category</span>
                    <span className="text-sm text-gray-900 capitalize">{ticketDetails.data.ticket_info?.category || 'General'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Description</span>
                    <span className="text-sm text-gray-900">{ticketDetails.data.ticket_info?.description || 'No description'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Created</span>
                    <span className="text-sm text-gray-900">
                      {ticketDetails.data.ticket_info?.created_at 
                        ? new Date(ticketDetails.data.ticket_info.created_at).toLocaleString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    <span className="text-sm text-gray-900">
                      {ticketDetails.data.ticket_info?.updated_at 
                        ? new Date(ticketDetails.data.ticket_info.updated_at).toLocaleString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Statistics */}
            {ticketDetails.data.ticket_statistics && (
              <div className="border border-[#E53E3E] bg-[#FFE5E5] rounded-2xl p-3 mt-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-lg mb-3">Ticket Statistics</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Total Messages</span>
                      <span className="text-lg font-bold text-[#E53E3E]">{ticketDetails.data.ticket_statistics.total_messages || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Unread Messages</span>
                      <span className="text-lg font-bold text-[#E53E3E]">{ticketDetails.data.ticket_statistics.unread_messages || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Messages from API */}
            {ticketDetails.data.messages && ticketDetails.data.messages.length > 0 ? (
              ticketDetails.data.messages.map((message: any, index: number) => (
                <div key={index} className="flex flex-row justify-between">
                  {message.sender_id === ticketDetails.data.user_info?.user_id ? (
                    <div></div>
                  ) : null}
                  <div className={`flex flex-col px-4 py-3 w-75 mt-3 rounded-t-3xl ${
                    message.sender_id === ticketDetails.data.user_info?.user_id 
                      ? 'bg-[#E53E3E] rounded-bl-3xl rounded-br-lg' 
                      : 'bg-[#FFD8D8] rounded-br-3xl rounded-bl-lg'
                  }`}>
                    {/* Message Text */}
                    {message.message && (
                      <span className={message.sender_id === ticketDetails.data.user_info?.user_id ? 'text-white' : 'text-black'}>
                        {message.message}
                      </span>
                    )}
                    
                    {/* Message Image */}
                    {message.attachment && (
                      <div className="mt-2">
                        <img 
                          src={message.attachment} 
                          alt="Attachment" 
                          className="max-w-full h-auto rounded-lg cursor-pointer"
                          onClick={() => window.open(message.attachment, '_blank')}
                        />
                      </div>
                    )}
                    
                    <span className={`text-[12px] flex justify-end-safe mr-4 mt-1 ${
                      message.sender_id === ticketDetails.data.user_info?.user_id ? 'text-[#FFFFFF80]' : 'text-[#00000080]'
                    }`}>
                      {message.formatted_date || message.created_at || 'Unknown time'}
                    </span>
                  </div>
                  {message.sender_id !== ticketDetails.data.user_info?.user_id ? (
                    <div></div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">No messages in this ticket yet</p>
              </div>
            )}

            {/* File Preview */}
            {previewUrl && (
              <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{selectedFile?.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile?.size || 0) / 1024 / 1024 < 1 
                        ? `${Math.round((selectedFile?.size || 0) / 1024)} KB`
                        : `${Math.round((selectedFile?.size || 0) / 1024 / 1024 * 10) / 10} MB`
                      }
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="sticky bottom-0 bg-white p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full pl-12 pr-16 py-3 border border-[#CDCDCD] rounded-2xl text-[14px] bg-[#FFFFFF]"
                  disabled={replyMutation.isPending}
                />
                {/* File Upload Input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={replyMutation.isPending}
                />
                {/* Attachment Icon */}
                <label 
                  htmlFor="file-upload"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                >
                  <img
                    className="cursor-pointer"
                    src={images.link1}
                    alt="Attachment"
                  />
                </label>
                {/* Send Button */}
                <button 
                  onClick={handleSendMessage}
                  disabled={replyMutation.isPending || (!newMessage.trim() && !selectedFile)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img className="cursor-pointer" src={images.share3} alt="Send" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-4">
            <p className="text-sm">No ticket data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default SupportModel;
