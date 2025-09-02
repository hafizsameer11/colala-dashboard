const Description = () => {
  return (
    <div className="mt-5 max-w-md mx-auto bg-white">
      {/* Product Name Section */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-[#00000080] mb-2">
          Product Name
        </h3>
        <h2 className="text-lg font-semibold text-[#000000]">
          Iphone 12 pro max
        </h2>
      </div>

      {/* Description Section */}
      <div className="mb-5 border-t border-b border-[#00000080] pt-3 pb-3">
        <h3 className="text-sm font-medium text-[#00000080] mb-2">
          Description
        </h3>
        <p className="text-[#000000] text-lg font-semibold leading-relaxed">
          Very clean iphone 12 pro max, out of the box, factory unlocked
        </p>
      </div>

      {/* Other Details Section */}
      <div>
        <h3 className="text-sm font-medium text-[#00000080] mb-4">
          Other Details
        </h3>

        <div className="space-y-1 w-60">
          {/* Brand */}
          <div className="flex justify-between items-center py-1 ">
            <span className="text-md text-[#000000B2] font-semibold">
              Brand
            </span>
            <span className="text-md font-medium text-[#000000]">Apple</span>
          </div>

          {/* Model */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Model
            </span>
            <span className="text-md font-medium text-[#000000]">
              12 pro Max
            </span>
          </div>

          {/* Color */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Color
            </span>
            <span className="text-md font-medium text-[#000000]">Black</span>
          </div>

          {/* Storage */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Storage
            </span>
            <span className="text-md font-medium text-[#000000]">64 gig</span>
          </div>

          {/* Resolution */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Resolution
            </span>
            <span className="text-md font-medium text-[#000000]">
              1080 x 1920
            </span>
          </div>

          {/* Display */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Display
            </span>
            <span className="text-md font-medium text-[#000000]">IPS LCD</span>
          </div>

          {/* Screen size */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Screen size
            </span>
            <span className="text-md font-medium text-[#000000]">6.5</span>
          </div>

          {/* Battery */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Battery
            </span>
            <span className="text-md font-medium text-[#000000]">3000 mah</span>
          </div>

          {/* Sim */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">Sim</span>
            <span className="text-md font-medium text-[#000000]">Nanosim</span>
          </div>

          {/* Camera */}
          <div className="flex justify-between items-center py-1">
            <span className="text-md text-[#000000B2] font-semibold">
              Camera
            </span>
            <span className="text-md font-medium text-[#000000]">
              20 mega pixel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Description;
