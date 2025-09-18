import React, { useMemo, useState, useEffect } from "react";
import ServicesDetails from "../../Modals/servicesDetails";

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
  /** From parent; Services don't use Sponsored/General, but we keep the prop for parity */
  activeTab?: "All" | "General" | "Sponsored";
  /** debounced search string from parent */
  searchTerm?: string;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  title = "All Services",
  onRowSelect,
  activeTab = "All",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      storeName: "Apple Stores",
      serviceName: "Sasha Fashion Designing",
      price: "N5,000 - N20,000",
      date: "18-07-2025/11:30AM",
      productImage: "/assets/layout/service.png",
    },
  ];

  const visibleServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) =>
      [s.storeName, s.serviceName, s.price, s.date]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [services, searchTerm, activeTab]);

  useEffect(() => {
    const visIds = new Set(visibleServices.map((s) => s.id));
    const visibleSelected = selectedRows.filter((id) => visIds.has(id));
    setSelectAll(
      visibleServices.length > 0 &&
        visibleSelected.length === visibleServices.length
    );
  }, [visibleServices, selectedRows]);

  const handleSelectAll = () => {
    const visIds = visibleServices.map((s) => s.id);
    if (selectAll) {
      const remaining = selectedRows.filter((id) => !visIds.includes(id));
      setSelectedRows(remaining);
      onRowSelect?.(remaining);
      setSelectAll(false);
    } else {
      const union = Array.from(new Set([...selectedRows, ...visIds]));
      setSelectedRows(union);
      onRowSelect?.(union);
      setSelectAll(true);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      onRowSelect?.(next);
      return next;
    });
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
                  checked={selectAll && visibleServices.length > 0}
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
            {visibleServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              visibleServices.map((service) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <ServicesDetails isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ServicesTable;
