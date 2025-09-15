import images from "../../../constants/images";
import PageHeader from "../../../components/PageHeader";
import ReferralTable from "./referraltable";
import ReferralFilters from "./referralfilters";

const AllReferral = () => {
  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Referral:", action);
    // Add your custom logic here
  };

  return (
    <>
      <PageHeader title=" Referrals" />
      <div className="p-5">
        <div className="flex flex-row justify-between items-center">
          {/* Card 1 */}
          <div
            className="flex flex-row rounded-2xl  w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.referralmgt} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Total Referrals</span>
              <span className="font-semibold text-2xl">10</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 2 */}

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.referralmgt} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">Buyers referred</span>
              <span className="font-semibold text-2xl">2</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>

          {/* Card 3 */}

          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
              <img className="w-9 h-9" src={images.referralmgt} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                Sellers referred
              </span>
              <span className="font-semibold text-2xl">0</span>
              <span className="text-[#00000080] text-[13px] ">
                <span className="text-[#1DB61D]">+5%</span> increase from last
                month
              </span>
            </div>
          </div>
        </div>
            <ReferralFilters onBulkActionSelect={handleBulkActionSelect} />
        <ReferralTable
          onRowSelect={(selectedIds) =>
            console.log("Selected referrals:", selectedIds)
          }
        />
      </div>
    </>
  );
};

export default AllReferral;
