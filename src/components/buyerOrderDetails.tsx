import images from "../constants/images";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductDetails from "./productDetails";
import OrderOverview from "./orderOverview";
import ProductCart from "./productCart";
import { getBuyerOrderDetails } from "../utils/queries/users";

interface BuyerOrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | number;
  order?: any; // Optional order data
}

const BuyerOrderDetails: React.FC<BuyerOrderDetailsProps> = ({
  isOpen,
  onClose,
  orderId,
  order,
}) => {
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

  // Fetch order details from API
  const { data: orderDetailsData, isLoading, error } = useQuery({
    queryKey: ['buyerOrderDetails', orderId],
    queryFn: () => getBuyerOrderDetails(orderId!),
    enabled: !!orderId && isOpen,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use API data or fallback to passed order prop
  const orderData = orderDetailsData?.data || order;

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
                <ProductCart />
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
                        {orderData?.items?.map((item: any, index: number) => (
                          <div key={index} className={`flex flex-row ${index > 0 ? 'mt-3' : ''}`}>
                            <div>
                              <picture>
                                <img
                                  className="w-35 h-35 rounded-l-2xl object-cover"
                                  src={item.product?.images?.[0]?.path || item.complete?.images?.[0]?.path || images.iphone}
                                  alt={item.product?.name || item.complete?.product?.name || 'Product'}
                                  onError={(e) => {
                                    e.currentTarget.src = images.iphone;
                                  }}
                                />
                              </picture>
                            </div>
                            <div className="bg-[#F9F9F9] flex flex-col p-3 w-full rounded-r-2xl gap-1">
                              <span className="text-black text-[17px]">
                                {item.product?.name || item.complete?.product?.name || 'Unknown Product'}
                              </span>
                              <span className="text-[#E53E3E] font-bold text-[17px]">
                                ₦{item.total || item.complete?.product?.price || '0.00'}
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
                            <span>{orderData?.created_at || 'N/A'}</span>
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
                    productData={{
                      compelete: orderData?.items?.[0]?.complete || orderData?.items?.[0]
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
