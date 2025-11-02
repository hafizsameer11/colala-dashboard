import images from "../../../constants/images";
import PageHeader from "../../../components/PageHeader";
import { useState, useEffect } from "react";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import SubscriptionTable from "./subscriptionTable";
import PlansModal from "../Modals/planModal";
import ViewPlansModal from "../Modals/viewPlansModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminSubscriptions, getAdminSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from "../../../utils/queries/users";
import { useToast } from "../../../contexts/ToastContext";

// tiny debounce hook
function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface Plan {
  id: number;
  name: string;
  price: string | number;
  currency: string;
  duration_days: number;
  features: Record<string, string>;
  active_subscriptions_count: number;
  created_at: string | null;
}

interface PlanData {
  name: string;
  price: number;
  currency: string;
  duration_days: number;
  features: Record<string, string>;
}

const Subscription = () => {
  const [activeTab, setActiveTab] = useState<
    "All" | "active" | "cancelled" | "expired"
  >("All");
  const tabs: Array<"All" | "active" | "cancelled" | "expired"> = [
    "All",
    "active",
    "cancelled",
    "expired",
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewPlansModalOpen, setIsViewPlansModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // search (debounced)
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  // API data fetching
  const { data: subscriptionsData, isLoading, error } = useQuery({
    queryKey: ['adminSubscriptions', activeTab, currentPage],
    queryFn: () => getAdminSubscriptions(currentPage, activeTab === "All" ? undefined : activeTab),
  });

  const { data: plansData } = useQuery({
    queryKey: ['adminSubscriptionPlans'],
    queryFn: getAdminSubscriptionPlans,
  });

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Extract data
  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const statistics = subscriptionsData?.data?.statistics || {};
  const pagination = subscriptionsData?.data?.pagination;
  const plans = plansData?.data?.plans || [];

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
      setIsModalOpen(false);
      showToast('Subscription plan created successfully', 'success');
    },
    onError: (error: unknown) => {
      console.error('Create plan error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create plan. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, planData }: { planId: number | string; planData: PlanData }) => 
      updateSubscriptionPlan(planId, planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
      setIsModalOpen(false);
      setEditingPlan(null);
      showToast('Subscription plan updated successfully', 'success');
    },
    onError: (error: unknown) => {
      console.error('Update plan error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update plan. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: deleteSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
      showToast('Subscription plan deleted successfully', 'success');
    },
    onError: (error: unknown) => {
      console.error('Delete plan error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete plan. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleCreatePlan = (planData: PlanData) => {
    createPlanMutation.mutate(planData);
  };

  const handleUpdatePlan = (planData: PlanData) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ planId: editingPlan.id, planData });
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      deletePlanMutation.mutate(planId);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsViewPlansModalOpen(false); // Close the view plans modal
    setIsModalOpen(true);
  };

  const handleViewPlans = () => {
    setIsViewPlansModalOpen(true);
  };

  const handleCreateNewPlan = () => {
    setEditingPlan(null);
    setIsViewPlansModalOpen(false); // Close the view plans modal first
    setIsModalOpen(true);
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Orders:", action);
  };


  return (
    <div>
      <PageHeader title="Subscriptions" />

      <div className="p-5">
        {/* stat cards (unchanged) */}
        <div className="flex flex-row justify-between items-center">
          <div
            className="flex flex-row rounded-2xl  w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.subscription} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Subscription Revenue
              </span>
              <span className="font-semibold text-2xl">N{statistics.total_revenue || "0"}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">Total</span> subscription revenue
              </span>
            </div>
          </div>

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.subscription} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Active Subscriptions
              </span>
              <span className="font-semibold text-2xl">{statistics.active_subscriptions || 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">Active</span> subscriptions
              </span>
            </div>
          </div>

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.subscription} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Total Subscriptions
              </span>
              <span className="font-semibold text-2xl">{statistics.total_subscriptions || 0}</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">Total</span> subscriptions
              </span>
            </div>
          </div>
        </div>

        {/* filters */}
        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <TabButtons />
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>
            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <button
              className="bg-[#E53E3E] text-white py-3.5 px-6 rounded-lg cursor-pointer"
              onClick={handleViewPlans}
            >
              View Plans
            </button>

            {/* Search (debounced) */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setSearch((e.target as any).value);
                }}
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* table with filters */}
        <div className="mt-5">
          <SubscriptionTable
            activeTab={activeTab}
            searchTerm={debouncedSearch}
            subscriptions={subscriptions}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            error={error}
            onViewPlans={handleViewPlans}
          />
        </div>
      </div>

      <PlansModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        editingPlan={editingPlan}
        onCreatePlan={handleCreatePlan}
        onUpdatePlan={handleUpdatePlan}
        isLoading={createPlanMutation.isPending || updatePlanMutation.isPending}
      />

      <ViewPlansModal
        isOpen={isViewPlansModalOpen}
        onClose={() => setIsViewPlansModalOpen(false)}
        plans={plans}
        onEditPlan={handleEditPlan}
        onCreatePlan={handleCreateNewPlan}
        onDeletePlan={handleDeletePlan}
      />
    </div>
  );
};

export default Subscription;
