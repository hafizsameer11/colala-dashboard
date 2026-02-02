interface DescriptionProps {
  productInfo?: any;
  variants?: any[];
}

const Description: React.FC<DescriptionProps> = ({ productInfo, variants = [] }) => {
  return (
    <div className="mt-5 max-w-md mx-auto bg-white">
      {/* Product Name Section */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-[#00000080] mb-2">
          Product Name
        </h3>
        <h2 className="text-lg font-semibold text-[#000000]">
          {productInfo?.name || "Product Name"}
        </h2>
      </div>

      {/* Description Section */}
      <div className="mb-5 border-t border-b border-[#00000080] pt-3 pb-3">
        <h3 className="text-sm font-medium text-[#00000080] mb-2">
          Description
        </h3>
        <p className="text-[#000000] text-lg font-semibold leading-relaxed">
          {productInfo?.description || "No description available"}
        </p>
      </div>

      {/* Information Tags Section */}
      {(productInfo?.tag1 || productInfo?.tag2 || productInfo?.tag3) && (
        <div className="mb-5">
          <h3 className="text-sm font-medium text-[#00000080] mb-2">
            Information Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {productInfo?.tag1 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FFF5E5] text-[#D97706] border border-[#FBBF24]">
                {productInfo.tag1}
              </span>
            )}
            {productInfo?.tag2 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E0F2FE] text-[#0369A1] border border-[#38BDF8]">
                {productInfo.tag2}
              </span>
            )}
            {productInfo?.tag3 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF3] text-[#15803D] border border-[#4ADE80]">
                {productInfo.tag3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Variant Details Section - Only show if variants exist */}
      {variants && variants.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#00000080] mb-4">
            Variant Details
          </h3>

          <div className="space-y-1 w-60">
            {variants.map((variant, index) => (
              <div key={index} className="space-y-2">
                {variant.color && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-md text-[#000000B2] font-semibold">
                      Color
                    </span>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: variant.color }}
                      ></span>
                      <span className="text-md font-medium text-[#000000]">
                        {variant.color}
                      </span>
                    </div>
                  </div>
                )}
                
                {variant.size && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-md text-[#000000B2] font-semibold">
                      Size
                    </span>
                    <span className="text-md font-medium text-[#000000]">
                      {variant.size}
                    </span>
                  </div>
                )}
                
                {variant.price && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-md text-[#000000B2] font-semibold">
                      Price
                    </span>
                    <span className="text-md font-medium text-[#000000]">
                      ₦{parseFloat(variant.price).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {variant.stock !== undefined && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-md text-[#000000B2] font-semibold">
                      Stock
                    </span>
                    <span className="text-md font-medium text-[#000000]">
                      {variant.stock}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Description;
