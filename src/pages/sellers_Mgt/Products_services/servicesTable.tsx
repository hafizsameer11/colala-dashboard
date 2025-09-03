import React, { useState } from "react";
import ServicesDetails from "../Modals/servicesDetails";

interface Service {
  id: string;
  storeName: string;
  serviceName: string;
  price: string;
  date: string;
  productImage: string;
}

interface ServicesTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  title = "All Services",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Sample products data
  const services: Service[] = [
    {
      id: "1",
      storeName: "Sasha Stores",
      serviceName: "Sasha Fashion Designing",
      price: "N5,000 - N20,000",
      date: "18-07-2025/11:30AM",
      productImage: "/assets/layout/service.png",
    },
    {
      id: "2",
      storeName: "Sasha Stores",
      serviceName: "Sasha Fashion Designing",
      price: "N5,000 - N20,000",
      date: "18-07-2025/11:30AM",
      productImage: "/assets/layout/service.png",
    },
  ];

  const handleSelectAll = () => {
    const allIds = services.map((service) => service.id);
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
    setSelectAll(newSelection.length === services.length);

    if (onRowSelect) {
      onRowSelect(newSelection);
    }
  };

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
              <th className="p-4 text-left font-normal">Service Name</th>
              <th className="p-4 text-left font-normal">Price</th>
              <th className="p-4 text-left font-normal">Date</th>
              <th className="p-4 text-center font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-[#00000040] ">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(service.id)}
                    onChange={() => handleRowSelect(service.id)}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-4 text-left">
                  <span className="font-medium">{service.storeName}</span>
                </td>
                <td className="p-4 text-left">
                  <div className="flex items-center gap-3">
                    <img
                      src={service.productImage}
                      alt={service.serviceName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="font-medium">{service.serviceName}</span>
                  </div>
                </td>
                <td className="p-4 text-left">
                  <span className="font-semibold">{service.price}</span>
                </td>
                <td className="p-4 text-left">
                  <span className="text-gray-600">{service.date}</span>
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
      <ServicesDetails
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default ServicesTable;
