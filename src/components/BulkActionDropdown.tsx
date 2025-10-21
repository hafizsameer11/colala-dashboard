import React, { useState } from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

interface User {
  id: string | number;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  wallet_balance?: string;
  created_at?: string;
  is_active?: boolean;
}

interface Order {
  id: string | number;
  order_no?: string | number;
  store_name?: string;
  buyer_name?: string;
  product_name?: string;
  price?: string;
  order_date?: string;
  status?: string;
}

interface Chat {
  id: string | number;
  store_name?: string;
  user_name?: string;
  last_message?: string;
  chat_date?: string;
  is_read?: boolean;
  is_dispute?: boolean;
  unread_count?: number;
}

interface Transaction {
  id: string | number;
  reference?: string;
  amount?: string;
  type?: string;
  status?: string;
  date?: string;
  userName?: string;
  userEmail?: string;
  statusColor?: string;
}

interface BulkActionDropdownProps {
  onActionSelect?: (action: string) => void;
  selectedOrders?: User[] | Order[] | Chat[] | Transaction[];
  orders?: User[] | Order[] | Chat[] | Transaction[];
  dataType?: 'orders' | 'users' | 'chats' | 'transactions';
}

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
  onActionSelect,
  selectedOrders = [],
  orders = [],
  dataType = 'orders',
}) => {
  const [isBulkDropdownOpen, setIsBulkDropdownOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState("Bulk Action");

  // Only export actions
  const bulkActions = ["Export as CSV", "Export as PDF"];

  const handleBulkDropdownToggle = () => {
    setIsBulkDropdownOpen(!isBulkDropdownOpen);
  };


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
        'Full Name': user.full_name || 'N/A',
        'Email': user.email || 'N/A',
        'Phone': user.phone || 'N/A',
        'Role': user.role || 'N/A',
        'Wallet Balance': user.wallet_balance || 'N/A',
        'Created At': user.created_at || 'N/A',
        'Status': user.is_active ? 'Active' : 'Inactive'
      }));
    } else if (dataType === 'chats') {
      csvData = (dataToExport as Chat[]).map((chat) => ({
        'Chat ID': chat.id,
        'Store Name': chat.store_name || 'N/A',
        'User Name': chat.user_name || 'N/A',
        'Last Message': chat.last_message || 'N/A',
        'Chat Date': chat.chat_date || 'N/A',
        'Is Read': chat.is_read ? 'Yes' : 'No',
        'Is Dispute': chat.is_dispute ? 'Yes' : 'No',
        'Unread Count': chat.unread_count || 0
      }));
    } else if (dataType === 'transactions') {
      csvData = (dataToExport as Transaction[]).map((transaction) => ({
        'Transaction ID': transaction.id,
        'Reference': transaction.reference || 'N/A',
        'Amount': transaction.amount || 'N/A',
        'Type': transaction.type || 'N/A',
        'Status': transaction.status || 'N/A',
        'Date': transaction.date || 'N/A',
        'User Name': transaction.userName || 'N/A',
        'User Email': transaction.userEmail || 'N/A'
      }));
    } else {
      csvData = (dataToExport as Order[]).map((order) => ({
        'Order ID': order.id,
        'Store Name': order.store_name || 'N/A',
        'Buyer Name': order.buyer_name || 'N/A',
        'Product Name': order.product_name || 'N/A',
        'Price': order.price || 'N/A',
        'Order Date': order.order_date || 'N/A',
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
        user.full_name || 'N/A',
        user.email || 'N/A',
        user.phone || 'N/A',
        user.role || 'N/A',
        user.wallet_balance || 'N/A',
        user.is_active ? 'Active' : 'Inactive'
      ]);
    } else if (dataType === 'chats') {
      headers = ['Chat ID', 'Store Name', 'User Name', 'Last Message', 'Chat Date', 'Is Read', 'Is Dispute'];
      tableData = (dataToExport as Chat[]).map((chat) => [
        String(chat.id),
        chat.store_name || 'N/A',
        chat.user_name || 'N/A',
        chat.last_message || 'N/A',
        chat.chat_date || 'N/A',
        chat.is_read ? 'Yes' : 'No',
        chat.is_dispute ? 'Yes' : 'No'
      ]);
    } else if (dataType === 'transactions') {
      headers = ['Transaction ID', 'Reference', 'Amount', 'Type', 'Status', 'Date', 'User Name', 'User Email'];
      tableData = (dataToExport as Transaction[]).map((transaction) => [
        String(transaction.id),
        transaction.reference || 'N/A',
        transaction.amount || 'N/A',
        transaction.type || 'N/A',
        transaction.status || 'N/A',
        transaction.date || 'N/A',
        transaction.userName || 'N/A',
        transaction.userEmail || 'N/A'
      ]);
    } else {
      headers = ['Order ID', 'Store Name', 'Buyer Name', 'Product Name', 'Price', 'Order Date', 'Status'];
      tableData = (dataToExport as Order[]).map((order) => [
        String(order.id),
        order.store_name || 'N/A',
        order.buyer_name || 'N/A',
        order.product_name || 'N/A',
        order.price || 'N/A',
        order.order_date || 'N/A',
        order.status || 'N/A'
      ]);
    }

    // Add table
    (doc as jsPDF & { autoTable: (options: { head: string[][], body: string[][], startY: number, styles: { fontSize: number }, headStyles: { fillColor: number[] } }) => void }).autoTable({
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
    <div className="relative inline-block text-left">
      <button
        onClick={handleBulkDropdownToggle}
        className="inline-flex justify-center items-center px-6 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer"
      >
        {selectedBulkAction}
      </button>

      {isBulkDropdownOpen && (
        <div className="absolute z-10 mt-2 w-38 bg-white border border-gray-200 font-semibold rounded-2xl shadow-lg">
          {bulkActions.map((action) => (
            <button
              key={action}
              onClick={() => handleBulkOptionSelect(action)}
              className="block w-full text-left px-4 py-2 text-sm text-black cursor-pointer"
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
