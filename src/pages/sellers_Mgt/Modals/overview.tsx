import React, { useState } from "react";
import BoostProductModal from "./boostProductModal";
import images from "../../../constants/images";

interface OverviewProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  productInfo?: {
    name?: string;
    price?: string;
    discount_price?: string;
    tags?: Array<{ name?: string } | string>;
  };
  storeInfo?: unknown;
  images?: unknown[];
  variants?: Array<{ color?: string | null; size?: string | null }>;
  productId?: string | number;
  userId?: string;
  onEditProduct?: () => void;
  onDeleteProduct?: () => void;
  onViewAnalytics?: () => void;
  onUpdateStatus?: () => void;
}

// ColorPicker component
const ColorPicker: React.FC<{ colors: string[] }> = ({ colors }) => {
  const [selected, setSelected] = useState<number | null>(null);

  if (colors.length === 0) return null;

  return (
    <div className="flex gap-2 pb-4">
      {colors.map((color, index) => (
        <span
          key={color}
          onClick={() => setSelected(index)}
          className={`rounded-full w-12 h-12 inline-block cursor-pointer ${
            selected === index ? "border-3 border-[#E53E3E]" : ""
          }`}
          style={{ backgroundColor: color }}
          title={color}
        ></span>
      ))}
    </div>
  );
};

// SizePicker component
const SizePicker: React.FC<{ sizes: string[] }> = ({ sizes }) => {
  const [selected, setSelected] = useState<number | null>(null);

  if (sizes.length === 0) return null;

  return (
    <div className="flex gap-2 pb-4">
      {sizes.map((size, index) => (
        <span
          key={`${size}-${index}`}
          onClick={() => setSelected(index)}
          className={`flex items-center justify-center rounded-2xl w-15 h-15 cursor-pointer text-lg border border-[#00000080] ${
            selected === index ? "bg-[#E53E3E] text-white" : "bg-white text-black"
          }`}
        >
          {size}
        </span>
      ))}
    </div>
  );
};

