import images from "../../../constants/images";
import React, { useState } from "react";

interface OverviewProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  productInfo?: any;
  storeInfo?: any;
  images?: any[];
  variants?: any[];
}

// ColorPicker component
const ColorPicker: React.FC<{ variants?: any[] }> = ({ variants = [] }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const colors = variants.length > 0 ? variants.map(v => v.color) : ["#000000", "#0000FF", "#FF0000", "#FFFF00", "#00FFFF"];

  return (
    <div className="flex gap-2 pb-4">
      {colors.map((color, index) => (
        <span
          key={index}
          onClick={() => setSelected(index)}
          className={`rounded-full w-12 h-12 inline-block cursor-pointer ${
            selected === index ? "border-3 border-[#E53E3E]" : ""
          }`}
          style={{ backgroundColor: color }}
        ></span>
      ))}
    </div>
  );
};

// SizePicker component
const SizePicker: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);

  const sizes = ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="flex gap-2 pb-4">
      {sizes.map((size, index) => (
        <span
          key={index}
          onClick={() => setSelected(index)}
          className={`flex items-center justify-center rounded-2xl w-15 h-15 cursor-pointer text-lg border border-[#00000080]
            ${
              selected === index
                ? "bg-[#E53E3E] text-white"
                : "bg-white text-black"
            }`}
        >
          {size}
        </span>
      ))}
    </div>
  );
};

