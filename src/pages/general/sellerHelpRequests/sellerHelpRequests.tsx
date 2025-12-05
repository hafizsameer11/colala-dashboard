import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import { getAdminSellerHelpRequests } from "../../../utils/queries/users";

const SellerHelpRequests = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminSellerHelpRequests", page],
    queryFn: () => getAdminSellerHelpRequests({ page, per_page: 20 }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  const pagination = data?.data || {};
  const items: Array<any> = pagination?.data || [];

  return (
    <div className="p-3 sm:p-4 md:p-5">
      <PageHeader title="Seller Help Requests" />

      <div className="mt-3 sm:mt-4 bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load requests</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((req) => (
                  <tr key={req.id}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{req.full_name || "-"}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{req.email || "-"}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{req.phone || "-"}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{req.service_type || "-"}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {req.status || "-"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{req.created_at ? new Date(req.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple pagination */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <button
          className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto"
          disabled={!pagination.prev_page_url}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <div className="text-xs sm:text-sm text-gray-600">
          Page {pagination.current_page || page} of {pagination.last_page || 1}
        </div>
        <button
          className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto"
          disabled={!pagination.next_page_url}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SellerHelpRequests;
