import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubscriptionDetails } from "../../../utils/queries/users";
import PlansModal from "../Modals/planModal";

interface ApiSubscription {
  id: number;
  store_name: string;
  owner_name: string;
  plan_name: string;
  price: string;
  currency: string;
  status: string;
  start_date: string;
  end_date: string;
  days_left: number;
  created_at: string;
  formatted_date: string;
  status_color: string;
}

interface Subscription {
  id: string;
  storeName: string;
  ownerName: string;
  plan: string;
  price: string;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
  subscriptionDate: string;
  statusColor: string;
}

interface SubscriptionDetails {
  subscription_info: {
    id: number;
    status: string;
    start_date: string;
    end_date: string;
    payment_method: string;
    payment_status: string;
    transaction_ref: string;
    created_at: string;
  };
  store_info: {
    store_id: number;
    store_name: string;
    owner_name: string;
    owner_email: string;
  };
  plan_info: {
    plan_id: number;
    plan_name: string;
    price: number;
    currency: string;
    duration_days: number;
    features: any;
  };
  days_remaining: number;
}

interface SubscriptionTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  subscriptions?: ApiSubscription[];
  pagination?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: any;
  onViewPlans?: () => void;
  activeTab: "All" | "active" | "cancelled" | "expired";
  /** debounced string */
  searchTerm?: string;
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  title = "Latest Submissions",
  onRowSelect,
  subscriptions = [],
  pagination,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  error,
  onViewPlans,
  activeTab,
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<
    "Basic" | "Standard" | "Ultra"
  >("Basic");

  // Fetch subscription details when a subscription is selected
  const { data: subscriptionDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['subscriptionDetails', selectedSubscriptionId],
    queryFn: () => {
      if (!selectedSubscriptionId) return Promise.reject(new Error('No subscription ID'));
      return getSubscriptionDetails(selectedSubscriptionId);
    },
    enabled: !!selectedSubscriptionId,
  });

  // Debug logging for subscription details
  console.log('SubscriptionTable - Selected Subscription ID:', selectedSubscriptionId);
  console.log('SubscriptionTable - Subscription Details:', subscriptionDetails);
  console.log('SubscriptionTable - Details Loading:', detailsLoading);
  console.log('SubscriptionTable - Details Error:', detailsError);

  // Update initial tab when subscription details are loaded
  useEffect(() => {
    if (subscriptionDetails?.data?.plan_info?.plan_name) {
      const planName = subscriptionDetails.data.plan_info.plan_name.toLowerCase();
      if (planName.includes("basic")) {
        setModalInitialTab("Basic");
      } else if (planName.includes("standard")) {
        setModalInitialTab("Standard");
      } else if (planName.includes("ultra") || planName.includes("premium")) {
        setModalInitialTab("Ultra");
      }
    }
  }, [subscriptionDetails]);

  // Normalize API data to UI format
  const normalizedSubscriptions: Subscription[] = useMemo(() => {
    console.log('SubscriptionTable Debug - Raw subscriptions data:', subscriptions);
    
    const transformed = subscriptions.map((sub: ApiSubscription) => ({
      id: sub.id.toString(),
      storeName: sub.store_name || "N/A",
      ownerName: sub.owner_name || "N/A",
      plan: sub.plan_name || "Basic", // Default to "Basic" if plan_name is null/undefined
      price: sub.price || "0",
      currency: sub.currency || "USD",
      status: sub.status || "active",
      startDate: sub.start_date || "",
      endDate: sub.end_date || "",
      daysLeft: Math.round(sub.days_left || 0),
      subscriptionDate: sub.formatted_date || "",
      statusColor: sub.status_color || "green",
    }));
    
    console.log('SubscriptionTable Debug - Transformed subscriptions:', transformed);
    return transformed;
  }, [subscriptions]);

  // Filter subscriptions based on activeTab and searchTerm
  const visibleSubscriptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const statusOk = (sub: Subscription) =>
      activeTab === "All" ? true : sub.status === activeTab;

    const searchOk = (sub: Subscription) => {
      if (!q) return true;
      return [sub.storeName, sub.ownerName, sub.plan, sub.price, sub.status]
        .join(" ")
        .toLowerCase()
        .includes(q);
    };

    return normalizedSubscriptions.filter((sub) => statusOk(sub) && searchOk(sub));
  }, [normalizedSubscriptions, activeTab, searchTerm]);

  const getPlanTabName = (planName: string | undefined | null): "Basic" | "Standard" | "Ultra" => {
    if (!planName) return "Basic"; // Default fallback for undefined/null
    const lower = planName.toLowerCase();
    if (lower.includes("basic")) return "Basic";
    if (lower.includes("standard")) return "Standard";
    if (lower.includes("ultra")) return "Ultra";
    return "Basic";
  };

  const handleShowDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setSelectedSubscriptionId(parseInt(subscription.id));
    setModalInitialTab(getPlanTabName(subscription.plan));
    setShowModal(true);
  };

  // --- FILTERING (tab + debounced search)
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return subscriptions.filter((s) => {
      const tabOk =
        activeTab === "All" ? true : s.status === activeTab;
      if (!q) return tabOk;

      const haystack = [
        s.store_name,
        s.plan_name,
        String(s.days_left),
        s.created_at,
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
    const visibleIds = filtered.map((s) => s.id.toString());
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
    const vis = new Set(filtered.map((s) => s.id.toString()));
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-red-500">
                    <p className="text-sm">Error loading subscriptions</p>
                  </td>
                </tr>
              ) : visibleSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                visibleSubscriptions.map((subscription, index) => (
                  <tr
                    key={subscription.id}
                    className={`border-t border-[#E5E5E5] transition-colors hover:bg-gray-50 ${
                      index === visibleSubscriptions.length - 1 ? "" : "border-b"
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
                      {subscription.currency} {subscription.price}
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

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {pagination.last_page}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.last_page}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* View Plans Button */}
      {/* <div className="mt-8 flex justify-center">
        <button
          onClick={onViewPlans}
          className="bg-[#E53E3E] text-white px-6 py-3 rounded-lg hover:bg-[#D32F2F] transition-colors font-medium"
        >
          View Subscription Plans
        </button>
      </div> */}

      {showModal && selectedSubscription && (
        <PlansModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSubscriptionId(null);
          }}
          initialTab={modalInitialTab}
          subscriptionDetails={subscriptionDetails?.data}
          isLoading={detailsLoading}
          error={detailsError}
        />
      )}
    </>
  );
};

export default SubscriptionTable;