const Overview: React.FC<OverviewProps> = ({ quantity, setQuantity, productInfo, storeInfo, images, variants }) => {
  return (
    <div className="">
      <div>
        <div className="flex flex-row justify-between w-80">
          <span className="font-semibold text-[17px]">{productInfo?.name || "Product Name"}</span>
          <div className="flex items-center gap-1">
            <img 
              className="w-5 h-5" 
              src={images.start1} 
              alt="Star" 
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDJMMTIuMDkgNy4wOUwxOCA4LjE4TDE0IDEyLjA5TDE0LjgyIDE4TDEwIDE1LjA5TDUuMTggMThMNiAxMi4wOUwyIDguMThMOC4wOSA3LjA5TDEwIDJaIiBmaWxsPSIjRkZEMDAwIi8+Cjwvc3ZnPg==';
              }}
            />
            <span className="text-[#00000080] text-[17px]">{productInfo?.average_rating || "0"}</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="font-bold text-[#E53E3E] text-[17px]">
            ₦{productInfo?.price ? parseFloat(productInfo.price).toLocaleString() : "0"}
          </span>
          {productInfo?.discount_price && (
            <span className="line-through text-[#00000080] text-[14px] ml-2">
              ₦{parseFloat(productInfo.discount_price).toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {/* Information tag 1 - Orange */}
          <div className="flex items-center bg-[#FFA500] text-white rounded-md">
            <div className="relative w-15 h-10 bg-[#FF3300] overflow-hidden rounded-md flex items-center px-3">
              {/* Right-side tilted shape */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFA500] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
              {/* Cart Icon */}
              <img 
                className="w-5 h-5" 
                src={images.cart1} 
                alt="Cart" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMkg1QzMuOSAyIDMgMi45IDMgNFYxNkMzIDE3LjEgMy45IDE4IDUgMThIMTVDMTYuMSAxOCAxNyAxNy4xIDE3IDE2VjRIMTdDMTcuMSA0IDE3IDMuMSAxNyAySDdWNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                }}
              />
            </div>
            <span className="text-sm font-medium">Information tag 1</span>
          </div>

          {/* Information tag 2 - Blue */}
          <div className="flex items-center bg-[#0000FF] text-white rounded-md">
            <div className="relative w-15 h-10 bg-[#14146F] overflow-hidden rounded-md flex items-center px-3">
              {/* Right-side tilted shape */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-[#0000FF] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
              {/* Cart Icon */}
              <img 
                className="w-5 h-5" 
                src={images.cart1} 
                alt="Cart" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMkg1QzMuOSAyIDMgMi45IDMgNFYxNkMzIDE3LjEgMy45IDE4IDUgMThIMTVDMTYuMSAxOCAxNyAxNy4xIDE3IDE2VjRIMTdDMTcuMSA0IDE3IDMuMSAxNyAySDdWNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                }}
              />
            </div>
            <span className="text-sm font-medium">Information tag 2</span>
          </div>

          {/* Information tag 3 - Purple */}
          <div className="flex items-center bg-[#800080] text-white rounded-md">
            <div className="relative w-15 h-10 bg-[#050531] overflow-hidden rounded-md flex items-center px-3">
              {/* Right-side tilted shape */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-[#800080] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
              {/* Cart Icon */}
              <img 
                className="w-5 h-5" 
                src={images.cart1} 
                alt="Cart" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMkg1QzMuOSAyIDMgMi45IDMgNFYxNkMzIDE3LjEgMy45IDE4IDUgMThIMTVDMTYuMSAxOCAxNyAxNy4xIDE3IDE2VjRIMTdDMTcuMSA0IDE3IDMuMSAxNyAySDdWNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                }}
              />
            </div>
            <span className="text-sm font-medium">Information tag 3</span>
          </div>
        </div>

        {/* Colors Section */}
        <div className="border-t border-b border-[#00000080] mt-2">
          <div className="flex flex-col gap-3">
            <span className="text-lg font-medium pt-3">Colors</span>
            <div>
              <ColorPicker variants={variants} />
            </div>
          </div>
        </div>

        {/* Size Section */}
        <div className="border-b border-[#00000080]">
          <div className="flex flex-col gap-3">
            <span className="text-lg font-medium pt-3">Size</span>
            <div>
              <SizePicker />
            </div>
          </div>
        </div>

        {/* Quantity Left and Counter */}
        <div className="mt-4 flex flex-row justify-between items-center border-b border-[#00000080] pb-3">
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
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-3">
            {/* Delete Button */}
            <button
              type="button"
              className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <img 
                className="w-6 h-6" 
                src={images.delete1} 
                alt="Delete" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNkg1SDIxTTggNlY0QzggMy40NDc3MiA4LjQ0NzcyIDMgOSAzSDE1QzE1LjU1MjMgMyAxNiAzLjQ0NzcyIDE2IDRWNkg4TTEwIDExVjE3TTE0IDExVjE3TTE5IDdWMTlDMTkgMjAuMTA0NiAxOC4xMDQ2IDIxIDE3IDIxSDdDNS44OTU0MyAyMSA1IDIwLjEwNDYgNSAxOVY3SDE5WiIgc3Ryb2tlPSIjRkY0NDQ0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=';
                }}
              />
            </button>

            {/* Analytics Button */}
            <button
              type="button"
              className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <img 
                className="w-6 h-6" 
                src={images.analyticsIcon} 
                alt="Analytics" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgM1YyMUgyMVYzSDNaTTUgNUgxOVYxOUg1VjVaIiBzdHJva2U9IiM2MzY2RjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik03IDEzTDEwIDEwTDEzIDEzTDE3IDkiIHN0cm9rZT0iIzYzNjZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=';
                }}
              />
            </button>

            {/* Status Button */}
            <button
              type="button"
              className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <img 
                className="w-6 h-6" 
                src={images.tick} 
                alt="Status" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTAiIHN0cm9rZT0iIzEwQjk0MSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzEwQjk0MSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==';
                }}
              />
            </button>

            {/* Edit Product Button */}
            <button
              type="button"
              className="flex-1 bg-[#E53E3E] text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-red-600 transition-colors"
            >
              Edit Product
            </button>
          </div>

          {/* Boost Product Button */}
          <button
            type="button"
            className="w-full bg-black text-white rounded-2xl py-4 px-6 font-medium cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Boost Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
