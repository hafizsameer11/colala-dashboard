import images from "../../../constants/images";

interface NewCouponProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewCoupon: React.FC<NewCouponProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-full overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Coupon</h2>
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="p-2 rounded-md  cursor-pointer"
                  aria-label="Close"
                >
                  <img className="w-7 h-7" src={images.close} alt="Close" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-3.5">
            <div>
              <form action="#">
                <div className="flex flex-col gap-3">
                  <label htmlFor="couponname" className="text-xl font-medium">
                    Coupon Code Name
                  </label>
                  <input
                    type="text"
                    name="couponname"
                    id="couponname"
                    placeholder="Type coupon name"
                    className="w-full rounded-2xl border border-[#989898] p-5"
                  />
                </div>
                <div className="flex flex-col gap-3 mt-5">
                  <label
                    htmlFor="percentageoff"
                    className="text-xl font-medium"
                  >
                    Percentage Off
                  </label>
                  <input
                    type="text"
                    name="percentageoff"
                    id="percentageoff"
                    placeholder="Percentage off %"
                    className="w-full rounded-2xl border border-[#989898] p-5"
                  />
                </div>
                <div className="flex flex-col gap-3 mt-5">
                  <label htmlFor="maximumusage" className="text-xl font-medium">
                    Maximum Usage
                  </label>
                  <input
                    type="text"
                    name="maximumusage"
                    id="maximumusage"
                    placeholder="Type Maximum usage"
                    className="w-full rounded-2xl border border-[#989898] p-5"
                  />
                </div>
                <div className="flex flex-col gap-3 mt-5">
                  <label htmlFor="expirydate" className="text-xl font-medium">
                    Expiry date
                  </label>
                  <input
                    type="date"
                    name="expirydate"
                    id="expirydate"
                    placeholder="Type Maximum usage"
                    className="w-full rounded-2xl border border-[#989898] p-5"
                  />
                </div>
                <div className="mt-5" ><button className="bg-[#E53E3E] w-full py-4 text-white cursor-pointer rounded-2xl" >Save</button></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewCoupon;
