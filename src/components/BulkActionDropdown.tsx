import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import images from '../constants/images';

interface User {
  id: string | number;
  full_name?: string;
  userName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  wallet_balance?: string;
  walletBalance?: string;
  created_at?: string;
  createdAt?: string;
  is_active?: boolean;
  isActive?: boolean;
}

interface Order {
  id: string | number;
  order_no?: string | number;
  store_name?: string;
  storeName?: string;
  buyer_name?: string;
  buyerName?: string;
  product_name?: string;
  productName?: string;
  price?: string;
  order_date?: string;
  orderDate?: string;
  status?: string;
  status_color?: string;
  statusColor?: string;
}

interface Chat {
  id: string | number;
  store_name?: string;
  storeName?: string;
  user_name?: string;
  userName?: string;
  last_message?: string;
  lastMessage?: string;
  chat_date?: string;
  chatDate?: string;
  is_read?: boolean;
  isRead?: boolean;
  is_dispute?: boolean;
  isDispute?: boolean;
  unread_count?: number;
  unreadCount?: number;
}

interface Transaction {
  id: string | number;
  tx_id?: string;
  reference?: string;
  amount?: string | number;
  amount_formatted?: string;
  type?: string;
  status?: string;
  date?: string;
  created_at?: string;
  formatted_date?: string;
  userName?: string;
  user_name?: string;
  userEmail?: string;
  user_email?: string;
  statusColor?: string;
  status_color?: string;
}

interface Product {
  id: string | number;
  name?: string;
  product_name?: string;
  store_name?: string;
  seller_name?: string;
  price?: string | number;
  discount_price?: string | number;
  status?: string;
  quantity?: number;
  is_sponsored?: boolean;
  is_sold?: number | boolean;
  is_unavailable?: number | boolean;
  created_at?: string;
  formatted_date?: string;
  reviews_count?: number;
  average_rating?: number;
  primary_image?: string;
  description?: string;
}

interface Service {
  id: string | number;
  name?: string;
  service_name?: string;
  store_name?: string;
  seller_name?: string;
  price?: string | number;
  status?: string;
  created_at?: string;
  formatted_date?: string;
  description?: string;
}

interface Store {
  id: string | number;
  store_name?: string;
  storeName?: string;
  store_email?: string;
  storeEmail?: string;
  store_phone?: string;
  storePhone?: string;
  owner_name?: string;
  ownerName?: string;
  owner_email?: string;
  ownerEmail?: string;
  owner_phone?: string;
  ownerPhone?: string;
  profile_image?: string;
  profileImage?: string;
  banner_image?: string;
  bannerImage?: string;
  status?: string;
  level?: number;
  submission_date?: string;
  submissionDate?: string;
  formatted_date?: string;
  created_at?: string;
}

interface Subscription {
  id: string | number;
  store_name?: string;
  storeName?: string;
  owner_name?: string;
  ownerName?: string;
  plan_name?: string;
  planName?: string;
  price?: string | number;
  currency?: string;
  status?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  days_left?: number;
  daysLeft?: number;
  created_at?: string;
  formatted_date?: string;
  subscriptionDate?: string;
  status_color?: string;
  statusColor?: string;
}

interface Promotion {
  id: string | number;
  product_name?: string;
  productName?: string;
  product_image?: string;
  productImage?: string;
  store_name?: string;
  storeName?: string;
  seller_name?: string;
  sellerName?: string;
  amount?: number | string;
  duration?: number | string;
  status?: string;
  reach?: number;
  impressions?: number;
  clicks?: number;
  cpc?: string;
  created_at?: string;
  formatted_date?: string;
  date?: string;
  status_color?: string;
  statusColor?: string;
}

interface SupportTicket {
  id: string | number;
  user_name?: string;
  userName?: string;
  user_email?: string;
  userEmail?: string;
  category?: string;
  issue_type?: string;
  issueType?: string;
  description?: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
  formatted_date?: string;
  formattedDate?: string;
  updated_at?: string;
  updatedAt?: string;
  date?: string;
}

interface Dispute {
  id: string | number;
  category?: string;
  details?: string;
  status?: string;
  won_by?: string;
  wonBy?: string;
  resolution_notes?: string;
  resolutionNotes?: string;
  user_name?: string;
  userName?: string;
  user_email?: string;
  userEmail?: string;
  store_name?: string;
  storeName?: string;
  buyer_name?: string;
  buyerName?: string;
  seller_name?: string;
  sellerName?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  resolved_at?: string;
  resolvedAt?: string;
  closed_at?: string;
  closedAt?: string;
  formatted_date?: string;
  formattedDate?: string;
  date?: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
  dispute_chat?: {
    buyer?: {
      id?: number;
      name?: string;
      email?: string;
    };
    seller?: {
      id?: number;
      name?: string;
      email?: string;
    };
    store?: {
      id?: number;
      name?: string;
    };
  };
}

interface RatingReview {
  id: string | number;
  type?: string;
  reviewType?: string;
  storeName?: string;
  productName?: string;
  userName?: string;
  user_name?: string;
  userEmail?: string;
  user_email?: string;
  rating?: number;
  averageRating?: number;
  comment?: string;
  review?: string;
  created_at?: string;
  createdAt?: string;
  formatted_date?: string;
  formattedDate?: string;
  lastRating?: string;
  date?: string;
  noOfReviews?: number;
  user?: {
    id?: number;
    full_name?: string;
    name?: string;
    email?: string;
  };
  store?: {
    id?: number;
    store_name?: string;
    name?: string;
  };
  product?: {
    id?: number;
    name?: string;
  };
}

interface Notification {
  id: string | number;
  title?: string;
  message?: string;
  link?: string;
  attachment?: string;
  audience_type?: string;
  audienceType?: string;
  target_user_ids?: number[];
  targetUserIds?: number[];
  status?: string;
  scheduled_for?: string;
  scheduledFor?: string;
  sent_at?: string;
  sentAt?: string;
  created_by?: {
    id?: number;
    name?: string;
    email?: string;
  };
  createdBy?: {
    id?: number;
    name?: string;
    email?: string;
  };
  total_recipients?: number;
  totalRecipients?: number;
  successful_deliveries?: number;
  successfulDeliveries?: number;
  failed_deliveries?: number;
  failedDeliveries?: number;
  created_at?: string;
  createdAt?: string;
  formatted_date?: string;
  formattedDate?: string;
  date?: string;
}

