import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LinkComp from "./components/Link";
import { Sidebar_links } from "../constants/siderbar";
import { Buyers_links } from "../constants/Buyers";
import { Sellers_links } from "../constants/Sellers";
import { General_links } from "../constants/general";
import images from "../constants/images";

interface SidebarProps {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setMobileOpen }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState<string>("/dashboard");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  return (
    <div
      className={`h-screen pb-10 overflow-auto transition-all duration-300 ${
        menuOpen ? "w-[80px]" : "w-[320px]"
      } bg-[#121212] text-white`}
      style={{
        // Adjusting scrollbar styling
        scrollbarWidth: "thin",
        scrollbarColor: "white #000",
      }}
    >
      {/* Mobile Close Button */}
      <div className="flex justify-end lg:hidden p-4">
        <button
          className="text-xl cursor-pointer"
          onClick={() => setMobileOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4">
        <Link to="/dashboard">
          <img src={images.logo} alt="logo" className="w-80 h-auto" />
        </Link>

        {/* Toggle Menu Icon */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 left-4 bg-gray-800 p-2 rounded-md"
          >
            <i className="bi bi-arrow-left-short text-2xl"></i>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="mt-5">
        {/* <h1 className="p-4 text-[20px]" >General</h1> */}
        <ul className="space-y-2">
          {Sidebar_links.map((x, index) => (
            <li key={index}>
              <LinkComp
                name={x.name}
                link={x.link}
                icon={x.icon}
                sub={x.sublinks}
                isActiveCheck={activeLink === x.link}
                onClick={() => setActiveLink(x.link)}
                menuStatus={menuOpen}
              />
            </li>
          ))}
        </ul>

        <div className="flex flex-row justify-center items-center pl-10 mt-5 mb-5">
          <h1 className="text-[16px] text-white">BUYERS MGT</h1>
          <div className="bg-white border border-white w-[64.5%] ml-0.5"></div>
        </div>
        <ul className="space-y-2">
          {Buyers_links.map((x, index) => (
            <li key={index}>
              <LinkComp
                name={x.name}
                link={x.link}
                icon={x.icon}
                sub={x.sublinks}
                isActiveCheck={activeLink === x.link}
                onClick={() => setActiveLink(x.link)}
                menuStatus={menuOpen}
              />
            </li>
          ))}
        </ul>
        <div className="flex flex-row justify-center items-center pl-10 mt-5 mb-5">
          <h1 className="text-[16px] text-white">SELLERS MGT</h1>
          <div className="bg-white border border-white w-[63.5%] ml-0.5"></div>
        </div>
        <ul className="space-y-2">
          {Sellers_links.map((x, index) => (
            <li key={index}>
              <LinkComp
                name={x.name}
                link={x.link}
                icon={x.icon}
                sub={x.sublinks}
                isActiveCheck={activeLink === x.link}
                onClick={() => setActiveLink(x.link)}
                menuStatus={menuOpen}
              />
            </li>
          ))}
        </ul>
        <div className="flex flex-row justify-center items-center pl-10 mt-5 mb-5">
          <h1 className="text-[16px] text-white">GENERAL</h1>
          <div className="bg-white border border-white w-[75.5%] ml-0.5"></div>
        </div>

        <ul className="space-y-2">
          {General_links.map((x, index) => (
            <li key={index}>
              <LinkComp
                name={x.name}
                link={x.link}
                icon={x.icon}
                sub={x.sublinks}
                isActiveCheck={activeLink === x.link}
                onClick={() => setActiveLink(x.link)}
                menuStatus={menuOpen}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className=" mx-4 mt-2 flex items-center justify-center">
        <button className="flex items-center p-2 cursor-pointer gap-2 text-[#FF0000] text-[20px] rounded-lg w-full ">
          <img src={images.logout} alt="logout" className="w-6 h-6" />
          {!menuOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
