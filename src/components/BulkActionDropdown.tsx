import React, { useState } from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

interface BulkActionDropdownProps {
  onActionSelect?: (action: string) => void;
  selectedOrders?: any[];
  orders?: any[];
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

  const bulkActions = ["Export as CSV", "Export as PDF", "Delete"];

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

    let csvData;
    if (dataType === 'users') {
      csvData = dataToExport.map((user: any) => ({
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
      csvData = dataToExport.map((chat: any) => ({
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
      csvData = dataToExport.map((transaction: any) => ({
        'Transaction ID': transaction.id,
        'TX ID': transaction.tx_id || 'N/A',
        'Amount': transaction.amount || 'N/A',
        'Type': transaction.type || 'N/A',
        'Status': transaction.status || 'N/A',
        'Date': transaction.tx_date || 'N/A',
        'Created At': transaction.created_at || 'N/A'
      }));
    } else {
      csvData = dataToExport.map((order: any) => ({
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
      tableData = dataToExport.map((user: any) => [
        user.id,
        user.full_name || 'N/A',
        user.email || 'N/A',
        user.phone || 'N/A',
        user.role || 'N/A',
        user.wallet_balance || 'N/A',
        user.is_active ? 'Active' : 'Inactive'
      ]);
    } else if (dataType === 'chats') {
      headers = ['Chat ID', 'Store Name', 'User Name', 'Last Message', 'Chat Date', 'Is Read', 'Is Dispute'];
      tableData = dataToExport.map((chat: any) => [
        chat.id,
        chat.store_name || 'N/A',
        chat.user_name || 'N/A',
        chat.last_message || 'N/A',
        chat.chat_date || 'N/A',
        chat.is_read ? 'Yes' : 'No',
        chat.is_dispute ? 'Yes' : 'No'
      ]);
    } else if (dataType === 'transactions') {
      headers = ['Transaction ID', 'TX ID', 'Amount', 'Type', 'Status', 'Date'];
      tableData = dataToExport.map((transaction: any) => [
        transaction.id,
        transaction.tx_id || 'N/A',
        transaction.amount || 'N/A',
        transaction.type || 'N/A',
        transaction.status || 'N/A',
        transaction.tx_date || 'N/A'
      ]);
    } else {
      headers = ['Order ID', 'Store Name', 'Buyer Name', 'Product Name', 'Price', 'Order Date', 'Status'];
      tableData = dataToExport.map((order: any) => [
        order.id,
        order.store_name || order.storeName || 'N/A',
        order.buyer_name || order.buyerName || 'N/A',
        order.product_name || order.productName || 'N/A',
        order.price || 'N/A',
        order.order_date || order.orderDate || 'N/A',
        order.status || 'N/A'
      ]);
    }

    // Add table
    (doc as any).autoTable({
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

    // Handle specific actions
    switch (action) {
      case 'Export as CSV':
        exportToCSV();
        break;
      case 'Export as PDF':
        exportToPDF();
        break;
      case 'Delete':
        if (selectedOrders.length === 0) {
          alert(`Please select ${dataType} to delete`);
          return;
        }
        if (confirm(`Are you sure you want to delete ${selectedOrders.length} ${dataType}?`)) {
          console.log(`Deleting ${dataType}:`, selectedOrders);
          // Add delete logic here
        }
        break;
      default:
        console.log("Selected bulk action:", action);
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
              className={`block w-full text-left px-4 py-2 text-sm ${
                action === "Delete" ? "text-[#FF0000]" : "text-black"
              } cursor-pointer `}
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
