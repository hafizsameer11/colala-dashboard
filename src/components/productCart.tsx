import images from "../constants/images";
import { useState } from "react";

const ProductCart = () => {
  const [quantity1, setQuantity1] = useState(1);
  const [quantity2, setQuantity2] = useState(1);
  const [quantity3, setQuantity3] = useState(1);
  const [quantity4, setQuantity4] = useState(1);
  return (
    <div>
      <div className="flex flex-row gap-2.5">
        <div>
          <img className="w-6 h-6" src={images.tick1} alt="" />
        </div>
        <div
          className="flex flex-col w-full rounded-2xl"
          style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] text-white p-3 text-2xl font-semibold rounded-t-2xl">
            <span>Sasha Stores</span>
          </div>
          <div className="flex flex-col p-3 gap-3">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row ">
                <div>
                  <picture>
                    <img
                      className="w-32 h-32 rounded-l-2xl"
                      src={images.iphone}
                      alt=""
                    />
                  </picture>
                </div>
                <div className="bg-[#F9F9F9] flex flex-col p-2 w-full rounded-r-2xl gap-1">
                  <span className="text-black text-[17px]">
                    Iphone 16 pro max - Black
                  </span>
                  <span className="text-[#E53E3E] font-bold text-[17px]">
                    N2,500,000
                  </span>
                  <div className="flex flex-row gap-15 items-center mt-3">
                    <div className="flex items-center ">
                      <button
                        type="button"
                        className=" cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          if (quantity1 > 1) {
                            setQuantity1(quantity1 - 1);
                          }
                        }}
                        disabled={quantity1 <= 1}
                      >
                        <img className="w-10 h-10" src={images.minus} alt="" />
                      </button>

                      <span className="text-[#E53E3E] font-bold text-2xl min-w-[40px] text-center px-2 py-1 rounded">
                        {quantity1}
                      </span>

                      <button
                        type="button"
                        className=" cursor-pointer  transition-colors"
                        onClick={() => {
                          setQuantity1(quantity1 + 1);
                        }}
                      >
                        <img className="w-10 h-10" src={images.plus} alt="" />
                      </button>
                    </div>
                    <div className="flex flex-row gap-5">
                      <div>
                        <img
                          className="w-7 h-7 cursor-pointer"
                          src={images.edit1}
                          alt=""
                        />
                      </div>
                      <div>
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src={images.delete1}
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row ">
                <div>
                  <picture>
                    <img
                      className="w-32 h-32 rounded-l-2xl"
                      src={images.iphone}
                      alt=""
                    />
                  </picture>
                </div>
                <div className="bg-[#F9F9F9] flex flex-col p-2 w-full rounded-r-2xl gap-1">
                  <span className="text-black text-[17px]">
                    Iphone 16 pro max - Black
                  </span>
                  <span className="text-[#E53E3E] font-bold text-[17px]">
                    N2,500,000
                  </span>
                  <div className="flex flex-row gap-15 items-center mt-3">
                    <div className="flex items-center ">
                      <button
                        type="button"
                        className=" cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          if (quantity2 > 1) {
                            setQuantity2(quantity2 - 1);
                          }
                        }}
                        disabled={quantity2 <= 1}
                      >
                        <img className="w-10 h-10" src={images.minus} alt="" />
                      </button>

                      <span className="text-[#E53E3E] font-bold text-2xl min-w-[40px] text-center px-2 py-1 rounded">
                        {quantity2}
                      </span>

                      <button
                        type="button"
                        className=" cursor-pointer  transition-colors"
                        onClick={() => {
                          setQuantity2(quantity2 + 1);
                        }}
                      >
                        <img className="w-10 h-10" src={images.plus} alt="" />
                      </button>
                    </div>
                    <div className="flex flex-row gap-5">
                      <div>
                        <img
                          className="w-7 h-7 cursor-pointer"
                          src={images.edit1}
                          alt=""
                        />
                      </div>
                      <div>
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src={images.delete1}
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
                <span className="text-[18px]">No of items</span>
                <span className="text-[18px] font-bold">
                  {quantity1 + quantity2}
                </span>
              </div>
              <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
                <span className="text-[18px]">Total</span>
                <span className="text-[18px] text-[#E53E3E] font-bold">
                  N{((quantity1 + quantity2) * 2500000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2.5 mt-5">
        <div>
          <img className="w-6 h-6" src={images.tick1} alt="" />
        </div>
        <div
          className="flex flex-col w-full rounded-2xl"
          style={{ boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] text-white p-3 text-2xl font-semibold rounded-t-2xl">
            <span>Sasha Stores</span>
          </div>
          <div className="flex flex-col p-3 gap-3">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row ">
                <div>
                  <picture>
                    <img
                      className="w-32 h-32 rounded-l-2xl"
                      src={images.iphone}
                      alt=""
                    />
                  </picture>
                </div>
                <div className="bg-[#F9F9F9] flex flex-col p-2 w-full rounded-r-2xl gap-1">
                  <span className="text-black text-[17px]">
                    Iphone 16 pro max - Black
                  </span>
                  <span className="text-[#E53E3E] font-bold text-[17px]">
                    N2,500,000
                  </span>
                  <div className="flex flex-row gap-15 items-center mt-3">
                    <div className="flex items-center ">
                      <button
                        type="button"
                        className=" cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          if (quantity3 > 1) {
                            setQuantity3(quantity3 - 1);
                          }
                        }}
                        disabled={quantity3 <= 1}
                      >
                        <img className="w-10 h-10" src={images.minus} alt="" />
                      </button>

                      <span className="text-[#E53E3E] font-bold text-2xl min-w-[40px] text-center px-2 py-1 rounded">
                        {quantity3}
                      </span>

                      <button
                        type="button"
                        className=" cursor-pointer  transition-colors"
                        onClick={() => {
                          setQuantity3(quantity3 + 1);
                        }}
                      >
                        <img className="w-10 h-10" src={images.plus} alt="" />
                      </button>
                    </div>
                    <div className="flex flex-row gap-5">
                      <div>
                        <img
                          className="w-7 h-7 cursor-pointer"
                          src={images.edit1}
                          alt=""
                        />
                      </div>
                      <div>
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src={images.delete1}
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row ">
                <div>
                  <picture>
                    <img
                      className="w-32 h-32 rounded-l-2xl"
                      src={images.iphone}
                      alt=""
                    />
                  </picture>
                </div>
                <div className="bg-[#F9F9F9] flex flex-col p-2 w-full rounded-r-2xl gap-1">
                  <span className="text-black text-[17px]">
                    Iphone 16 pro max - Black
                  </span>
                  <span className="text-[#E53E3E] font-bold text-[17px]">
                    N2,500,000
                  </span>
                  <div className="flex flex-row gap-15 items-center mt-3">
                    <div className="flex items-center ">
                      <button
                        type="button"
                        className=" cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          if (quantity4 > 1) {
                            setQuantity4(quantity4 - 1);
                          }
                        }}
                        disabled={quantity4 <= 1}
                      >
                        <img className="w-10 h-10" src={images.minus} alt="" />
                      </button>

                      <span className="text-[#E53E3E] font-bold text-2xl min-w-[40px] text-center px-2 py-1 rounded">
                        {quantity4}
                      </span>

                      <button
                        type="button"
                        className=" cursor-pointer  transition-colors"
                        onClick={() => {
                          setQuantity4(quantity4 + 1);
                        }}
                      >
                        <img className="w-10 h-10" src={images.plus} alt="" />
                      </button>
                    </div>
                    <div className="flex flex-row gap-5">
                      <div>
                        <img
                          className="w-7 h-7 cursor-pointer"
                          src={images.edit1}
                          alt=""
                        />
                      </div>
                      <div>
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src={images.delete1}
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
                <span className="text-[18px]">No of items</span>
                <span className="text-[18px] font-bold">
                  {quantity3 + quantity4}
                </span>
              </div>
              <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
                <span className="text-[18px]">Total</span>
                <span className="text-[18px] text-[#E53E3E] font-bold">
                  N{((quantity3 + quantity4) * 2500000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-5">
        <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-t-2xl rounded-b-lg">
          <span className="text-[18px]">No of items</span>
          <span className="text-[18px] font-bold">
            {quantity1 + quantity2 + quantity3 + quantity4}
          </span>
        </div>
        <div className="flex flex-row bg-[#EDEDED] justify-between p-4 rounded-b-2xl rounded-t-lg">
          <span className="text-[18px]">Total</span>
          <span className="text-[18px] text-[#E53E3E] font-bold">
            N
            {(
              (quantity1 + quantity2 + quantity3 + quantity4) *
              2500000
            ).toLocaleString()}
          </span>
        </div>
      </div>

<div className=" mt-5" >
  <button className="bg-[#E53E3E] rounded-2xl cursor-pointer w-full text-white py-4" >
    Checkout
  </button>
</div>

    </div>
  );
};

export default ProductCart;
