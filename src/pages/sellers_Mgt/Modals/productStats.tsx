interface ProductStatsProps {
  statistics?: {
    views: number;
    impressions: number;
    clicks: number;
    chats: number;
    phone_views: number;
    total_engagement: number;
    average_rating: number;
    total_reviews: number;
    boost_count: number;
    active_boost: boolean;
  };
}

const ProductStats: React.FC<ProductStatsProps> = ({ statistics }) => {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row justify-between gap-3">
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Views</div>
            <div className="font-bold text-lg">{statistics?.views ?? 0}</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Impressions</div>
            <div className="font-bold text-lg">{statistics?.impressions ?? 0}</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Clicks</div>
            <div className="font-bold text-lg">{statistics?.clicks ?? 0}</div>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-3">
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Phone Views</div>
            <div className="font-bold text-lg">{statistics?.phone_views ?? 0}</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Total Engagement</div>
            <div className="font-bold text-lg">{statistics?.total_engagement ?? 0}</div>
          </div>
          <div className="flex flex-col border border-[#989898] rounded-xl items-center justify-center gap-2 py-3 px-4 flex-1 min-h-[80px]">
            <div className="text-[#000000B2] text-sm">Chats</div>
            <div className="font-bold text-lg">{statistics?.chats ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;
