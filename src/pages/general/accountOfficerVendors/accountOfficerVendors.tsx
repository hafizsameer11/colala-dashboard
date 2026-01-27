import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  getAccountOfficers,
  getAccountOfficerVendors,
  getMyVendorDashboard,
  getMyAssignedVendors,
} from "../../../utils/queries/accountOfficer";
import images from "../../../constants/images";

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  iconBgColor?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  iconBgColor = "#E53E3E",
}) => {
  return (
    <div
      className="flex flex-row rounded-2xl flex-1"
      style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <div
        className="rounded-l-2xl p-5 flex justify-center items-center"
        style={{ backgroundColor: iconBgColor }}
      >
        <img className="w-7 h-7 filter brightness-0 invert" src={images.transaction1} alt="" />
      </div>
      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-4 justify-center flex-1">
        <span className="font-semibold text-sm text-gray-700 mb-1">{title}</span>
        <span className="font-bold text-2xl text-gray-900">{value}</span>
        {subtitle && <span className="text-xs text-gray-500 mt-1">{subtitle}</span>}
      </div>
    </div>
  );
};

// Account Officer List Component (Super Admin View)
const AccountOfficerList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | string | null>(null);
  const [page, setPage] = useState(1);

  const { data: officersData, isLoading } = useQuery({
    queryKey: ["accountOfficers"],
    queryFn: getAccountOfficers,
  });

  const { data: vendorsData, isLoading: loadingVendors } = useQuery({
    queryKey: ["accountOfficerVendors", selectedOfficerId, page],
    queryFn: () => getAccountOfficerVendors(selectedOfficerId!, page),
    enabled: !!selectedOfficerId,
  });

  const officers = officersData?.data || [];
  // API returns { data: { vendors: [...], pagination: {...} } }
  const vendors = vendorsData?.data?.vendors || [];
  const pagination = vendorsData?.data?.pagination;

  const handleViewVendor = (storeId: number | string) => {
    navigate(`/store-details/${storeId}`);
  };

  return (
    <div className="space-y-5">
      <div className="border border-[#989898] rounded-2xl bg-white">
        <div className="bg-[#F2F2F2] p-5 rounded-t-2xl border-b border-[#989898]">
          <h3 className="text-xl font-semibold">Account Officers</h3>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : officers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No Account Officers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {officers.map((officer: any) => (
                <div
                  key={officer.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#E53E3E] hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    setSelectedOfficerId(selectedOfficerId === officer.id ? null : officer.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg text-gray-900">{officer.name}</h4>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          Account Officer
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{officer.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          <span className="font-semibold">{officer.vendor_count || 0}</span> Total
                          Vendors
                        </span>
                        <span>
                          <span className="font-semibold text-green-600">
                            {officer.active_vendors || 0}
                          </span>{" "}
                          Active
                        </span>
                        <span>
                          <span className="font-semibold text-gray-600">
                            {officer.inactive_vendors || 0}
                          </span>{" "}
                          Inactive
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {selectedOfficerId === officer.id ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {selectedOfficerId === officer.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {loadingVendors ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E53E3E]"></div>
                        </div>
                      ) : vendors.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p>No vendors assigned to this Account Officer</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {vendors.map((vendor: any) => (
                              <div
                                key={vendor.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {vendor.store_name || vendor.name || "Unknown Store"}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Status:{" "}
                                    <span
                                      className={`font-semibold ${
                                        vendor.status === "active"
                                          ? "text-green-600"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {vendor.status || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewVendor(vendor.user_id || vendor.id);
                                  }}
                                  className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg text-sm hover:bg-[#D32F2F] transition-colors"
                                >
                                  View Vendor
                                </button>
                              </div>
                            ))}
                          </div>
                          {pagination && pagination.last_page > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPage((p) => Math.max(1, p - 1));
                                }}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              <span className="px-4 py-2">
                                Page {page} of {pagination.last_page}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPage((p) => Math.min(pagination.last_page, p + 1));
                                }}
                                disabled={page === pagination.last_page}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Vendor Dashboard Component (Account Officer View)
const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ["myVendorDashboard"],
    queryFn: getMyVendorDashboard,
  });

  const { data: vendorsData, isLoading: loadingVendors } = useQuery({
    queryKey: ["myAssignedVendors", page, search, statusFilter],
    queryFn: () =>
      getMyAssignedVendors(page, {
        search: search || undefined,
        status: statusFilter || undefined,
        per_page: 15,
      }),
  });

  const dashboard = dashboardData?.data || {};
  // API returns { data: { vendors: [...], pagination: {...} } }
  const vendors = vendorsData?.data?.vendors || [];
  const pagination = vendorsData?.data?.pagination;

  const handleViewVendor = (storeId: number | string) => {
    navigate(`/store-details/${storeId}`);
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="flex flex-col sm:flex-row gap-4">
        <KPICard
          title="Total Vendors"
          value={dashboard.total_vendors || 0}
          subtitle="Assigned to you"
          iconBgColor="#E53E3E"
        />
        <KPICard
          title="Active Vendors"
          value={dashboard.active_vendors || 0}
          subtitle="Currently active"
          iconBgColor="#1DB61D"
        />
        <KPICard
          title="Inactive Vendors"
          value={dashboard.inactive_vendors || 0}
          subtitle="Not active"
          iconBgColor="#FFA500"
        />
      </div>

      {/* Vendors Table */}
      <div className="border border-[#989898] rounded-2xl bg-white">
        <div className="bg-[#F2F2F2] p-5 rounded-t-2xl border-b border-[#989898]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-semibold">My Assigned Vendors</h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53E3E] text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-5">
          {loadingVendors ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-400 text-lg mb-2">No vendors assigned</div>
              <div className="text-gray-500 text-sm">
                {search || statusFilter
                  ? "Try adjusting your search or filter"
                  : "You don't have any vendors assigned to you yet"}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor: any) => (
                      <tr
                        key={vendor.id || vendor.store_id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {vendor.store_name || vendor.name || "Unknown Store"}
                          </div>
                          {vendor.store_email && (
                            <div className="text-sm text-gray-600">{vendor.store_email}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              vendor.status === "active"
                                ? "bg-green-100 text-green-800"
                                : vendor.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {vendor.status || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {vendor.assigned_at
                            ? new Date(vendor.assigned_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewVendor(vendor.user_id || vendor.id)}
                            className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg text-sm hover:bg-[#D32F2F] transition-colors"
                          >
                            View Vendor
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {page} of {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    disabled={page === pagination.last_page}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const AccountOfficerVendors: React.FC = () => {
  const { hasPermission, hasRole } = usePermissions();
  const isSuperAdmin = hasPermission("sellers.assign_account_officer");
  const isAccountOfficer = hasRole("account_officer");

  // Block account officers from accessing this management page
  if (isAccountOfficer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Account officers cannot access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check access - only super admins can access
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Account Officer Vendors Management"
      />
      <div className="p-3 sm:p-4 md:p-5 bg-[#F5F5F5] min-h-screen">
        <AccountOfficerList />
      </div>
    </>
  );
};

export default AccountOfficerVendors;


