const ProductStats = () => {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row justify-between gap-3">
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Views</div>
            <div className="font-bold text-lg">2,500</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Impressions</div>
            <div className="font-bold text-lg">2,500</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Visitors</div>
            <div className="font-bold text-lg">2,500</div>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-3">
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Chats</div>
            <div className="font-bold text-lg">2,500</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Reviews</div>
            <div className="font-bold text-lg">2,500</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Completed Orders</div>
            <div className="font-bold text-lg">2,500</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;
