import React, { useState, useEffect, useMemo } from "react";
import PlansModal from "../Modals/planModal";

interface Subscription {
  id: string;
  storeName: string;
  plan: string; // e.g., "Basic Plan", "Standard Plan", "Ultra Plan"
  daysLeft: number;
  subscriptionDate: string;
  price: string;
  status?: "Active" | "Expired" | "Pending";
}

interface SubscriptionTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  data?: Subscription[];
  activeTab: "All" | "Basic" | "Standard" | "Ultra";
  /** debounced string */
  searchTerm?: string;
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  title = "Latest Submissions",
  onRowSelect,
  data,
  activeTab,
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<
    "Basic" | "Standard" | "Ultra"
  >("Basic");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSubscriptions(data);
    } else {
      setSubscriptions([
        {
          id: "1",
          storeName: "Eze & Sons Ventures",
          plan: "Basic Plan",
          daysLeft: 5,
          subscriptionDate: "14-07-2025/10:00AM",
          price: "₦0",
          status: "Active",
        },
        {
          id: "2",
          storeName: "Ade Transport Co.",
          plan: "Standard Plan",
          daysLeft: 15,
          subscriptionDate: "10-07-2025/09:30AM",
          price: "₦5,000",
          status: "Active",
        },
        {
          id: "3",
          storeName: "Logistics Solutions",
          plan: "Ultra Plan",
          daysLeft: 0,
          subscriptionDate: "01-06-2025/02:15PM",
          price: "₦10,000",
          status: "Expired",
        },
        {
          id: "4",
          storeName: "Freight Systems",
          plan: "Basic Plan",
          daysLeft: 30,
          subscriptionDate: "20-07-2025/11:45AM",
          price: "₦0",
          status: "Active",
        },
        {
          id: "5",
          storeName: "Delivery Group",
          plan: "Basic Plan",
          daysLeft: 2,
          subscriptionDate: "05-07-2025/04:20PM",
          price: "₦0",
          status: "Pending",
        },
        {
          id: "6",
          storeName: "Shipping Enterprises",
          plan: "Ultra Plan",
          daysLeft: 22,
          subscriptionDate: "08-07-2025/01:10PM",
          price: "₦7,500",
          status: "Active",
        },
        {
          id: "7",
          storeName: "Eze Logistics Services",
          plan: "Basic Plan",
          daysLeft: 12,
          subscriptionDate: "18-07-2025/03:40PM",
          price: "₦0",
          status: "Active",
        },
      ]);
    }
  }, [data]);

  const getPlanTabName = (planName: string): "Basic" | "Standard" | "Ultra" => {
    const lower = planName.toLowerCase();
    if (lower.includes("basic")) return "Basic";
    if (lower.includes("standard")) return "Standard";
    if (lower.includes("ultra")) return "Ultra";
    return "Basic";
  };

  const handleShowDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setModalInitialTab(getPlanTabName(subscription.plan));
    setShowModal(true);
  };

  // --- FILTERING (tab + debounced search)
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return subscriptions.filter((s) => {
      const tabOk =
        activeTab === "All" ? true : getPlanTabName(s.plan) === activeTab;
      if (!q) return tabOk;

      const haystack = [
        s.storeName,
        s.plan,
        String(s.daysLeft),
        s.subscriptionDate,
        s.price,
        s.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return tabOk && haystack.includes(q);
    });
  }, [subscriptions, activeTab, searchTerm]);

  // --- SELECTION (acts on visible rows only)
  const handleSelectAll = () => {
    const visibleIds = filtered.map((s) => s.id);
    if (selectAll) {
      const remaining = selectedRows.filter((id) => !visibleIds.includes(id));
      setSelectedRows(remaining);
      setSelectAll(false);
      onRowSelect?.(remaining);
    } else {
      const union = Array.from(new Set([...selectedRows, ...visibleIds]));
      setSelectedRows(union);
      setSelectAll(true);
      onRowSelect?.(union);
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

  useEffect(() => {
    const vis = new Set(filtered.map((s) => s.id));
    const visibleSelected = selectedRows.filter((id) => vis.has(id));
    setSelectAll(
      filtered.length > 0 && visibleSelected.length === filtered.length
    );
  }, [filtered, selectedRows]);

  const getDaysLeftStyle = (daysLeft: number) => {
    if (daysLeft <= 3) return "text-[#FF0000] font-semibold";
    if (daysLeft <= 7) return "text-[#FFA500] font-semibold";
    return "text-[#008000]";
  };

  return (
    <>
      <div className="border border-[#989898] rounded-2xl mt-5 overflow-x-auto">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl overflow-hidden min-w-[1000px]">
          <table className="w-full">
            <thead className="bg-[#F2F2F2]">
              <tr>
                <th className="text-center p-3 font-normal text-[14px] w-12">
                  <input
                    type="checkbox"
                    checked={selectAll && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                  />
                </th>
                <th className="text-left p-3 font-normal text-[14px]">
                  Store Name
                </th>
                <th className="text-left p-3 font-normal text-[14px]">Plan</th>
                <th className="text-center p-3 font-normal text-[14px]">
                  Days left
                </th>
                <th className="text-center p-3 font-normal text-[14px]">
                  Subscription Date
                </th>
                <th className="text-center p-3 font-normal text-[14px]">
                  Price
                </th>
                <th className="text-center p-3 font-normal text-[14px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((subscription, index) => (
                  <tr
                    key={subscription.id}
                    className={`border-t border-[#E5E5E5] transition-colors hover:bg-gray-50 ${
                      index === filtered.length - 1 ? "" : "border-b"
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(subscription.id)}
                        onChange={() => handleRowSelect(subscription.id)}
                        className="w-5 h-5 border border-gray-300 rounded cursor-pointer mx-auto"
                      />
                    </td>
                    <td className="p-4 text-[14px] text-black text-left">
                      {subscription.storeName}
                    </td>
                    <td className="p-4 text-[14px] text-black text-left">
                      {subscription.plan}
                    </td>
                    <td
                      className={`p-4 text-[14px] text-center ${getDaysLeftStyle(
                        subscription.daysLeft
                      )}`}
                    >
                      {subscription.daysLeft}
                    </td>
                    <td className="p-4 text-[14px] text-black text-center">
                      {subscription.subscriptionDate}
                    </td>
                    <td className="p-4 text-[14px] font-semibold text-center">
                      {subscription.price}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleShowDetails(subscription)}
                        className="bg-[#E53E3E] text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:bg-[#D32F2F] transition-colors cursor-pointer"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedSubscription && (
        <PlansModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialTab={modalInitialTab}
        />
      )}
    </>
  );
};

export default SubscriptionTable;