interface Banner {
  id: string | number;
  title?: string;
  image_url?: string;
  imageUrl?: string;
  link?: string;
  audience_type?: string;
  audienceType?: string;
  target_user_ids?: number[];
  targetUserIds?: number[];
  position?: string;
  is_active?: boolean;
  isActive?: boolean;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  created_by?: {
    id?: number;
    name?: string;
    email?: string;
  };
  createdBy?: {
    id?: number;
    name?: string;
    email?: string;
  };
  total_views?: number;
  totalViews?: number;
  total_clicks?: number;
  totalClicks?: number;
  click_through_rate?: number;
  clickThroughRate?: number;
  is_currently_active?: boolean;
  isCurrentlyActive?: boolean;
  created_at?: string;
  createdAt?: string;
  formatted_date?: string;
  formattedDate?: string;
  date?: string;
}

interface WithdrawalRequest {
  id: string | number;
  userId?: string | number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  amount?: number | string;
  amountFormatted?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  formattedDate?: string;
  date?: string;
  user?: {
    id?: number;
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

interface Activity {
  id: string | number;
  activity?: string;
  created_at?: string;
  createdAt?: string;
  formattedDate?: string;
  date?: string;
}

interface BulkActionDropdownProps {
  onActionSelect?: (action: string) => void;
  selectedOrders?: User[] | Order[] | Chat[] | Transaction[] | Product[] | Service[] | Store[] | Subscription[] | Promotion[] | SupportTicket[] | Dispute[] | RatingReview[] | Notification[] | Banner[] | WithdrawalRequest[] | Activity[];
  orders?: User[] | Order[] | Chat[] | Transaction[] | Product[] | Service[] | Store[] | Subscription[] | Promotion[] | SupportTicket[] | Dispute[] | RatingReview[] | Notification[] | Banner[] | WithdrawalRequest[] | Activity[];
  dataType?: 'orders' | 'users' | 'chats' | 'transactions' | 'products' | 'services' | 'stores' | 'subscriptions' | 'promotions' | 'support' | 'tickets' | 'disputes' | 'ratings' | 'reviews' | 'notifications' | 'banners' | 'withdrawals' | 'activities';
}

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
  onActionSelect,
  selectedOrders = [],
  orders = [],
  dataType = 'orders',
}) => {
  const [isBulkDropdownOpen, setIsBulkDropdownOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState("Bulk Action");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only export actions
  const bulkActions = ["Export as CSV", "Export as PDF"];

  const handleBulkDropdownToggle = () => {
    setIsBulkDropdownOpen(!isBulkDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBulkDropdownOpen(false);
      }
    };

    if (isBulkDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBulkDropdownOpen]);


  // Export to CSV
  const exportToCSV = () => {
    const dataToExport = selectedOrders.length > 0 ? selectedOrders : orders;
    
    if (dataToExport.length === 0) {
      alert(`No ${dataType} to export`);
      return;
    }

    let csvData: Record<string, string | number>[];
    
    if (dataType === 'users') {
      csvData = (dataToExport as User[]).map((user) => ({
        'User ID': user.id,
        'Full Name': user.full_name || user.userName || 'N/A',
        'Email': user.email || 'N/A',
        'Phone': user.phone || user.phoneNumber || 'N/A',
        'Role': user.role || 'N/A',
        'Wallet Balance': user.wallet_balance || user.walletBalance || 'N/A',
        'Created At': user.created_at || user.createdAt || 'N/A',
        'Status': (user.is_active !== undefined ? user.is_active : user.isActive) ? 'Active' : 'Inactive'
      }));
    } else if (dataType === 'chats') {
      csvData = (dataToExport as Chat[]).map((chat) => ({
        'Chat ID': chat.id,
        'Store Name': chat.store_name || chat.storeName || 'N/A',
        'User Name': chat.user_name || chat.userName || 'N/A',
        'Last Message': chat.last_message || chat.lastMessage || 'N/A',
        'Chat Date': chat.chat_date || chat.chatDate || 'N/A',
        'Is Read': (chat.is_read !== undefined ? chat.is_read : chat.isRead) ? 'Yes' : 'No',
        'Is Dispute': (chat.is_dispute !== undefined ? chat.is_dispute : chat.isDispute) ? 'Yes' : 'No',
        'Unread Count': chat.unread_count || chat.unreadCount || 0
      }));
    } else if (dataType === 'transactions') {
      csvData = (dataToExport as Transaction[]).map((transaction) => {
        // Format amount properly
        let amountValue = 'N/A';
        if (transaction.amount_formatted) {
          amountValue = transaction.amount_formatted;
        } else if (typeof transaction.amount === 'number') {
          amountValue = `₦${transaction.amount.toLocaleString()}`;
        } else if (transaction.amount) {
          amountValue = String(transaction.amount);
        }

        // Format date properly
        const dateValue = transaction.formatted_date || transaction.date || transaction.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = transaction.status 
          ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Transaction ID': transaction.id,
          'Reference/TX ID': transaction.tx_id || transaction.reference || 'N/A',
          'Amount': amountValue,
          'Type': transaction.type || 'N/A',
          'Status': statusValue,
          'Status Color': transaction.status_color || transaction.statusColor || 'N/A',
          'Date': dateValue,
          'User Name': transaction.user_name || transaction.userName || 'N/A',
          'User Email': transaction.user_email || transaction.userEmail || 'N/A'
        };
      });
    } else if (dataType === 'products') {
      csvData = (dataToExport as Product[]).map((product) => {
        // Format price properly
        let priceValue = 'N/A';
        if (typeof product.price === 'number') {
          priceValue = `₦${product.price.toLocaleString()}`;
        } else if (product.price) {
          priceValue = String(product.price);
        }

        // Format discount price
        let discountPriceValue = 'N/A';
        if (product.discount_price) {
          if (typeof product.discount_price === 'number') {
            discountPriceValue = `₦${product.discount_price.toLocaleString()}`;
          } else {
            discountPriceValue = String(product.discount_price);
          }
        }

        // Format date properly
        const dateValue = product.formatted_date || product.created_at || 'N/A';

        // Format status
        const statusValue = product.status 
          ? product.status.charAt(0).toUpperCase() + product.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Product ID': product.id,
          'Product Name': product.name || product.product_name || 'N/A',
          'Store Name': product.store_name || 'N/A',
          'Seller Name': product.seller_name || 'N/A',
          'Price': priceValue,
          'Discount Price': discountPriceValue,
          'Status': statusValue,
          'Quantity': product.quantity || 0,
          'Is Sponsored': (product.is_sponsored || false) ? 'Yes' : 'No',
          'Is Sold': (product.is_sold === 1 || product.is_sold === true) ? 'Yes' : 'No',
          'Is Unavailable': (product.is_unavailable === 1 || product.is_unavailable === true) ? 'Yes' : 'No',
          'Reviews Count': product.reviews_count || 0,
          'Average Rating': product.average_rating || 0,
          'Created Date': dateValue,
          'Description': product.description || 'N/A'
        };
      });
    } else if (dataType === 'services') {
      csvData = (dataToExport as Service[]).map((service) => {
        // Format price properly
        let priceValue = 'N/A';
        if (typeof service.price === 'number') {
          priceValue = `₦${service.price.toLocaleString()}`;
        } else if (service.price) {
          priceValue = String(service.price);
        }

        // Format date properly
        const dateValue = service.formatted_date || service.created_at || 'N/A';

        // Format status
        const statusValue = service.status 
          ? service.status.charAt(0).toUpperCase() + service.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Service ID': service.id,
          'Service Name': service.name || service.service_name || 'N/A',
          'Store Name': service.store_name || 'N/A',
          'Seller Name': service.seller_name || 'N/A',
          'Price': priceValue,
          'Status': statusValue,
          'Created Date': dateValue,
          'Description': service.description || 'N/A'
        };
      });
    } else if (dataType === 'stores') {
      csvData = (dataToExport as Store[]).map((store) => {
        // Format date properly
        const dateValue = store.formatted_date || store.submission_date || store.submissionDate || store.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = store.status 
          ? store.status.charAt(0).toUpperCase() + store.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Store ID': store.id,
          'Store Name': store.store_name || store.storeName || 'N/A',
          'Store Email': store.store_email || store.storeEmail || 'N/A',
          'Store Phone': store.store_phone || store.storePhone || 'N/A',
          'Owner Name': store.owner_name || store.ownerName || 'N/A',
          'Owner Email': store.owner_email || store.ownerEmail || 'N/A',
          'Owner Phone': store.owner_phone || store.ownerPhone || 'N/A',
          'Level': store.level || 'N/A',
          'Status': statusValue,
          'Submission Date': dateValue
        };
      });
    } else if (dataType === 'subscriptions') {
      csvData = (dataToExport as Subscription[]).map((subscription) => {
        // Format price properly
        let priceValue = 'N/A';
        if (subscription.price) {
          if (typeof subscription.price === 'number') {
            priceValue = `${subscription.currency || '₦'}${subscription.price.toLocaleString()}`;
          } else {
            priceValue = String(subscription.price);
          }
        }

        // Format dates properly
        const startDate = subscription.start_date || subscription.startDate || 'N/A';
        const endDate = subscription.end_date || subscription.endDate || 'N/A';
        const subscriptionDate = subscription.formatted_date || subscription.subscriptionDate || subscription.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = subscription.status 
          ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Subscription ID': subscription.id,
          'Store Name': subscription.store_name || subscription.storeName || 'N/A',
          'Owner Name': subscription.owner_name || subscription.ownerName || 'N/A',
          'Plan Name': subscription.plan_name || subscription.planName || 'N/A',
          'Price': priceValue,
          'Currency': subscription.currency || 'N/A',
          'Status': statusValue,
          'Start Date': startDate,
          'End Date': endDate,
          'Days Left': subscription.days_left !== undefined ? subscription.days_left : (subscription.daysLeft !== undefined ? subscription.daysLeft : 'N/A'),
          'Subscription Date': subscriptionDate
        };
      });
    } else if (dataType === 'promotions') {
      csvData = (dataToExport as Promotion[]).map((promotion) => {
        // Format amount properly
        let amountValue = 'N/A';
        if (promotion.amount) {
          if (typeof promotion.amount === 'number') {
            amountValue = `₦${promotion.amount.toLocaleString()}`;
          } else {
            amountValue = String(promotion.amount);
          }
        }

        // Format duration properly
        const durationValue = promotion.duration 
          ? (typeof promotion.duration === 'number' ? `${promotion.duration} Days` : String(promotion.duration))
          : 'N/A';

        // Format date properly
        const dateValue = promotion.formatted_date || promotion.date || promotion.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = promotion.status 
          ? promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Promotion ID': promotion.id,
          'Product Name': promotion.product_name || promotion.productName || 'N/A',
          'Store Name': promotion.store_name || promotion.storeName || 'N/A',
          'Seller Name': promotion.seller_name || promotion.sellerName || 'N/A',
          'Amount': amountValue,
          'Duration': durationValue,
          'Status': statusValue,
          'Reach': promotion.reach !== undefined ? promotion.reach : 'N/A',
          'Impressions': promotion.impressions !== undefined ? promotion.impressions : 'N/A',
          'Clicks': promotion.clicks !== undefined ? promotion.clicks : 'N/A',
          'CPC': promotion.cpc || 'N/A',
          'Created Date': dateValue
        };
      });
    } else if (dataType === 'support' || dataType === 'tickets') {
      csvData = (dataToExport as SupportTicket[]).map((ticket) => {
        // Format date properly
        const dateValue = ticket.formatted_date || ticket.formattedDate || ticket.created_at || ticket.createdAt || ticket.date || 'N/A';
        const updatedDateValue = ticket.updated_at || ticket.updatedAt || 'N/A';

        // Format status with proper capitalization
        const statusValue = ticket.status 
          ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Ticket ID': ticket.id,
          'User Name': ticket.user_name || ticket.userName || 'N/A',
          'User Email': ticket.user_email || ticket.userEmail || 'N/A',
          'Category': ticket.category || 'N/A',
          'Issue Type': ticket.issue_type || ticket.issueType || ticket.category || 'N/A',
          'Description': ticket.description || 'N/A',
          'Status': statusValue,
          'Created Date': dateValue,
          'Updated Date': updatedDateValue
        };
      });
    } else if (dataType === 'disputes') {
      csvData = (dataToExport as Dispute[]).map((dispute) => {
        // Format date properly
        const dateValue = dispute.formatted_date || dispute.formattedDate || dispute.created_at || dispute.createdAt || dispute.date || 'N/A';
        const updatedDateValue = dispute.updated_at || dispute.updatedAt || 'N/A';
        const resolvedDateValue = dispute.resolved_at || dispute.resolvedAt || 'N/A';
        const closedDateValue = dispute.closed_at || dispute.closedAt || 'N/A';

        // Format status with proper capitalization
        const statusValue = dispute.status 
          ? dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1).toLowerCase().replace('_', ' ')
          : 'N/A';

        // Get user and store names from nested structures
        const userName = dispute.user_name || dispute.userName || dispute.user?.name || dispute.dispute_chat?.buyer?.name || 'N/A';
        const userEmail = dispute.user_email || dispute.userEmail || dispute.user?.email || dispute.dispute_chat?.buyer?.email || 'N/A';
        const storeName = dispute.store_name || dispute.storeName || dispute.dispute_chat?.store?.name || 'N/A';
        const sellerName = dispute.seller_name || dispute.sellerName || dispute.dispute_chat?.seller?.name || 'N/A';

        return {
          'Dispute ID': dispute.id,
          'User Name': userName,
          'User Email': userEmail,
          'Store Name': storeName,
          'Seller Name': sellerName,
          'Category': dispute.category || 'N/A',
          'Details': dispute.details || 'N/A',
          'Status': statusValue,
          'Won By': dispute.won_by || dispute.wonBy || 'N/A',
          'Resolution Notes': dispute.resolution_notes || dispute.resolutionNotes || 'N/A',
          'Created Date': dateValue,
          'Updated Date': updatedDateValue,
          'Resolved Date': resolvedDateValue,
          'Closed Date': closedDateValue
        };
      });
    } else if (dataType === 'ratings' || dataType === 'reviews') {
      csvData = (dataToExport as RatingReview[]).map((review) => {
        // Format date properly
        const dateValue = review.formatted_date || review.formattedDate || review.created_at || review.createdAt || review.lastRating || review.date || 'N/A';
        
        // Get user name and email from nested structures
        const userName = review.user_name || review.userName || review.user?.full_name || review.user?.name || 'N/A';
        const userEmail = review.user_email || review.userEmail || review.user?.email || 'N/A';
        
        // Get store and product names
        const storeName = review.storeName || review.store?.store_name || review.store?.name || 'N/A';
        const productName = review.productName || review.product?.name || 'N/A';
        
        // Get review type
        const reviewType = review.type || review.reviewType || 'N/A';
        
        // Get rating
        const rating = review.rating || review.averageRating || 'N/A';
        
        // Get comment/review text
        const comment = review.comment || review.review || 'N/A';

        return {
          'Review ID': review.id,
          'Type': reviewType,
          'User Name': userName,
          'User Email': userEmail,
          'Store Name': storeName,
          'Product Name': productName,
          'Rating': rating,
          'Comment': comment,
          'Date': dateValue,
          'Number of Reviews': review.noOfReviews || 1
        };
      });
    } else if (dataType === 'notifications') {
      csvData = (dataToExport as Notification[]).map((notification) => {
        // Format date properly
        const dateValue = notification.formatted_date || notification.formattedDate || notification.created_at || notification.createdAt || notification.date || 'N/A';
        const sentDateValue = notification.sent_at || notification.sentAt || 'N/A';
        const scheduledDateValue = notification.scheduled_for || notification.scheduledFor || 'N/A';
        
        // Get creator name and email from nested structures
        const creatorName = notification.created_by?.name || notification.createdBy?.name || 'N/A';
        const creatorEmail = notification.created_by?.email || notification.createdBy?.email || 'N/A';
        
        // Format status with proper capitalization
        const statusValue = notification.status 
          ? notification.status.charAt(0).toUpperCase() + notification.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Notification ID': notification.id,
          'Title': notification.title || 'N/A',
          'Message': notification.message || 'N/A',
          'Link': notification.link || 'N/A',
          'Audience Type': notification.audience_type || notification.audienceType || 'N/A',
          'Status': statusValue,
          'Scheduled For': scheduledDateValue,
          'Sent At': sentDateValue,
          'Created By': creatorName,
          'Creator Email': creatorEmail,
          'Total Recipients': notification.total_recipients || notification.totalRecipients || 0,
          'Successful Deliveries': notification.successful_deliveries || notification.successfulDeliveries || 0,
          'Failed Deliveries': notification.failed_deliveries || notification.failedDeliveries || 0,
          'Created Date': dateValue
        };
      });
    } else if (dataType === 'banners') {
      csvData = (dataToExport as Banner[]).map((banner) => {
        // Format date properly
        const dateValue = banner.formatted_date || banner.formattedDate || banner.created_at || banner.createdAt || banner.date || 'N/A';
        const startDateValue = banner.start_date || banner.startDate || 'N/A';
        const endDateValue = banner.end_date || banner.endDate || 'N/A';
        
        // Get creator name and email from nested structures
        const creatorName = banner.created_by?.name || banner.createdBy?.name || 'N/A';
        const creatorEmail = banner.created_by?.email || banner.createdBy?.email || 'N/A';
        
        // Format boolean values
        const isActive = banner.is_active !== undefined ? banner.is_active : (banner.isActive !== undefined ? banner.isActive : false);
        const isCurrentlyActive = banner.is_currently_active !== undefined ? banner.is_currently_active : (banner.isCurrentlyActive !== undefined ? banner.isCurrentlyActive : false);

        return {
          'Banner ID': banner.id,
          'Title': banner.title || 'N/A',
          'Image URL': banner.image_url || banner.imageUrl || 'N/A',
          'Link': banner.link || 'N/A',
          'Position': banner.position || 'N/A',
          'Audience Type': banner.audience_type || banner.audienceType || 'N/A',
          'Is Active': isActive ? 'Yes' : 'No',
          'Is Currently Active': isCurrentlyActive ? 'Yes' : 'No',
          'Start Date': startDateValue,
          'End Date': endDateValue,
          'Created By': creatorName,
          'Creator Email': creatorEmail,
          'Total Views': banner.total_views || banner.totalViews || 0,
          'Total Clicks': banner.total_clicks || banner.totalClicks || 0,
          'Click Through Rate': banner.click_through_rate || banner.clickThroughRate || 0,
          'Created Date': dateValue
        };
      });
    } else if (dataType === 'withdrawals') {
      csvData = (dataToExport as WithdrawalRequest[]).map((request) => {
        // Format date properly
        const dateValue = request.formattedDate || request.date || request.createdAt || request.created_at || 'N/A';
        const updatedDateValue = request.updatedAt || request.updated_at || 'N/A';
        
        // Format amount properly
        let amountValue = 'N/A';
        if (request.amountFormatted) {
          amountValue = request.amountFormatted;
        } else if (typeof request.amount === 'number') {
          amountValue = `₦${request.amount.toLocaleString()}`;
        } else if (request.amount) {
          amountValue = String(request.amount);
        }
        
        // Get user info from nested structure or direct fields
        const userName = request.userName || request.user?.full_name || 'N/A';
        const userEmail = request.userEmail || request.user?.email || 'N/A';
        const userPhone = request.userPhone || request.user?.phone || 'N/A';
        
        // Format status with proper capitalization
        const statusValue = request.status 
          ? request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase()
          : 'N/A';

        return {
          'Request ID': request.id,
          'User ID': request.userId || request.user?.id || 'N/A',
          'User Name': userName,
          'User Email': userEmail,
          'User Phone': userPhone,
          'Amount': amountValue,
          'Bank Name': request.bankName || 'N/A',
          'Account Name': request.accountName || 'N/A',
          'Account Number': request.accountNumber || 'N/A',
          'Status': statusValue,
          'Created Date': dateValue,
          'Updated Date': updatedDateValue
        };
      });
    } else {
      csvData = (dataToExport as Order[]).map((order) => ({
        'Order ID': order.id,
        'Store Name': order.store_name || order.storeName || 'N/A',
        'Buyer Name': order.buyer_name || order.buyerName || 'N/A',
        'Product Name': order.product_name || order.productName || 'N/A',
        'Price': order.price || 'N/A',
        'Order Date': order.order_date || order.orderDate || 'N/A',
        'Status': order.status || 'N/A'
      }));
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const dataToExport = selectedOrders.length > 0 ? selectedOrders : orders;
    
    if (dataToExport.length === 0) {
      alert(`No ${dataType} to export`);
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`, 14, 22);
    
    // Prepare table data
    let tableData;
    let headers;
    
    if (dataType === 'users') {
      headers = ['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'Wallet Balance', 'Status'];
      tableData = (dataToExport as User[]).map((user) => [
        String(user.id),
        user.full_name || user.userName || 'N/A',
        user.email || 'N/A',
        user.phone || user.phoneNumber || 'N/A',
        user.role || 'N/A',
        user.wallet_balance || user.walletBalance || 'N/A',
        (user.is_active !== undefined ? user.is_active : user.isActive) ? 'Active' : 'Inactive'
      ]);
    } else if (dataType === 'chats') {
      headers = ['Chat ID', 'Store Name', 'User Name', 'Last Message', 'Chat Date', 'Is Read', 'Is Dispute'];
      tableData = (dataToExport as Chat[]).map((chat) => [
        String(chat.id),
        chat.store_name || chat.storeName || 'N/A',
        chat.user_name || chat.userName || 'N/A',
        chat.last_message || chat.lastMessage || 'N/A',
        chat.chat_date || chat.chatDate || 'N/A',
        (chat.is_read !== undefined ? chat.is_read : chat.isRead) ? 'Yes' : 'No',
        (chat.is_dispute !== undefined ? chat.is_dispute : chat.isDispute) ? 'Yes' : 'No'
      ]);
    } else if (dataType === 'transactions') {
      headers = ['Transaction ID', 'Reference/TX ID', 'Amount', 'Type', 'Status', 'Status Color', 'Date', 'User Name', 'User Email'];
      tableData = (dataToExport as Transaction[]).map((transaction) => {
        // Format amount properly
        let amountValue = 'N/A';
        if (transaction.amount_formatted) {
          amountValue = transaction.amount_formatted;
        } else if (typeof transaction.amount === 'number') {
          amountValue = `₦${transaction.amount.toLocaleString()}`;
        } else if (transaction.amount) {
          amountValue = String(transaction.amount);
        }

        // Format date properly
        const dateValue = transaction.formatted_date || transaction.date || transaction.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = transaction.status 
          ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(transaction.id),
          transaction.tx_id || transaction.reference || 'N/A',
          amountValue,
          transaction.type || 'N/A',
          statusValue,
          transaction.status_color || transaction.statusColor || 'N/A',
          dateValue,
          transaction.user_name || transaction.userName || 'N/A',
          transaction.user_email || transaction.userEmail || 'N/A'
        ];
      });
    } else if (dataType === 'products') {
      headers = ['Product ID', 'Product Name', 'Store Name', 'Seller Name', 'Price', 'Discount Price', 'Status', 'Quantity', 'Is Sponsored', 'Is Sold', 'Is Unavailable', 'Reviews Count', 'Average Rating', 'Created Date'];
      tableData = (dataToExport as Product[]).map((product) => {
        // Format price properly
        let priceValue = 'N/A';
        if (typeof product.price === 'number') {
          priceValue = `₦${product.price.toLocaleString()}`;
        } else if (product.price) {
          priceValue = String(product.price);
        }

        // Format discount price
        let discountPriceValue = 'N/A';
        if (product.discount_price) {
          if (typeof product.discount_price === 'number') {
            discountPriceValue = `₦${product.discount_price.toLocaleString()}`;
          } else {
            discountPriceValue = String(product.discount_price);
          }
        }

        // Format date properly
        const dateValue = product.formatted_date || product.created_at || 'N/A';

        // Format status
        const statusValue = product.status 
          ? product.status.charAt(0).toUpperCase() + product.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(product.id),
          product.name || product.product_name || 'N/A',
          product.store_name || 'N/A',
          product.seller_name || 'N/A',
          priceValue,
          discountPriceValue,
          statusValue,
          String(product.quantity || 0),
          (product.is_sponsored || false) ? 'Yes' : 'No',
          (product.is_sold === 1 || product.is_sold === true) ? 'Yes' : 'No',
          (product.is_unavailable === 1 || product.is_unavailable === true) ? 'Yes' : 'No',
          String(product.reviews_count || 0),
          String(product.average_rating || 0),
          dateValue
        ];
      });
    } else if (dataType === 'services') {
      headers = ['Service ID', 'Service Name', 'Store Name', 'Seller Name', 'Price', 'Status', 'Created Date'];
      tableData = (dataToExport as Service[]).map((service) => {
        // Format price properly
        let priceValue = 'N/A';
        if (typeof service.price === 'number') {
          priceValue = `₦${service.price.toLocaleString()}`;
        } else if (service.price) {
          priceValue = String(service.price);
        }

        // Format date properly
        const dateValue = service.formatted_date || service.created_at || 'N/A';

        // Format status
        const statusValue = service.status 
          ? service.status.charAt(0).toUpperCase() + service.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(service.id),
          service.name || service.service_name || 'N/A',
          service.store_name || 'N/A',
          service.seller_name || 'N/A',
          priceValue,
          statusValue,
          dateValue
        ];
      });
    } else if (dataType === 'stores') {
      headers = ['Store ID', 'Store Name', 'Store Email', 'Store Phone', 'Owner Name', 'Owner Email', 'Owner Phone', 'Level', 'Status', 'Submission Date'];
      tableData = (dataToExport as Store[]).map((store) => {
        // Format date properly
        const dateValue = store.formatted_date || store.submission_date || store.submissionDate || store.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = store.status 
          ? store.status.charAt(0).toUpperCase() + store.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(store.id),
          store.store_name || store.storeName || 'N/A',
          store.store_email || store.storeEmail || 'N/A',
          store.store_phone || store.storePhone || 'N/A',
          store.owner_name || store.ownerName || 'N/A',
          store.owner_email || store.ownerEmail || 'N/A',
          store.owner_phone || store.ownerPhone || 'N/A',
          String(store.level || 'N/A'),
          statusValue,
          dateValue
        ];
      });
    } else if (dataType === 'subscriptions') {
      headers = ['Subscription ID', 'Store Name', 'Owner Name', 'Plan Name', 'Price', 'Currency', 'Status', 'Start Date', 'End Date', 'Days Left', 'Subscription Date'];
      tableData = (dataToExport as Subscription[]).map((subscription) => {
        // Format price properly
        let priceValue = 'N/A';
        if (subscription.price) {
          if (typeof subscription.price === 'number') {
            priceValue = `${subscription.currency || '₦'}${subscription.price.toLocaleString()}`;
          } else {
            priceValue = String(subscription.price);
          }
        }

        // Format dates properly
        const startDate = subscription.start_date || subscription.startDate || 'N/A';
        const endDate = subscription.end_date || subscription.endDate || 'N/A';
        const subscriptionDate = subscription.formatted_date || subscription.subscriptionDate || subscription.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = subscription.status 
          ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(subscription.id),
          subscription.store_name || subscription.storeName || 'N/A',
          subscription.owner_name || subscription.ownerName || 'N/A',
          subscription.plan_name || subscription.planName || 'N/A',
          priceValue,
          subscription.currency || 'N/A',
          statusValue,
          startDate,
          endDate,
          String(subscription.days_left !== undefined ? subscription.days_left : (subscription.daysLeft !== undefined ? subscription.daysLeft : 'N/A')),
          subscriptionDate
        ];
      });
    } else if (dataType === 'promotions') {
      headers = ['Promotion ID', 'Product Name', 'Store Name', 'Seller Name', 'Amount', 'Duration', 'Status', 'Reach', 'Impressions', 'Clicks', 'CPC', 'Created Date'];
      tableData = (dataToExport as Promotion[]).map((promotion) => {
        // Format amount properly
        let amountValue = 'N/A';
        if (promotion.amount) {
          if (typeof promotion.amount === 'number') {
            amountValue = `₦${promotion.amount.toLocaleString()}`;
          } else {
            amountValue = String(promotion.amount);
          }
        }

        // Format duration properly
        const durationValue = promotion.duration 
          ? (typeof promotion.duration === 'number' ? `${promotion.duration} Days` : String(promotion.duration))
          : 'N/A';

        // Format date properly
        const dateValue = promotion.formatted_date || promotion.date || promotion.created_at || 'N/A';

        // Format status with proper capitalization
        const statusValue = promotion.status 
          ? promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(promotion.id),
          promotion.product_name || promotion.productName || 'N/A',
          promotion.store_name || promotion.storeName || 'N/A',
          promotion.seller_name || promotion.sellerName || 'N/A',
          amountValue,
          durationValue,
          statusValue,
          String(promotion.reach !== undefined ? promotion.reach : 'N/A'),
          String(promotion.impressions !== undefined ? promotion.impressions : 'N/A'),
          String(promotion.clicks !== undefined ? promotion.clicks : 'N/A'),
          promotion.cpc || 'N/A',
          dateValue
        ];
      });
    } else if (dataType === 'support' || dataType === 'tickets') {
      headers = ['Ticket ID', 'User Name', 'User Email', 'Category', 'Issue Type', 'Description', 'Status', 'Created Date', 'Updated Date'];
      tableData = (dataToExport as SupportTicket[]).map((ticket) => {
        // Format date properly
        const dateValue = ticket.formatted_date || ticket.formattedDate || ticket.created_at || ticket.createdAt || ticket.date || 'N/A';
        const updatedDateValue = ticket.updated_at || ticket.updatedAt || 'N/A';

        // Format status with proper capitalization
        const statusValue = ticket.status 
          ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(ticket.id),
          ticket.user_name || ticket.userName || 'N/A',
          ticket.user_email || ticket.userEmail || 'N/A',
          ticket.category || 'N/A',
          ticket.issue_type || ticket.issueType || ticket.category || 'N/A',
          ticket.description || 'N/A',
          statusValue,
          dateValue,
          updatedDateValue
        ];
      });
    } else if (dataType === 'disputes') {
      headers = ['Dispute ID', 'User Name', 'User Email', 'Store Name', 'Seller Name', 'Category', 'Details', 'Status', 'Won By', 'Resolution Notes', 'Created Date', 'Updated Date', 'Resolved Date', 'Closed Date'];
      tableData = (dataToExport as Dispute[]).map((dispute) => {
        // Format date properly
        const dateValue = dispute.formatted_date || dispute.formattedDate || dispute.created_at || dispute.createdAt || dispute.date || 'N/A';
        const updatedDateValue = dispute.updated_at || dispute.updatedAt || 'N/A';
        const resolvedDateValue = dispute.resolved_at || dispute.resolvedAt || 'N/A';
        const closedDateValue = dispute.closed_at || dispute.closedAt || 'N/A';

        // Format status with proper capitalization
        const statusValue = dispute.status 
          ? dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1).toLowerCase().replace('_', ' ')
          : 'N/A';

        // Get user and store names from nested structures
        const userName = dispute.user_name || dispute.userName || dispute.user?.name || dispute.dispute_chat?.buyer?.name || 'N/A';
        const userEmail = dispute.user_email || dispute.userEmail || dispute.user?.email || dispute.dispute_chat?.buyer?.email || 'N/A';
        const storeName = dispute.store_name || dispute.storeName || dispute.dispute_chat?.store?.name || 'N/A';
        const sellerName = dispute.seller_name || dispute.sellerName || dispute.dispute_chat?.seller?.name || 'N/A';

        return [
          String(dispute.id),
          userName,
          userEmail,
          storeName,
          sellerName,
          dispute.category || 'N/A',
          dispute.details || 'N/A',
          statusValue,
          dispute.won_by || dispute.wonBy || 'N/A',
          dispute.resolution_notes || dispute.resolutionNotes || 'N/A',
          dateValue,
          updatedDateValue,
          resolvedDateValue,
          closedDateValue
        ];
      });
    } else if (dataType === 'ratings' || dataType === 'reviews') {
      headers = ['Review ID', 'Type', 'User Name', 'User Email', 'Store Name', 'Product Name', 'Rating', 'Comment', 'Date', 'Number of Reviews'];
      tableData = (dataToExport as RatingReview[]).map((review) => {
        // Format date properly
        const dateValue = review.formatted_date || review.formattedDate || review.created_at || review.createdAt || review.lastRating || review.date || 'N/A';
        
        // Get user name and email from nested structures
        const userName = review.user_name || review.userName || review.user?.full_name || review.user?.name || 'N/A';
        const userEmail = review.user_email || review.userEmail || review.user?.email || 'N/A';
        
        // Get store and product names
        const storeName = review.storeName || review.store?.store_name || review.store?.name || 'N/A';
        const productName = review.productName || review.product?.name || 'N/A';
        
        // Get review type
        const reviewType = review.type || review.reviewType || 'N/A';
        
        // Get rating
        const rating = review.rating || review.averageRating || 'N/A';
        
        // Get comment/review text
        const comment = review.comment || review.review || 'N/A';

        return [
          String(review.id),
          reviewType,
          userName,
          userEmail,
          storeName,
          productName,
          String(rating),
          comment,
          dateValue,
          String(review.noOfReviews || 1)
        ];
      });
    } else if (dataType === 'notifications') {
      headers = ['Notification ID', 'Title', 'Message', 'Link', 'Audience Type', 'Status', 'Scheduled For', 'Sent At', 'Created By', 'Creator Email', 'Total Recipients', 'Successful Deliveries', 'Failed Deliveries', 'Created Date'];
      tableData = (dataToExport as Notification[]).map((notification) => {
        // Format date properly
        const dateValue = notification.formatted_date || notification.formattedDate || notification.created_at || notification.createdAt || notification.date || 'N/A';
        const sentDateValue = notification.sent_at || notification.sentAt || 'N/A';
        const scheduledDateValue = notification.scheduled_for || notification.scheduledFor || 'N/A';
        
        // Get creator name and email from nested structures
        const creatorName = notification.created_by?.name || notification.createdBy?.name || 'N/A';
        const creatorEmail = notification.created_by?.email || notification.createdBy?.email || 'N/A';
        
        // Format status with proper capitalization
        const statusValue = notification.status 
          ? notification.status.charAt(0).toUpperCase() + notification.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(notification.id),
          notification.title || 'N/A',
          notification.message || 'N/A',
          notification.link || 'N/A',
          notification.audience_type || notification.audienceType || 'N/A',
          statusValue,
          scheduledDateValue,
          sentDateValue,
          creatorName,
          creatorEmail,
          String(notification.total_recipients || notification.totalRecipients || 0),
          String(notification.successful_deliveries || notification.successfulDeliveries || 0),
          String(notification.failed_deliveries || notification.failedDeliveries || 0),
          dateValue
        ];
      });
    } else if (dataType === 'banners') {
      headers = ['Banner ID', 'Title', 'Image URL', 'Link', 'Position', 'Audience Type', 'Is Active', 'Is Currently Active', 'Start Date', 'End Date', 'Created By', 'Creator Email', 'Total Views', 'Total Clicks', 'Click Through Rate', 'Created Date'];
      tableData = (dataToExport as Banner[]).map((banner) => {
        // Format date properly
        const dateValue = banner.formatted_date || banner.formattedDate || banner.created_at || banner.createdAt || banner.date || 'N/A';
        const startDateValue = banner.start_date || banner.startDate || 'N/A';
        const endDateValue = banner.end_date || banner.endDate || 'N/A';
        
        // Get creator name and email from nested structures
        const creatorName = banner.created_by?.name || banner.createdBy?.name || 'N/A';
        const creatorEmail = banner.created_by?.email || banner.createdBy?.email || 'N/A';
        
        // Format boolean values
        const isActive = banner.is_active !== undefined ? banner.is_active : (banner.isActive !== undefined ? banner.isActive : false);
        const isCurrentlyActive = banner.is_currently_active !== undefined ? banner.is_currently_active : (banner.isCurrentlyActive !== undefined ? banner.isCurrentlyActive : false);

        return [
          String(banner.id),
          banner.title || 'N/A',
          banner.image_url || banner.imageUrl || 'N/A',
          banner.link || 'N/A',
          banner.position || 'N/A',
          banner.audience_type || banner.audienceType || 'N/A',
          isActive ? 'Yes' : 'No',
          isCurrentlyActive ? 'Yes' : 'No',
          startDateValue,
          endDateValue,
          creatorName,
          creatorEmail,
          String(banner.total_views || banner.totalViews || 0),
          String(banner.total_clicks || banner.totalClicks || 0),
          String(banner.click_through_rate || banner.clickThroughRate || 0),
          dateValue
        ];
      });
    } else if (dataType === 'withdrawals') {
      headers = ['Request ID', 'User ID', 'User Name', 'User Email', 'User Phone', 'Amount', 'Bank Name', 'Account Name', 'Account Number', 'Status', 'Created Date', 'Updated Date'];
      tableData = (dataToExport as WithdrawalRequest[]).map((request) => {
        // Format date properly
        const dateValue = request.formattedDate || request.date || request.createdAt || request.created_at || 'N/A';
        const updatedDateValue = request.updatedAt || request.updated_at || 'N/A';
        
        // Format amount properly
        let amountValue = 'N/A';
        if (request.amountFormatted) {
          amountValue = request.amountFormatted;
        } else if (typeof request.amount === 'number') {
          amountValue = `₦${request.amount.toLocaleString()}`;
        } else if (request.amount) {
          amountValue = String(request.amount);
        }
        
        // Get user info from nested structure or direct fields
        const userName = request.userName || request.user?.full_name || 'N/A';
        const userEmail = request.userEmail || request.user?.email || 'N/A';
        const userPhone = request.userPhone || request.user?.phone || 'N/A';
        
        // Format status with proper capitalization
        const statusValue = request.status 
          ? request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase()
          : 'N/A';

        return [
          String(request.id),
          String(request.userId || request.user?.id || 'N/A'),
          userName,
          userEmail,
          userPhone,
          amountValue,
          request.bankName || 'N/A',
          request.accountName || 'N/A',
          request.accountNumber || 'N/A',
          statusValue,
          dateValue,
          updatedDateValue
        ];
      });
    } else if (dataType === 'activities') {
      headers = ['Activity ID', 'Activity', 'Date', 'Created At'];
      tableData = (dataToExport as Activity[]).map((activity) => {
        // Format date properly
        const dateValue = activity.formattedDate || activity.date || activity.createdAt || activity.created_at || 'N/A';
        
        return [
          String(activity.id),
          activity.activity || 'N/A',
          dateValue,
          activity.created_at || activity.createdAt || 'N/A'
        ];
      });
    } else {
      headers = ['Order ID', 'Store Name', 'Buyer Name', 'Product Name', 'Price', 'Order Date', 'Status'];
      tableData = (dataToExport as Order[]).map((order) => [
        String(order.id),
        order.store_name || order.storeName || 'N/A',
        order.buyer_name || order.buyerName || 'N/A',
        order.product_name || order.productName || 'N/A',
        order.price || 'N/A',
        order.order_date || order.orderDate || 'N/A',
        order.status || 'N/A'
      ]);
    }

    // Add table using autoTable
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [229, 62, 62] }
    });

    // Save the PDF
    doc.save(`${dataType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleBulkOptionSelect = (action: string) => {
    setSelectedBulkAction(action);
    setIsBulkDropdownOpen(false);

    // Call the parent callback if provided
    if (onActionSelect) {
      onActionSelect(action);
    }

    // Handle export actions only
    switch (action) {
      case 'Export as CSV':
        exportToCSV();
        break;
      case 'Export as PDF':
        exportToPDF();
        break;
      default:
        console.log("Selected action:", action);
    }
  };



  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={handleBulkDropdownToggle}
        className="inline-flex justify-center items-center px-6 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {selectedBulkAction}
        <img 
          src={images.dropdown} 
          alt="" 
          className={`w-4 h-4 ml-2 transition-transform ${isBulkDropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isBulkDropdownOpen && (
        <div className="absolute z-10 mt-2 w-38 bg-white border border-gray-200 font-semibold rounded-2xl shadow-lg">
          {bulkActions.map((action) => (
            <button
              key={action}
              onClick={() => handleBulkOptionSelect(action)}
              className="block w-full text-left px-4 py-2 text-sm text-black cursor-pointer hover:bg-gray-100 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BulkActionDropdown;
