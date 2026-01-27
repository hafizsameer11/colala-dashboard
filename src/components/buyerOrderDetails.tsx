import images from "../constants/images";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProductDetails from "./productDetails";
import OrderOverview from "./orderOverview";
import ProductCart from "./productCart";
import { acceptAdminOrderOnBehalf, getBuyerOrderDetails, releaseBuyerOrderEscrow } from "../utils/queries/users";
import { usePermissions } from "../hooks/usePermissions";

interface OrderItem {
  id: number;
  complete?: {
    product: {
      id: number;
      name: string;
      description: string;
      price: string;
      discount_price: string;
      quantity: number;
      status: string;
      created_at: string;
    };
    images: Array<{
      id: number;
      path: string;
      is_main: number;
      type?: string;
    }>;
    variants: unknown[];
    store: {
      id: number;
      store_name: string;
      store_email: string;
      store_phone: string;
      store_location: string;
      profile_image: string;
      banner_image: string;
      theme_color: string;
      average_rating: number;
      total_sold: number;
      followers_count: number;
    };
    reviews: unknown[];
  };
  product: {
    id: number;
    name: string;
    images: Array<{
      id: number;
      path: string;
      is_main: number;
    }>;
  };
  variant?: unknown;
  quantity: number;
  price?: string;
  total: number;
}

interface OrderData {
  id: number;
  order_no: string;
  status: string;
  status_color: string;
  store: {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  delivery_address: {
    id: number;
    full_address?: string;
    state: string;
    local_government?: string;
    contact_name?: string;
    contact_phone?: string;
  };
  items: OrderItem[];
  pricing: {
    items_subtotal: string;
    shipping_fee: string;
    discount: string;
    subtotal_with_shipping: string;
  };
  tracking: Array<{
    id: number;
    status: string;
    description?: string;
    location?: string;
    created_at: string;
  }>;
  chat: {
    id: number;
    is_dispute: boolean;
    last_message?: string;
  };
  created_at: string;
  updated_at: string;
}

interface BuyerOrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | number;
  order?: OrderData; // Optional order data
}

