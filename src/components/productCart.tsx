import images from "../constants/images";
import React, { useState } from "react";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  total: string;
  product?: {
    id: number;
    name: string;
    price: string;
    discount_price?: string;
    images?: Array<{
      id: number;
      path: string;
      is_main: number;
    }>;
  };
  complete?: {
    product: {
      id: number;
      name: string;
      price: string;
      discount_price?: string;
      images?: Array<{
        id: number;
        path: string;
        is_main: number;
      }>;
    };
    store: {
      id: number;
      store_name: string;
    };
  };
}

interface ProductCartProps {
  orderData?: {
    items?: OrderItem[];
    total_amount?: string;
    created_at?: string;
  };
}

const ProductCart: React.FC<ProductCartProps> = ({ orderData }) => {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  
  // Initialize quantities from order data
  React.useEffect(() => {
    if (orderData?.items) {
      const initialQuantities: { [key: number]: number } = {};
      orderData.items.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [orderData]);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantities(prev => ({
        ...prev,
        [itemId]: newQuantity
      }));
    }
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalAmount = () => {
    if (!orderData?.items) return 0;
    return orderData.items.reduce((sum, item) => {
      const price = parseFloat(item.complete?.product?.discount_price || item.complete?.product?.price || item.total || '0');
      const qty = quantities[item.id] || item.quantity;
      return sum + (price * qty);
    }, 0);
  };

  // Group items by store
  const groupedItems = React.useMemo(() => {
    if (!orderData?.items) return {};
    
    const groups: { [storeId: number]: { store: { store_name: string }; items: OrderItem[] } } = {};
    
    orderData.items.forEach((item) => {
      const storeId = item.complete?.store?.id || 0;
      if (!groups[storeId]) {
        groups[storeId] = {
          store: item.complete?.store || { store_name: 'Unknown Store' },
          items: []
        };
      }
      groups[storeId].items.push(item);
    });
    
    return groups;
  }, [orderData?.items]);
  // Debug: Log the order data
  console.log('ProductCart - orderData:', orderData);
  console.log('ProductCart - groupedItems:', groupedItems);

  if (!orderData?.items || orderData.items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No items in this order</p>
      </div>
    );
  }

  return (
    <div>
      {/* Render each store group */}
      {Object.entries(groupedItems).map(([storeId, group], groupIndex) => (
        <div key={storeId} className={groupIndex > 0 ? "mt-5" : ""}>
          <div className="flex flex-row gap-2.5">
            <div>
              <img className="w-6 h-6" src={images.tick1} alt="" />
            </div>
            <div
              className="flex flex-col w-full rounded-2xl"
              style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="bg-[#E53E3E] text-white p-3 text-2xl font-semibold rounded-t-2xl">
                <span>{group.store.store_name}</span>
              </div>
              <div className="flex flex-col p-3 gap-3">
                <div className="flex flex-col gap-4">
                  {/* Render each item in this store */}
                  {group.items.map((item) => {
                    const currentQuantity = quantities[item.id] || item.quantity;
                    const productName = item.complete?.product?.name || item.product?.name || 'Unknown Product';
                    const productPrice = item.complete?.product?.discount_price || item.complete?.product?.price || item.total || '0';
                    const productImage = item.complete?.product?.images?.[0]?.path || item.product?.images?.[0]?.path || images.iphone;
                    
                    return (
                      <div key={item.id} className="flex flex-row">
                        <div>
                          <picture>
                            <img
                              className="w-32 h-32 rounded-l-2xl object-cover"
                              src={productImage.startsWith('http') ? productImage : `https://colala.hmstech.xyz/storage/${productImage}`}
                              alt={productName}
                              onError={(e) => {
                                e.currentTarget.src = images.iphone;
                              }}
                            />
                          </picture>
                        </div>
                        <div className="bg-[#F9F9F9] flex flex-col p-2 w-full rounded-r-2xl gap-1">
                          <span className="text-black text-[17px]">
                            {productName}
                          </span>
                          <span className="text-[#E53E3E] font-bold text-[17px]">
                            ₦{parseFloat(productPrice).toLocaleString()}
                          </span>
                          {/* <div className="flex flex-row gap-15 items-center mt-3">
                            <div className="flex items-center">
                              <button
                                type="button"
                                className="cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => updateQuantity(item.id, currentQuantity - 1)}
                                disabled={currentQuantity <= 1}
                              >
                                <img className="w-10 h-10" src={images.minus} alt="" />
                              </button>

                              <span className="text-[#E53E3E] font-bold text-2xl min-w-[40px] text-center px-2 py-1 rounded">
                                {currentQuantity}
                              </span>

                              <button
                                type="button"
                                className="cursor-pointer transition-colors"
                                onClick={() => updateQuantity(item.id, currentQuantity + 1)}
                              >
                                <img className="w-10 h-10" src={images.plus} alt="" />
                              </button>
                            </div>
                            <div className="flex flex-row gap-5">
                              <div>
                                <img
                                  className="w-7 h-7 cursor-pointer"
                                  src={images.edit1}
                                  alt="Edit"
                                />
                              </div>
                              <div>
                                <img
                                  className="w-6 h-6 cursor-pointer"
                                  src={images.delete1}
                                  alt="Delete"
                                />
                              </div>
                            </div>
                          </div> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Store totals */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
                    <span className="text-[18px]">No of items</span>
                    <span className="text-[18px] font-bold">
                      {group.items.reduce((sum, item) => sum + (quantities[item.id] || item.quantity), 0)}
                    </span>
                  </div>
                  <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
                    <span className="text-[18px]">Total</span>
                    <span className="text-[18px] text-[#E53E3E] font-bold">
                      ₦{group.items.reduce((sum, item) => {
                        const price = parseFloat(item.complete?.product?.discount_price || item.complete?.product?.price || item.total || '0');
                        const qty = quantities[item.id] || item.quantity;
                        return sum + (price * qty);
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Overall totals */}
      <div className="flex flex-col gap-1.5 mt-5">
        <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
          <span className="text-[18px]">No of items</span>
          <span className="text-[18px] font-bold">
            {getTotalItems()}
          </span>
        </div>
        <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
          <span className="text-[18px]">Total</span>
          <span className="text-[18px] text-[#E53E3E] font-bold">
            ₦{getTotalAmount().toLocaleString()}
          </span>
        </div>
      </div>

      {/* <div className="mt-5">
        <button className="bg-[#E53E3E] rounded-2xl cursor-pointer w-full text-white py-4">
          Checkout
        </button>
      </div> */}
    </div>
  );
};

export default ProductCart;
