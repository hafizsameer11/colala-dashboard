import images from "../constants/images";
import React, { useState } from "react";

// ColorPicker component
const ColorPicker: React.FC<{ variants?: Array<{ color?: string; size?: string }> }> = ({ variants = [] }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const colors = variants
    .map(v => v.color)
    .filter(Boolean)
    .filter((color, index, arr) => arr.indexOf(color) === index); // Remove duplicates

  // Don't render if no colors available
  if (colors.length === 0) {
    return null;
  }

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
const SizePicker: React.FC<{ variants?: Array<{ color?: string; size?: string }> }> = ({ variants = [] }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const sizes = variants
    .map(v => v.size)
    .filter(Boolean)
    .filter((size, index, arr) => arr.indexOf(size) === index); // Remove duplicates

  // Don't render if no sizes available
  if (sizes.length === 0) {
    return null;
  }

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

interface ProductData {
  complete?: {
    product: {
      id: number;
      name: string;
      description: string;
      price: string;
      discount_price?: string;
      quantity: number;
      status: string;
      is_featured?: boolean;
      created_at: string;
      average_rating?: number;
      variants?: Array<{
        color?: string;
        size?: string;
      }>;
    };
    images: Array<{
      id: number;
      path: string;
      is_main: number;
    }>;
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
  };
}

interface ProductOverviewProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  productData?: ProductData;
}

const ProductOverview: React.FC<ProductOverviewProps> = ({
  quantity,
  setQuantity,
  productData,
}) => {
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  return (
    <div className="">
      {/* Main Product Image */}
      {productData?.complete?.images && productData.complete.images.length > 0 && (
        <div className="mb-6">
          <img 
            src={productData.complete.images[0].path.startsWith('http') 
              ? productData.complete.images[0].path 
              : `https://colala.hmstech.xyz/storage/${productData.complete.images[0].path}`}
            alt={productData?.complete?.product?.name || 'Product'}
            className="w-full h-80 object-cover rounded-2xl"
            onError={(e) => {
              e.currentTarget.src = images.iphone;
            }}
          />
        </div>
      )}
      
      <div>
        <div className="flex flex-row justify-between w-80">
          <span className="font-semibold text-[17px]">
            {productData?.complete?.product?.name || 'Product Name'}
          </span>
          <div className="flex items-center gap-1">
            <img className="w-5 h-5" src={images.start1} alt="" />
            <span className="text-[#00000080] text-[17px]">
              {productData?.complete?.product?.average_rating || '0.0'}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <span className="font-bold text-[#E53E3E] text-[17px]">
            ₦{productData?.complete?.product?.discount_price || productData?.complete?.product?.price || '0.00'}
          </span>
          {productData?.complete?.product?.discount_price && (
            <span className="line-through text-[#00000080] text-[14px] ml-2">
              ₦{productData.complete.product.price}
            </span>
          )}
        </div>
        {/* Information Tags - Only show if product has specific features */}
        {(productData?.complete?.product?.is_featured || 
          productData?.complete?.product?.discount_price || 
          (productData?.complete?.store?.average_rating || 0) > 4) && (
          <div className="mt-4 space-y-2">
            {/* Featured Product Tag */}
            {productData?.complete?.product?.is_featured && (
              <div className="flex items-center bg-[#FFA500] text-white rounded-md">
                <div className="relative w-15 h-10 bg-[#FF3300] overflow-hidden rounded-md flex items-center px-3">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFA500] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                  <img className="w-5 h-5" src={images.cart1} alt="" />
                </div>
                <span className="text-sm font-medium">Featured Product</span>
              </div>
            )}

            {/* Discount Available Tag */}
            {productData?.complete?.product?.discount_price && (
              <div className="flex items-center bg-[#0000FF] text-white rounded-md">
                <div className="relative w-15 h-10 bg-[#14146F] overflow-hidden rounded-md flex items-center px-3">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-[#0000FF] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                  <img className="w-5 h-5" src={images.cart1} alt="" />
                </div>
                <span className="text-sm font-medium">Discount Available</span>
              </div>
            )}

            {/* High Rated Store Tag */}
            {(productData?.complete?.store?.average_rating || 0) > 4 && (
              <div className="flex items-center bg-[#800080] text-white rounded-md">
                <div className="relative w-15 h-10 bg-[#050531] overflow-hidden rounded-md flex items-center px-3">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-[#800080] [clip-path:polygon(50%_0,100%_0,100%_100%,0_100%)]"></div>
                  <img className="w-5 h-5" src={images.cart1} alt="" />
                </div>
                <span className="text-sm font-medium">Highly Rated Store</span>
              </div>
            )}
          </div>
        )}

        {/* Colors Section - Only show if there are color variants */}
        {productData?.complete?.product?.variants?.some((v) => v.color) && (
          <div className="border-t border-b border-[#00000080] mt-2">
            <div className="flex flex-col gap-3">
              <span className="text-lg font-medium pt-3">Colors</span>
              <div>
                <ColorPicker variants={productData?.complete?.product?.variants || []} />
              </div>
            </div>
          </div>
        )}

        {/* Size Section - Only show if there are size variants */}
        {productData?.complete?.product?.variants?.some((v) => v.size) && (
          <div className="border-b border-[#00000080]">
            <div className="flex flex-col gap-3">
              <span className="text-lg font-medium pt-3">Size</span>
              <div>
                <SizePicker variants={productData?.complete?.product?.variants || []} />
              </div>
            </div>
          </div>
        )}

        {/* Subtotal and Counter */}
        <div className="mt-4 flex flex-row justify-between border-b border-[#00000080] pb-3">
          <div className="flex flex-col py-4">
            <span className="text-[#00000080] text-sm">Subtotal</span>
            <span className="text-[#E53E3E] font-bold text-lg">
              ₦{((parseFloat(productData?.complete?.product?.discount_price || productData?.complete?.product?.price || '0') * quantity).toFixed(2))}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="w-13 h-13 bg-[#E53E3E] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (quantity > 1) {
                  setQuantity(quantity - 1);
                }
              }}
              disabled={quantity <= 1}
            >
              <span className="text-xl font-bold">−</span>
            </button>

            <span className="text-[#E53E3E] font-bold text-2xl min-w-[40px] text-center">
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

        {/* Contact Buttons */}
        <div className="mt-5">
          <div className="flex flex-row justify-between">
            <div className="p-3 rounded-2xl border border-[#CACACA] cursor-pointer">
              <img className="w-7 h-7" src={images.whatsapp} alt="" />
            </div>
            <div className="p-3 rounded-2xl border border-[#CACACA] cursor-pointer">
              <img className="w-7 h-7" src={images.call} alt="" />
            </div>
            <div className="p-3 rounded-2xl border border-[#CACACA] cursor-pointer">
              <img className="w-7 h-7" src={images.chat} alt="" />
            </div>
            <div>
              <button 
                onClick={() => setIsPhoneRevealed(!isPhoneRevealed)}
                className="bg-[#000000] rounded-2xl text-white px-13 py-3.5 cursor-pointer"
              >
                {isPhoneRevealed 
                  ? (productData?.complete?.store?.store_phone || 'Phone: N/A')
                  : 'Reveal Phone Number'
                }
              </button>
            </div>
          </div>
          <div className="mt-3">
            <button className="bg-[#E53E3E] rounded-2xl text-white w-full py-3.5 cursor-pointer">
              Checkout
            </button>
          </div>
        </div>

        {/* Store Details */}
        <div className="mt-5">
          <span className="text-lg font-medium">Store Details</span>
          <div>
            <div
              className="rounded-2xl w-full mt-5"
              style={{
                boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="space-y-4">
                {/* Store Card */}
                <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                  {/* Cover Image with Avatar */}
                    <div className="relative h-30">
                      <img
                        src={productData?.complete?.store?.banner_image 
                          ? `https://colala.hmstech.xyz/storage/${productData.complete.store.banner_image}` 
                          : images.cover
                        }
                        alt="Store cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = images.cover;
                        }}
                      />
                      {/* Store Avatar positioned over cover */}
                      <div className="absolute -bottom-8 left-4">
                        <img
                          src={productData?.complete?.store?.profile_image 
                            ? `https://colala.hmstech.xyz/storage/${productData.complete.store.profile_image}` 
                            : images.icon
                          }
                          alt="Store profile"
                          className="w-18 h-18 rounded-full object-cover shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = images.icon;
                          }}
                        />
                      </div>
                    </div>

                  {/* Content */}
                  <div className="pt-10 pb-4 px-4">
                    {/* Store Name and Rating */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="flex items-end justify-between font-semibold -mt-14 ml-20 mb-1">
                        {productData?.complete?.store?.store_name || 'Store Name'}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <span className="">
                          <img src={images.start1} alt="" />
                        </span>
                        <span className="text-sm text-[#00000080] font-medium">
                          {productData?.complete?.store?.average_rating || '0.0'}
                        </span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center space-x-2 ml-18 -mt-8 mb-3">
                      <span className="bg-[#0000FF33] text-[#0000FF] px-2 py-1 rounded-lg text-xs font-medium border border-[#0000FF]">
                        Electronics
                      </span>
                      <span className="bg-[#FF000033] text-[#FF0000] px-2 py-1 rounded-lg text-xs font-medium border border-[#FF0000]">
                        Phones
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-1 mb-4">
                      <img
                        src={images.location}
                        alt="location"
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[#00000080]">
                        {productData?.complete?.store?.store_location || 'Location'}
                      </span>
                    </div>

                    {/* Social Media Icons */}
                    <div className="flex items-center mb-6 border rounded-lg border-[#CDCDCD] p-1.5 space-x-1">
                      <button className="cursor-pointer">
                        <img
                          src={images.whatsapp1}
                          alt="whatsapp"
                          className="w-15 h-15"
                        />
                      </button>
                      <button className="cursor-pointer">
                        <img
                          src={images.insta}
                          alt="instagram"
                          className="w-15 h-15"
                        />
                      </button>
                      <button className="cursor-pointer">
                        <img
                          src={images.x}
                          alt="twitter"
                          className="w-15 h-15"
                        />
                      </button>
                      <button className="cursor-pointer">
                        <img
                          src={images.facebook}
                          alt="facebook"
                          className="w-15 h-15"
                        />
                      </button>
                    </div>

                    {/* Store Stats and Visit Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-row">
                        <div className="flex flex-row gap-2 border-r border-[#CDCDCD] pr-7">
                          <div>
                            <img
                              src={images.shop}
                              alt="shop"
                              className="w-10 h-10"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#00000080]">
                              Products
                            </span>
                            <span className="text-[20px] text-[#000000]">
                              100
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 border-r border-[#CDCDCD] pr-7 ml-5">
                          <div>
                            <img
                              src={images.category}
                              alt="shop"
                              className="w-10 h-10"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#00000080]">
                              Categories
                            </span>
                            <span className="text-[20px] text-[#000000]">
                              5
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="bg-[#E53E3E] rounded-lg px-7 py-2 text-white cursor-pointer">
                        Go to Shop
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// const ProductOverviewComponent = ProductOverview;
export default ProductOverview;