const BuyerOrderDetails: React.FC<BuyerOrderDetailsProps> = ({
  isOpen,
  onClose,
  orderId,
  order,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<
    "track order" | "full order details"
  >("track order");
  // Sub-view flag: when true, we're inside Product Details while keeping the tab as Full Order Details
  const [isProductDetails, setIsProductDetails] = useState(false);
  // Cart view flag: when true, we're in the cart view
  const [isCartView, setIsCartView] = useState(false);
  // Product details inner tabs
  const [productTab, setProductTab] = useState<
    "overview" | "description" | "reviews"
  >("overview");
  // Quantity state for the counter
  const [quantity, setQuantity] = useState<number>(1);
  // Accept-on-behalf form state (admin accepting for seller)
  const [deliveryFee, setDeliveryFee] = useState<string>("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [acceptErrors, setAcceptErrors] = useState<Record<string, string[]>>({});

  // Fetch order details from API
  const { data: orderDetailsData, isLoading, error } = useQuery({
    queryKey: ['buyerOrderDetails', orderId],
    queryFn: () => getBuyerOrderDetails(orderId!),
    enabled: !!orderId && isOpen,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use API data or fallback to passed order prop
  const orderData = orderDetailsData?.data || order;
  
  // Debug: Log the order data structure
  console.log('BuyerOrderDetails - orderData:', orderData);
  console.log('BuyerOrderDetails - first item:', orderData?.items?.[0]);
  console.log('BuyerOrderDetails - complete data:', orderData?.items?.[0]?.complete);

  const storeOrderId = (orderData as any)?.id || (orderData as any)?.store_order_id || orderId;
  const todayDateString = new Date().toISOString().split("T")[0];

  // Mutation: manual escrow release for this store order
  const releaseEscrowMutation = useMutation({
    mutationFn: async () => {
      if (!orderData?.id) {
        throw new Error('Missing store order id for escrow release');
      }
      return releaseBuyerOrderEscrow(orderData.id, {
        reason: 'Manual escrow release after admin review from order details modal',
      });
    },
    onSuccess: () => {
      // Refresh this order and the main buyer orders list
      queryClient.invalidateQueries({ queryKey: ['buyerOrderDetails'] });
      queryClient.invalidateQueries({ queryKey: ['buyerOrders'] });
      alert('Escrow released successfully.');
    },
    onError: (err: any) => {
      const message =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'No locked escrow found for this order or release failed. Check logs for details.';
      console.error('Release escrow error:', err);
      alert(message);
    },
  });

  // Check permissions for actions
  const canReleaseEscrow = hasPermission('buyer_orders.refund') && !!orderData;
  const canAcceptOrder = hasPermission('buyer_orders.update_status') || hasPermission('seller_orders.update_status');

  // Mutation: admin accepts order on behalf of seller (for pending_acceptance)
  const acceptOrderMutation = useMutation({
    mutationFn: async () => {
      if (!storeOrderId) {
        throw new Error('Missing store order id');
      }

      const payload = {
        delivery_fee: Number(deliveryFee),
        estimated_delivery_date: estimatedDeliveryDate || undefined,
        delivery_method: deliveryMethod || undefined,
        delivery_notes: deliveryNotes || undefined,
      };

      return acceptAdminOrderOnBehalf(storeOrderId, payload);
    },
    onSuccess: () => {
      setAcceptErrors({});
      queryClient.invalidateQueries({ queryKey: ['buyerOrderDetails'] });
      queryClient.invalidateQueries({ queryKey: ['buyerOrders'] });
      alert('Order accepted successfully on behalf of seller.');
    },
    onError: (error: any) => {
      console.error('Failed to accept order on behalf of seller:', error);
      const backendErrors =
        error?.data?.errors ||
        error?.response?.data?.errors ||
        error?.errors ||
        {};
      setAcceptErrors(backendErrors);
      const message =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to accept order on behalf of seller';
      alert(message);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {(isProductDetails || isCartView) && (
                <button
                  onClick={() => {
                    if (isCartView) {
                      setIsCartView(false);
                    } else {
                      setIsProductDetails(false);
                      setProductTab("overview");
                    }
                  }}
                  className="p-2 -ml-2 rounded-md cursor-pointer"
                  aria-label="Back"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              <h2 className="text-xl font-semibold">
                {isCartView
                  ? "Product Cart"
                  : isProductDetails
                  ? "Product details"
                  : "Order Details"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {canReleaseEscrow && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to manually release escrow for this order?'
                      )
                    ) {
                      releaseEscrowMutation.mutate();
                    }
                  }}
                  disabled={releaseEscrowMutation.isPending}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-[#E53E3E] text-[#E53E3E] hover:bg-[#E53E3E] hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {releaseEscrowMutation.isPending ? 'Releasing...' : 'Release Escrow'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-md  cursor-pointer"
                aria-label="Close"
              >
                <img src={images.close} alt="Close" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Tabs - Only show when not in cart view */}
          {!isCartView && (
            <div className="flex flex-row justify-between">
              <div className="flex p-1 gap-4 border border-[#989898] rounded-lg w-[335px]">
                <button
                  onClick={() => setActiveTab("track order")}
                  className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                    activeTab === "track order"
                      ? "bg-[#E53E3E] text-white "
                      : "bg-transparent text-[#00000080]"
                  }`}
                >
                  Track Order
                </button>
                <button
                  onClick={() => {
                    setActiveTab("full order details");
                    setIsProductDetails(false);
                  }}
                  className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                    activeTab === "full order details"
                      ? "bg-red-500 text-white"
                      : "bg-transparent text-[#00000080]"
                  }`}
                >
                  Full Order Details
                </button>
              </div>

              <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsCartView(true)}
              >
                <img className="w-10 h-10" src={images.cart} alt="Cart" />
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="">
            {/* Cart View */}
            {isCartView && (
              <div className="">
                {/* Cart Tabs */}
                <div className="flex p-1 gap-4 border border-[#989898] rounded-lg w-[335px] mb-5">
                  <button className="px-6 py-2 rounded-lg font-medium cursor-pointer bg-transparent text-[#00000080]">
                    Track Order
                  </button>
                  <button className="px-6 py-2 rounded-lg font-medium cursor-pointer bg-red-500 text-white">
                    Full Order Details
                  </button>
                </div>

                {/* Cart Content */}
                <ProductCart orderData={orderData} />
              </div>
            )}

            {/* Regular Tab Content - Only show when not in cart view */}
            {!isCartView && (
              <>
                {activeTab === "track order" && <OrderOverview orderData={orderData} />}
                {activeTab === "full order details" && !isProductDetails && (
                  <div className="mt-5">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                      </div>
                    ) : error ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="text-center text-red-500">
                          <p className="text-sm">Error loading order details</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Product Items */}
                        {orderData?.items?.map((item: OrderItem, index: number) => (
                          <div key={index} className={`flex flex-row ${index > 0 ? 'mt-3' : ''}`}>
                            <div>
                              <picture>
                                <img
                                  className="w-35 h-35 rounded-l-2xl object-cover"
                                  src={item.complete?.images?.[0]?.path || item.product?.images?.[0]?.path || images.iphone}
                                  alt={item.complete?.product?.name || item.product?.name || 'Product'}
                                  onError={(e) => {
                                    e.currentTarget.src = images.iphone;
                                  }}
                                />
                              </picture>
                            </div>
                            <div className="bg-[#F9F9F9] flex flex-col p-3 w-full rounded-r-2xl gap-1">
                              <span className="text-black text-[17px]">
                                {item.complete?.product?.name || item.product?.name || 'Unknown Product'}
                              </span>
                              <span className="text-[#E53E3E] font-bold text-[17px]">
                                ₦{item.complete?.product?.discount_price || item.complete?.product?.price || item.total || '0.00'}
                              </span>
                              <div className="flex flex-row justify-between items-center mt-3">
                                <div>
                                  <span className="text-[#E53E3E] font-bold text-[17px]">
                                    Qty: {item.quantity || 1}
                                  </span>
                                </div>
                                <div>
                                  <button
                                    onClick={() => {
                                      setActiveTab("full order details");
                                      setIsProductDetails(true);
                                      setProductTab("overview");
                                    }}
                                    className="bg-[#E53E3E] rounded-lg text-white px-4 py-2 cursor-pointer"
                                  >
                                    Product Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {!isLoading && !error && (
                      <div className="w-full mt-3">
                        <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                          Order Details
                        </div>
                        <div className="border border-[#CDCDCD] rounded-b-2xl">
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-21 p-2">
                            <span className="text-[#00000080]">Order ID</span>
                            <span>{orderData?.order_no || 'N/A'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                            <span className="text-[#00000080]">Store Name</span>
                            <span>{orderData?.store?.name || 'N/A'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-16 p-2">
                            <span className="text-[#00000080]">No of items</span>
                            <span>{orderData?.items?.length || 0}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-10 p-2">
                            <span className="text-[#00000080]">
                              Customer Name
                            </span>
                            <span>{orderData?.customer?.name || 'N/A'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-12 p-2">
                            <span className="text-[#00000080]">
                              Status
                            </span>
                            <span className="capitalize">{orderData?.status || 'N/A'}</span>
                          </div>
                          <div className="flex flex-row gap-28 p-2">
                            <span className="text-[#00000080]">Date</span>
                            <span>{orderData?.created_at ? new Date(orderData.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isLoading && !error && (
                      <div className="w-full mt-3">
                        <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                          Delivery Details
                        </div>
                        <div className="border border-[#CDCDCD] rounded-b-2xl">
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-9 p-2">
                            <span className="text-[#00000080]">Phone Number</span>
                            <span>{orderData?.customer?.phone || orderData?.delivery_address?.contact_phone || 'N/A'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-27 p-2">
                            <span className="text-[#00000080]">State</span>
                            <span>{orderData?.delivery_address?.state || 'N/A'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-28 p-2">
                            <span className="text-[#00000080]">LGA</span>
                            <span>{orderData?.delivery_address?.local_government || 'N/A'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-21 p-2">
                            <span className="text-[#00000080]">Address</span>
                            <span>{orderData?.delivery_address?.full_address || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isLoading && !error && (
                      <div className="w-full mt-3">
                        <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                          Price Details
                        </div>
                        <div className="border border-[#CDCDCD] rounded-b-2xl">
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-17 p-2">
                            <span className="text-[#00000080]">Items Cost</span>
                            <span className="font-bold">₦{orderData?.pricing?.items_subtotal || '0.00'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-3 p-2">
                            <span className="text-[#00000080]">
                              Shipping Fee
                            </span>
                            <span className="font-bold">₦{orderData?.pricing?.shipping_fee || '0.00'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-7 p-2">
                            <span className="text-[#00000080]">
                              Discount
                            </span>
                            <span className="font-bold">-₦{orderData?.pricing?.discount || '0.00'}</span>
                          </div>
                          <div className="flex flex-row border-b border-[#CDCDCD] gap-28 p-2">
                            <span className="text-[#00000080]">Total</span>
                            <span className="font-bold">₦{orderData?.pricing?.subtotal_with_shipping || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Accept-on-behalf form: only when status is pending_acceptance and user has permission */}
                    {!isLoading && !error && orderData?.status === "pending_acceptance" && canAcceptOrder && (
                      <div className="w-full mt-5">
                        <div className="bg-[#E53E3E] text-white flex items-center justify-between px-3 py-2 rounded-t-2xl">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-sm font-semibold">
                              ✓
                            </span>
                            <span className="text-sm sm:text-base font-semibold">
                              Accept Order On Behalf of Seller
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide bg-white/10">
                            Pending acceptance
                          </span>
                        </div>

                        <div className="border border-[#CDCDCD] rounded-b-2xl bg-[#FDFDFD] px-3 py-4 space-y-4">
                          <p className="text-[11px] leading-relaxed text-[#00000099]">
                            Set the delivery fee and (optionally) delivery details to accept
                            this order on behalf of the seller. Once accepted, the buyer can
                            proceed to payment using the updated totals.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Delivery Fee (₦) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={deliveryFee}
                                onChange={(e) => setDeliveryFee(e.target.value)}
                                placeholder="e.g. 1500"
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-[#E53E3E] bg-white"
                              />
                              {acceptErrors?.delivery_fee && (
                                <span className="mt-1 block text-[11px] text-red-600">
                                  {acceptErrors.delivery_fee[0]}
                                </span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Estimated Delivery Date <span className="text-[#00000080]">(optional)</span>
                              </label>
                              <input
                                type="date"
                                min={todayDateString}
                                value={estimatedDeliveryDate}
                                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-[#E53E3E] bg-white"
                              />
                              {acceptErrors?.estimated_delivery_date && (
                                <span className="mt-1 block text-[11px] text-red-600">
                                  {acceptErrors.estimated_delivery_date[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Delivery Method <span className="text-[#00000080]">(optional)</span>
                              </label>
                              <input
                                type="text"
                                value={deliveryMethod}
                                onChange={(e) => setDeliveryMethod(e.target.value)}
                                placeholder="e.g. Door delivery"
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-[#E53E3E] bg-white"
                              />
                              {acceptErrors?.delivery_method && (
                                <span className="mt-1 block text-[11px] text-red-600">
                                  {acceptErrors.delivery_method[0]}
                                </span>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Delivery Notes <span className="text-[#00000080]">(optional)</span>
                              </label>
                              <textarea
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                placeholder="Deliver between 9–5, call on arrival, etc."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-[#E53E3E] bg-white"
                              />
                              {acceptErrors?.delivery_notes && (
                                <span className="mt-1 block text-[11px] text-red-600">
                                  {acceptErrors.delivery_notes[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => acceptOrderMutation.mutate()}
                              disabled={
                                !deliveryFee ||
                                Number(deliveryFee) < 0 ||
                                acceptOrderMutation.isPending
                              }
                              className="w-full h-10 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-[#E53E3E] text-white hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              {acceptOrderMutation.isPending
                                ? "Accepting order..."
                                : "Accept Order On Behalf"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        className="flex-1 bg-[#E53E3E] text-white py-3 px-4 rounded-lg hover:bg-red-600 focus:outline-none transition-colors font-normal cursor-pointer"
                        onClick={() => {
                          // Prefer using chat.id if available; otherwise, fall back to orderId
                          const targetId = orderData?.chat?.id || orderData?.id || orderId;
                          navigate("/chats", {
                            state: { selectedOrderId: targetId, fromOrders: true },
                          });
                        }}
                      >
                        View Chat
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#ffffff] text-[#00000080] py-3 px-4 rounded-lg border border-[#989898] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer"
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "full order details" && isProductDetails && (
                  <ProductDetails
                    productTab={productTab}
                    setProductTab={setProductTab}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    productData={{
                      complete: orderData?.items?.[0]?.complete || orderData?.items?.[0]
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOrderDetails;
