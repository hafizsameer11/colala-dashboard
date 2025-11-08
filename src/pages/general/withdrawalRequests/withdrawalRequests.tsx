import { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../../components/PageHeader";
import { useToast } from "../../../contexts/ToastContext";
import {
    approveWithdrawalRequest,
    getWithdrawalRequestDetails,
    getWithdrawalRequests,
    rejectWithdrawalRequest,
} from "../../../utils/queries";

type WithdrawalRequestUser = {
    id: number;
    full_name: string;
    email: string;
    phone: string;
};

type WithdrawalRequestListItem = {
    id: number;
    user: WithdrawalRequestUser;
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: string;
    created_at: string;
    updated_at: string;
};

type WithdrawalRequestDetail = WithdrawalRequestListItem & {
    transaction?: {
        id: number;
        tx_id: string;
        status: string;
        created_at: string;
    };
};

type PaginatedResponse<T> = {
    current_page: number;
    data: T[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
};

const formatCurrency = (amount: number) =>
    `₦${Number(amount || 0).toLocaleString()}`;

const statusStyles: Record<
    string,
    { bg: string; text: string; label?: string }
> = {
    pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
    },
    approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
    },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
};

const WithdrawalRequests = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
        null
    );
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<{
        type: "approved" | "rejected";
        message: string;
    } | null>(null);
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["withdrawalRequests", currentPage],
        queryFn: () => getWithdrawalRequests(currentPage),
        placeholderData: (previousData) => previousData,
    });

    const paginatedRequests: PaginatedResponse<WithdrawalRequestListItem> =
        data?.data || {
            current_page: 1,
            data: [],
            from: 0,
            last_page: 1,
            per_page: 20,
            to: 0,
            total: 0,
        };

    const requests = paginatedRequests.data || [];

    const {
        data: detailData,
        isLoading: detailLoading,
        isError: detailError,
        error: detailFetchError,
    } = useQuery({
        queryKey: ["withdrawalRequestDetails", selectedRequestId],
        queryFn: () => getWithdrawalRequestDetails(selectedRequestId!),
        enabled: isDetailOpen && selectedRequestId !== null,
    });

    const detail: WithdrawalRequestDetail | undefined = detailData?.data;

    const invalidateRequests = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: ["withdrawalRequests"],
        });
        if (selectedRequestId) {
            queryClient.invalidateQueries({
                queryKey: ["withdrawalRequestDetails", selectedRequestId],
            });
        }
    }, [queryClient, selectedRequestId]);

    const approveMutation = useMutation({
        mutationFn: (requestId: number) => approveWithdrawalRequest(requestId),
        onSuccess: () => {
            showToast("Withdrawal request approved successfully", "success");
            setActionFeedback({
                type: "approved",
                message: "This withdrawal request has been approved successfully.",
            });
            invalidateRequests();
        },
        onError: () => {
            showToast("Failed to approve withdrawal request", "error");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (requestId: number) => rejectWithdrawalRequest(requestId),
        onSuccess: () => {
            showToast("Withdrawal request rejected", "success");
            setActionFeedback({
                type: "rejected",
                message: "This withdrawal request has been rejected.",
            });
            invalidateRequests();
        },
        onError: () => {
            showToast("Failed to reject withdrawal request", "error");
        },
    });

    const handleViewDetails = (requestId: number) => {
        setSelectedRequestId(requestId);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedRequestId(null);
    };

    const actionButtonsDisabled = useMemo(() => {
        if (!detail) return true;
        const statusKey = detail.status?.toLowerCase?.();
        return (
            approveMutation.isPending ||
            rejectMutation.isPending ||
            statusKey !== "pending"
        );
    }, [detail, approveMutation.isPending, rejectMutation.isPending]);

    return (
        <div className="p-5">
            <PageHeader title="Withdrawal Requests" />

            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Requests Overview
                        </h2>
                        <p className="text-sm text-gray-500">
                            Track and manage withdrawal requests from sellers and users.
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {isFetching ? "Refreshing..." : `Total: ${paginatedRequests.total}`}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Requested On
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        Loading withdrawal requests...
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-red-500"
                                    >
                                        {error instanceof Error
                                            ? error.message
                                            : "Failed to load withdrawal requests"}
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        No withdrawal requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => {
                                    const statusKey =
                                        request.status?.toLowerCase?.() || request.status || "";
                                    const statusConfig =
                                        statusStyles[statusKey] || {
                                            bg: "bg-gray-100",
                                            text: "text-gray-700",
                                            label: request.status || "Unknown",
                                        };

                                    return (
                                        <tr key={request.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{request.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.user?.full_name || "Unknown User"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {request.user?.email}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {request.user?.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {formatCurrency(request.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div>{request.bank_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {request.account_name}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {request.account_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                                                >
                                                    {statusConfig.label || request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {request.created_at}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={() => handleViewDetails(request.id)}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#E53E3E] hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {paginatedRequests.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            Showing {paginatedRequests.from} – {paginatedRequests.to} of{" "}
                            {paginatedRequests.total}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {paginatedRequests.current_page} of{" "}
                                {paginatedRequests.last_page}
                            </span>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, paginatedRequests.last_page)
                                    )
                                }
                                disabled={currentPage === paginatedRequests.last_page}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isDetailOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"
                        aria-hidden="true"
                    />
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-red-100">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Withdrawal Request Details
                                </h3>
                                {detail && (
                                    <p className="text-sm text-gray-500">
                                        Request #{detail.id} •{" "}
                                        {(detail.status || "Unknown").toUpperCase()}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCloseDetail}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                                    aria-label="Close details"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                            {detailLoading ? (
                                <div className="py-10 text-center text-gray-500">
                                    Loading details...
                                </div>
                            ) : detailError ? (
                                <div className="py-10 text-center text-red-500">
                                    {detailFetchError instanceof Error
                                        ? detailFetchError.message
                                        : "Failed to load withdrawal request details."}
                                </div>
                            ) : !detail ? (
                                <div className="py-10 text-center text-gray-500">
                                    Withdrawal request details unavailable.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <section>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                            User Information
                                        </h4>
                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                                            <div>
                                                <span className="text-gray-500">Name</span>
                                                <div className="font-medium">
                                                    {detail.user?.full_name || "Unknown"}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Email</span>
                                                <div>{detail.user?.email || "—"}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Phone</span>
                                                <div>{detail.user?.phone || "—"}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Request Date</span>
                                                <div>{detail.created_at}</div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                            Withdrawal Details
                                        </h4>
                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                                            <div>
                                                <span className="text-gray-500">Amount</span>
                                                <div className="font-semibold text-gray-900">
                                                    {formatCurrency(detail.amount)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Status</span>
                                                <div className="capitalize">{detail.status}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Bank Name</span>
                                                <div>{detail.bank_name}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Account Name</span>
                                                <div>{detail.account_name}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Account Number</span>
                                                <div>{detail.account_number}</div>
                                            </div>
                                        </div>
                                    </section>

                                    {detail.transaction && (
                                        <section>
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                                Transaction
                                            </h4>
                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                                                <div>
                                                    <span className="text-gray-500">Transaction ID</span>
                                                    <div className="font-medium">
                                                        {detail.transaction.tx_id}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">
                                                        Transaction Status
                                                    </span>
                                                    <div className="capitalize">
                                                        {detail.transaction.status}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">
                                                        Created At
                                                    </span>
                                                    <div>{detail.transaction.created_at}</div>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={handleCloseDetail}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                onClick={() =>
                                    selectedRequestId &&
                                    rejectMutation.mutate(selectedRequestId)
                                }
                                disabled={actionButtonsDisabled}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                            </button>
                            <button
                                onClick={() =>
                                    selectedRequestId &&
                                    approveMutation.mutate(selectedRequestId)
                                }
                                disabled={actionButtonsDisabled}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                {approveMutation.isPending ? "Approving..." : "Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {actionFeedback && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                        aria-hidden="true"
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 text-center space-y-4">
                        <div
                            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${actionFeedback.type === "approved"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                        >
                            {actionFeedback.type === "approved" ? "✓" : "✕"}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                                {actionFeedback.type === "approved"
                                    ? "Request Approved"
                                    : "Request Rejected"}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600">
                                {actionFeedback.message}
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setActionFeedback(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setActionFeedback(null);
                                    handleCloseDetail();
                                }}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-colors ${actionFeedback.type === "approved"
                                        ? "bg-green-500 hover:bg-green-600 focus:ring-green-400"
                                        : "bg-red-500 hover:bg-red-600 focus:ring-red-400"
                                    }`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawalRequests;


