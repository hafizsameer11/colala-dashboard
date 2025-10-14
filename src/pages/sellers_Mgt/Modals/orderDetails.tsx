import images from "../../../constants/images";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrderDetails } from "../../../utils/queries/users";
import ProductDetails from "../../../components/productDetails";
import OrderOverview from "./orderOverview";

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  onStatusUpdate?: (storeOrderId: string, statusData: any) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ isOpen, onClose, orderId, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState<
    "track order" | "full order details"
  >("track order");
  // Sub-view flag: when true, we're inside Product Details while keeping the tab as Full Order Details
  const [isProductDetails, setIsProductDetails] = useState(false);
  // Product details inner tabs
  const [productTab, setProductTab] = useState<
    "overview" | "description" | "reviews"
  >("overview");
  // Quantity state for the counter
  const [quantity, setQuantity] = useState<number>(1);
  // Status update form
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [deliveryCode, setDeliveryCode] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const { data: orderDetails, isLoading, error } = useQuery({
    queryKey: ['adminOrderDetails', orderId],
    queryFn: () => getAdminOrderDetails(orderId!),
    enabled: !!isOpen && !!orderId,
    staleTime: 5 * 60 * 1000,
  });

  const d = orderDetails?.data;

  const handleStatusUpdate = () => {
    if (newStatus && onStatusUpdate && orderId) {
      onStatusUpdate(orderId, {
        status: newStatus,
        notes: statusNotes,
        delivery_code: deliveryCode,
      });
      setShowStatusUpdate(false);
      setNewStatus("");
      setDeliveryCode("");
      setStatusNotes("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isProductDetails && (
                <button
                  onClick={() => {
                    setIsProductDetails(false);
                    setProductTab("overview");
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
                {isProductDetails ? "Product details" : "Order Details"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md  cursor-pointer"
              aria-label="Close"
            >
              <img src={images.close} alt="Close" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Tabs */}
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
          </div>

          {/* Status Update Section */}
          {d && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Order Status Management</h3>
                <button
                  onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  {showStatusUpdate ? 'Cancel' : 'Update Status'}
                </button>
              </div>
              
              <div className="mb-3">
                <span className="text-sm text-gray-600">Current Status: </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  d.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  d.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                  d.status === 'placed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {d.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {showStatusUpdate && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="disputed">Disputed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryCode}
                      onChange={(e) => setDeliveryCode(e.target.value)}
                      placeholder="Enter delivery code"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Enter status update notes"
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Status
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div className="">
            {activeTab === "track order" && <OrderOverview orderData={d} />}
            {activeTab === "full order details" && !isProductDetails && (
              <div className="mt-5">
                {(d?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className={`flex flex-row ${idx>0?'mt-3':''}`}>
                    <div>
                      <picture>
                        <img
                          className="w-35 h-35 rounded-l-2xl object-cover"
                          src={item?.complete?.images?.[0]?.path || item?.product?.images?.[0]?.path || images.iphone}
                          alt={item?.complete?.product?.name || item?.product?.name || 'Product'}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = images.iphone; }}
                        />
                      </picture>
                    </div>
                    <div className="bg-[#F9F9F9] flex flex-col p-3 w-full rounded-r-2xl gap-1">
                      <span className="text-black text-[17px]">{item?.complete?.product?.name || item?.product?.name || 'N/A'}</span>
                      <span className="text-[#E53E3E] font-bold text-[17px]">₦{item?.total || item?.complete?.product?.price || '0.00'}</span>
                      <div className="flex flex-row justify-between items-center mt-3">
                        <div>
                          <span className="text-[#E53E3E] font-bold text-[17px]">Qty : {item?.quantity ?? 1}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => { setActiveTab("full order details"); setIsProductDetails(true); setProductTab("overview"); }}
                            className="bg-[#E53E3E] rounded-lg text-white px-4 py-2 cursor-pointer"
                          >
                            Product Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-row mt-3">
                  <div>
                    <picture>
                      <img
                        className="w-35 h-35 rounded-l-2xl"
                        src={images.iphone}
                        alt=""
                      />
                    </picture>
                  </div>
                  <div className="bg-[#F9F9F9] flex flex-col p-3 w-full rounded-r-2xl gap-1">
                    <span className="text-black text-[17px]">
                      Iphone 16 pro max - Black
                    </span>
                    <span className="text-[#E53E3E] font-bold text-[17px]">
                      N2,500,000
                    </span>
                    <div className="flex flex-row justify-between items-center mt-3">
                      <div>
                        <span className="text-[#E53E3E] font-bold text-[17px]">
                          Qty :1
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

                <div className="w-full mt-3">
                  <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                    Order Details
                  </div>
                  <div className="border border-[#CDCDCD] rounded-b-2xl">
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-21 p-2"><span className="text-[#00000080]">Order ID</span><span>{d?.order_no || 'N/A'}</span></div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-15 p-2">
                      <span className="text-[#00000080]">Store Name</span>
                      <span>{d?.store?.name || 'N/A'}</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-16 p-2">
                      <span className="text-[#00000080]">No of items</span>
                      <span>{d?.items?.length || 0}</span>
                    </div>
                    <div className="flex flex-row gap-28 p-2">
                      <span className="text-[#00000080]">Date</span>
                      <span>{d?.created_at || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3">
                  <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                    Delivery Details
                  </div>
                  <div className="border border-[#CDCDCD] rounded-b-2xl">
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-9 p-2"><span className="text-[#00000080]">Phone Number</span><span>{d?.customer?.phone || d?.delivery_address?.contact_phone || 'N/A'}</span></div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-27 p-2">
                      <span className="text-[#00000080]">State</span>
                      <span>{d?.delivery_address?.state || 'N/A'}</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-28 p-2">
                      <span className="text-[#00000080]">LGA</span>
                      <span>{d?.delivery_address?.local_government || 'N/A'}</span>
                    </div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-21 p-2">
                      <span className="text-[#00000080]">Address</span>
                      <span>{d?.delivery_address?.full_address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3">
                  <div className="bg-[#E53E3E] text-white text-xl font-semibold p-2 rounded-t-2xl">
                    Price Details
                  </div>
                  <div className="border border-[#CDCDCD] rounded-b-2xl">
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-17 p-2"><span className="text-[#00000080]">Items Cost</span><span className="font-bold">₦{d?.pricing?.items_subtotal || '0.00'}</span></div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-3 p-2"><span className="text-[#00000080]">Shipping Fee</span><span className="font-bold">₦{d?.pricing?.shipping_fee || '0.00'}</span></div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-7 p-2"><span className="text-[#00000080]">Discount</span><span className="font-bold">-₦{d?.pricing?.discount || '0.00'}</span></div>
                    <div className="flex flex-row border-b border-[#CDCDCD] gap-28 p-2"><span className="text-[#00000080]">Total</span><span className="font-bold">₦{d?.pricing?.subtotal_with_shipping || '0.00'}</span></div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 bg-[#E53E3E] text-white py-3 px-4 rounded-lg hover:bg-red-600 focus:outline-none transition-colors font-normal cursor-pointer"
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
                productData={{ compelete: d?.items?.[0]?.complete || d?.items?.[0] }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetails;
