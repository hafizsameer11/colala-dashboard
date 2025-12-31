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

interface BulkActionDropdownProps {
  onActionSelect?: (action: string) => void;
  selectedOrders?: User[] | Order[] | Chat[] | Transaction[] | Product[] | Service[];
  orders?: User[] | Order[] | Chat[] | Transaction[] | Product[] | Service[];
  dataType?: 'orders' | 'users' | 'chats' | 'transactions' | 'products' | 'services';
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