const Overview: React.FC<OverviewProps> = ({ 
  productInfo, 
  variants, 
  productId, 
  userId: _userId, // intentionally unused at the moment
  onEditProduct,
  onDeleteProduct,
  onViewAnalytics,
  onUpdateStatus: _onUpdateStatus
}) => {
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);

  const colorOptions = Array.from(
    new Set(
      (variants || [])
        .map((variant) => variant.color)
        .filter((color): color is string => Boolean(color && color.trim()))
    )
  );

  const sizeOptions = Array.from(
    new Set(
      (variants || [])
        .map((variant) => variant.size)
        .filter((size): size is string => Boolean(size && size.trim()))
    )
  );

  const formatCurrency = (amount?: string) => {
    if (!amount) return null;
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return null;
    return `₦${numericValue.toLocaleString()}`;
  };

  const originalPrice = formatCurrency(productInfo?.price);
  const discountedPrice = formatCurrency(productInfo?.discount_price);
  const displayPrice = discountedPrice ?? originalPrice ?? "₦0";

  return (
    <div className="">
      <div>
        <div className="flex flex-row justify-between w-80">
          <span className="font-semibold text-[17px]">{productInfo?.name || "Product Name"}</span>
          {/* <div className="flex items-center gap-1">
            <img 
              className="w-5 h-5" 
              src={images.start1} 
              alt="Star" 
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDJMMTIuMDkgNy4wOUwxOCA4LjE4TDE0IDEyLjA5TDE0LjgyIDE4TDEwIDE1LjA5TDUuMTggMThMNiAxMi4wOUwyIDguMThMOC4wOSA3LjA5TDEwIDJaIiBmaWxsPSIjRkZEMDAwIi8+Cjwvc3ZnPg==';
              }}
            />
            <span className="text-[#00000080] text-[17px]">{productInfo?.average_rating || "0"}</span>
          </div> */}
        </div>
        <div className="mt-2">
          <span className="font-bold text-[#E53E3E] text-[17px]">
            {displayPrice}
          </span>
          {discountedPrice && originalPrice && discountedPrice !== originalPrice && (
            <span className="line-through text-[#00000080] text-[14px] ml-2">
              {originalPrice}
            </span>
          )}
        </div>
        {/* Information tags - Only show if we have tag data from backend */}
        {productInfo?.tags && productInfo.tags.length > 0 && (
          <div className="mt-4 space-y-2">
            {productInfo.tags.map((tag: { name?: string } | string, index: number) => {
              const tagName = typeof tag === 'string' ? tag : tag.name || 'Tag';
              const colors = [
                { bg: '#FFA500', dark: '#FF3300' },
                { bg: '#0000FF', dark: '#14146F' },
                { bg: '#800080', dark: '#050531' }
              ];
              const color = colors[index % colors.length];

              return (
                <div key={index} className="flex items-center text-white rounded-md" style={{ backgroundColor: color.bg }}>
                  <div className="relative w-15 h-10 overflow-hidden rounded-md flex items-center px-3" style={{ backgroundColor: color.dark }}>
                    {/* Right-side tilted shape */}
                    <div className="absolute top-0 right-0 w-1/3 h-full [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]" style={{ backgroundColor: color.bg }}></div>
                    {/* Cart Icon */}
                    <img
                      className="w-5 h-5"
                      src={images?.cart1 || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMkg1QzMuOSAyIDMgMi45IDMgNFYxNkMzIDE3LjEgMy45IDE4IDUgMThIMTVDMTYuMSAxOCAxNyAxNy4xIDE3IDE2VjRIMTdDMTcuMSA0IDE3IDMuMSAxNyAySDdWNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=='}
                      alt="Cart"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMkg1QzMuOSAyIDMgMi45IDMgNFYxNkMzIDE3LjEgMy45IDE4IDUgMThIMTVDMTYuMSAxOCAxNyAxNy4xIDE3IDE2VjRIMTdDMTcuMSA0IDE3IDMuMSAxNyAySDdWNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{tagName}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Colors Section */}
        {colorOptions.length > 0 && (
          <div className="border-t border-b border-[#00000080] mt-2">
            <div className="flex flex-col gap-3">
              <span className="text-lg font-medium pt-3">Colors</span>
              <div>
                <ColorPicker colors={colorOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Size Section */}
        {sizeOptions.length > 0 && (
          <div className="border-b border-[#00000080]">
            <div className="flex flex-col gap-3">
              <span className="text-lg font-medium pt-3">Size</span>
              <div>
                <SizePicker sizes={sizeOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Quantity Left and Counter */}
        {/* <div className="mt-4 flex flex-row justify-between items-center border-b border-[#00000080] pb-3">
          <div className="flex flex-col py-4">
            <span className="text-gray-500 text-sm">Quantity Left</span>
            <span className="text-[#E53E3E] font-bold text-2xl">{productInfo?.quantity || 0}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="w-12 h-12 bg-[#E53E3E] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (quantity > 1) {
                  setQuantity(quantity - 1);
                }
              }}
              disabled={quantity <= 1}
            >
              <span className="text-xl font-bold">−</span>
            </button>

            <span className="text-[#E53E3E] font-bold text-2xl min-w-[50px] text-center">
              {quantity}
            </span>

            <button
              type="button"
              className="w-12 h-12 bg-[#E53E3E] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
              onClick={() => {
                setQuantity(quantity + 1);
              }}
            >
              <span className="text-xl font-bold">+</span>
            </button>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-3">
            {/* Delete Button */}
            <button
              type="button"
              onClick={onDeleteProduct}
              className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              title="Delete Product"
            >
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {/* Analytics Button */}
            <button
              type="button"
              onClick={onViewAnalytics}
              className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              title="View Analytics"
            >
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>

            {/* Status Button */}
            {/* <button
              type="button"
              onClick={onUpdateStatus}
              className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              title="Update Status"
            >
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button> */}

            {/* Edit Product Button */}
            <button
              type="button"
              onClick={onEditProduct}
              className="flex-1 bg-[#E53E3E] text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-red-600 transition-colors"
            >
              Edit Product
            </button>
          </div>

          {/* Boost Product Button */}
          <button
            type="button"
            onClick={() => {
              if (!productId) {
                alert('Product ID is required to boost this product');
                return;
              }
              setIsBoostModalOpen(true);
            }}
            className="w-full bg-black text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Boost Product
          </button>
        </div>
      </div>

      {/* Boost Product Modal */}
      <BoostProductModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        productId={productId}
        productName={productInfo?.name}
      />
    </div>
  );
};

export default Overview;
