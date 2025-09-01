import React, { useState } from "react";
import ProductDetailsModal from "../Modals/productDetailsModal";

interface Product {
  id: string;
  storeName: string;
  productName: string;
  price: string;
  date: string;
  sponsored: boolean;
  productImage: string;
}

interface ProductsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  title = "All Products",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showModal, setShowModal] = useState(false);

  // Sample products data
  const products: Product[] = [
    {
      id: "1",
      storeName: "Sasha Stores",
      productName: "iPhone 16 pro max.....",
      price: "₦200,000",
      date: "18-07-2025/11:30AM",
      sponsored: true,
      productImage: "/assets/layout/iphone.png",
    },
    {
      id: "2",
      storeName: "Sasha Stores",
      productName: "iPhone 16 pro max.....",
      price: "₦200,000",
      date: "18-07-2025/11:30AM",
      sponsored: false,
      productImage: "/assets/layout/iphone.png",
    },
    {
      id: "3",
      storeName: "Sasha Stores",
      productName: "iPhone 16 pro max.....",
      price: "₦200,000",
      date: "18-07-2025/11:30AM",
      sponsored: false,
      productImage: "/assets/layout/iphone.png",
    },
    {
      id: "4",
      storeName: "Sasha Stores",
      productName: "iPhone 16 pro max.....",
      price: "₦200,000",
      date: "18-07-2025/11:30AM",
      sponsored: false,
      productImage: "/assets/layout/iphone.png",
    },
  ];

  const handleSelectAll = () => {
    const allIds = products.map((product) => product.id);
    const newSelection = selectAll ? [] : allIds;
    setSelectedRows(newSelection);
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  const handleRowSelect = (id: string) => {
    const isSelected = selectedRows.includes(id);
    const newSelection = isSelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    setSelectAll(newSelection.length === products.length);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

  //   const handleViewDetails = (product: Product) => {
  //     console.log("View details for product:", product);
  //     // Add your view details logic here
  //   };

  return (
    <div className="border border-[#00000040] rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-lg border-b border-[#00000040]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr className="text-left">
              <th className="p-4 font-normal">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
              </th>
              <th className="p-4 text-left font-normal">Store Name</th>
              <th className="p-4 text-left font-normal">Product name</th>
              <th className="p-4 text-left font-normal">Price</th>
              <th className="p-4 text-left font-normal">Date</th>
              <th className="p-4 text-center font-normal">Sponsored</th>
              <th className="p-4 text-center font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-[#00000040] ">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(product.id)}
                    onChange={() => handleRowSelect(product.id)}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-4 text-left">
                  <span className="font-medium">{product.storeName}</span>
                </td>
                <td className="p-4 text-left">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="font-medium">{product.productName}</span>
                  </div>
                </td>
                <td className="p-4 text-left">
                  <span className="font-semibold">{product.price}</span>
                </td>
                <td className="p-4 text-left">
                  <span className="text-gray-600">{product.date}</span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center">
                    <div
                      className={`w-5 h-5 rounded-full ${
                        product.sponsored ? "bg-[#008000]" : "bg-[#FF0000]"
                      }`}
                    />
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#E53E3E] hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProductDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default ProductsTable;
