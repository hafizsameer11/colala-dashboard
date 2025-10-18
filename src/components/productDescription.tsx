interface ProductDescriptionProps {
  productData?: any;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ productData }) => {
  return (
    <div className="mt-5 max-w-md mx-auto bg-white">
      {/* Product Name Section */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-[#00000080] mb-2">Product Name</h3>
        <h2 className="text-lg font-semibold text-[#000000]">
          {productData?.complete?.product?.name || 'Product Name'}
        </h2>
      </div>

      {/* Description Section */}
      <div className="mb-5 border-t border-b border-[#00000080] pt-3 pb-3">
        <h3 className="text-sm font-medium text-[#00000080] mb-2">Description</h3>
        <p className="text-[#000000] text-lg font-semibold leading-relaxed">
          {productData?.complete?.product?.description || 'No description available'}
        </p>
      </div>

      {/* Other Details Section */}
      <div>
        <h3 className="text-sm font-medium text-[#00000080] mb-4">
          Other Details
        </h3>

        <div className="space-y-1 w-60">
          {/* Product ID */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Product ID</span>
            <span className="text-md font-medium text-[#000000]">
              {productData?.complete?.product?.id || 'N/A'}
            </span>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Price</span>
            <span className="text-md font-medium text-[#000000]">
              ₦{productData?.complete?.product?.price || '0.00'}
            </span>
          </div>

          {/* Discount Price */}
          {productData?.complete?.product?.discount_price && (
            <div className="flex justify-between items-center py-1">
              <span className="text-md text-[#000000B2] font-semibold">Discount Price</span>
              <span className="text-md font-medium text-[#E53E3E]">
                ₦{productData.complete.product.discount_price}
              </span>
            </div>
          )}

          {/* Status */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Status</span>
            <span className="text-md font-medium text-[#000000] capitalize">
              {productData?.complete?.product?.status || 'N/A'}
            </span>
          </div>

          {/* Quantity Available */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Available</span>
            <span className="text-md font-medium text-[#000000]">
              {productData?.complete?.product?.quantity || '0'} units
            </span>
          </div>

          {/* Featured */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Featured</span>
            <span className="text-md font-medium text-[#000000]">
              {productData?.complete?.product?.is_featured ? 'Yes' : 'No'}
            </span>
          </div>

          {/* Created Date */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Created</span>
            <span className="text-md font-medium text-[#000000]">
              {productData?.complete?.product?.created_at 
                ? new Date(productData.complete.product.created_at).toLocaleDateString() 
                : 'N/A'
              }
            </span>
          </div>

          {/* Store Name */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Store</span>
            <span className="text-md font-medium text-[#000000]">
              {productData?.complete?.store?.store_name || 'N/A'}
            </span>
          </div>

          {/* Store Location */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Location</span>
            <span className="text-md font-medium text-[#000000]">
              {productData?.complete?.store?.store_location || 'N/A'}
            </span>
          </div>

          {/* Store Rating */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Store Rating</span>
            <span className="text-md font-medium text-[#000000]">
              {productData?.complete?.store?.average_rating || '0.0'} ⭐
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
