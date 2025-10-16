import images from "../../../constants/images";
import PageHeader from "../../../components/PageHeader";
import ReferralTable from "./components/referraltable";
import { useQuery } from "@tanstack/react-query";
import { getReferrals } from "../../../utils/queries/referrals";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useState } from "react";

const AllReferral = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch referrals data
  const { data: referralsData, isLoading, error } = useQuery({
    queryKey: ['referrals', currentPage],
    queryFn: () => getReferrals(currentPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <>
      <PageHeader title="Referrals" />
      <div className="p-5">
        {/* Statistics Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            <p>Error loading referral statistics</p>
            {error.message === 'No authentication token found' ? (
              <p className="text-sm mt-2">Please log in to view referral data</p>
            ) : (
              <p className="text-sm mt-2">Error details: {error.message}</p>
            )}
          </div>
        ) : referralsData?.data ? (
          <StatCardGrid columns={3}>
            <StatCard 
              icon={images.referralmgt} 
              title="Total Referrals" 
              value={referralsData.data.statistics?.total_referred || 0} 
              subtitle="All referred users" 
            />
            <StatCard 
              icon={images.referralmgt} 
              title="Buyers Referred" 
              value={referralsData.data.statistics?.total_referred - (referralsData.data.statistics?.sellers_referred || 0) || 0} 
              subtitle="Buyer referrals" 
            />
            <StatCard 
              icon={images.referralmgt} 
              title="Sellers Referred" 
              value={referralsData.data.statistics?.sellers_referred || 0} 
              subtitle="Seller referrals" 
            />
          </StatCardGrid>
        ) : null}

        <ReferralTable 
          referralsData={referralsData}
          isLoading={isLoading}
          error={error}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
};

export default AllReferral;
