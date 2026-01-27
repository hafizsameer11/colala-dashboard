import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LinkComp from "./components/Link";
import { Sidebar_links } from "../constants/siderbar";
import { Buyers_links } from "../constants/Buyers";
import { Sellers_links } from "../constants/Sellers";
import { General_links } from "../constants/general";
import images from "../constants/images";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/permissions";

interface SidebarProps {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, permissions, roles } = useAuth();
  const [activeLink, setActiveLink] = useState<string>("/dashboard");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  // Filter menu items based on permissions (admin/super_admin have all permissions)
  const filteredSidebarLinks = useMemo(() => {
    // Get role slugs to check if user is an account officer
    const roleSlugs = roles.map(r => r.slug);
    const isAccountOfficer = roleSlugs.includes('account_officer');
    
    return Sidebar_links.filter((link) => {
      // Hide Dashboard from account officers
      if (isAccountOfficer && link.link === "/dashboard") {
        return false;
      }
      
      if (!link.permission) return true; // Show if no permission required
      return hasPermission(permissions, link.permission, roles);
    });
  }, [permissions, roles]);

  const filteredBuyerLinks = useMemo(() => {
    return Buyers_links.filter((link) => {
      if (!link.permission) return true;
      return hasPermission(permissions, link.permission, roles);
    });
  }, [permissions, roles]);

  const filteredSellerLinks = useMemo(() => {
    return Sellers_links.filter((link) => {
      if (!link.permission) return true;
      return hasPermission(permissions, link.permission, roles);
    });
  }, [permissions, roles]);

  const filteredGeneralLinks = useMemo(() => {
    // Get role slugs to check if user is an account officer
    const roleSlugs = roles.map(r => r.slug);
    const isAccountOfficer = roleSlugs.includes('account_officer');
    
    return General_links.filter((link) => {
      // Hide "Account Officer Vendors" from account officers themselves
      if (isAccountOfficer && link.link === "/account-officer-vendors") {
        return false;
      }
      
      if (!link.permission) return true;
      return hasPermission(permissions, link.permission, roles);
    });
  }, [permissions, roles]);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login page after logout
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate to login page even if logout API fails
      navigate("/login", { replace: true });
    }
  };

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
          <img src={images.logo} alt="logo" className="w-60 h-auto" />
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
          {filteredSidebarLinks.map((x, index) => (
            <li key={index}>
              <LinkComp
                name={x.name}
                link={x.link}
                icon={x.icon}
                sub={x.sublinks}
                isActiveCheck={activeLink === x.link}
                onClick={() => {
                  setActiveLink(x.link);
                  setMobileOpen(false); // Close mobile menu on navigation
                }}
                menuStatus={menuOpen}
              />
            </li>
          ))}
        </ul>

        {filteredBuyerLinks.length > 0 && (
          <>
            <div className="flex flex-row justify-center items-center pl-10 mt-5 mb-5">
              <h1 className="text-[14px] text-white">BUYERS MGT</h1>
              <div className="bg-white border border-white w-[64.5%] ml-0.5"></div>
            </div>
            <ul className="space-y-2">
              {filteredBuyerLinks.map((x, index) => (
                <li key={index}>
                  <LinkComp
                    name={x.name}
                    link={x.link}
                    icon={x.icon}
                    sub={x.sublinks}
                    isActiveCheck={activeLink === x.link}
                    onClick={() => {
                      setActiveLink(x.link);
                      setMobileOpen(false); // Close mobile menu on navigation
                    }}
                    menuStatus={menuOpen}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {filteredSellerLinks.length > 0 && (
          <>
            <div className="flex flex-row justify-center items-center pl-10 mt-5 mb-5">
              <h1 className="text-[14px] text-white">SELLERS MGT</h1>
              <div className="bg-white border border-white w-[63.5%] ml-0.5"></div>
            </div>
            <ul className="space-y-2">
              {filteredSellerLinks.map((x, index) => (
                <li key={index}>
                  <LinkComp
                    name={x.name}
                    link={x.link}
                    icon={x.icon}
                    sub={x.sublinks}
                    isActiveCheck={activeLink === x.link}
                    onClick={() => {
                      setActiveLink(x.link);
                      setMobileOpen(false); // Close mobile menu on navigation
                    }}
                    menuStatus={menuOpen}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {filteredGeneralLinks.length > 0 && (
          <>
            <div className="flex flex-row justify-center items-center pl-10 mt-5 mb-5">
              <h1 className="text-[14px] text-white">GENERAL</h1>
              <div className="bg-white border border-white w-[75.5%] ml-0.5"></div>
            </div>

            <ul className="space-y-2">
              {filteredGeneralLinks.map((x, index) => (
                <li key={index}>
                  <LinkComp
                    name={x.name}
                    link={x.link}
                    icon={x.icon}
                    sub={x.sublinks}
                    isActiveCheck={activeLink === x.link}
                    onClick={() => {
                      setActiveLink(x.link);
                      setMobileOpen(false); // Close mobile menu on navigation
                    }}
                    menuStatus={menuOpen}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Logout Button */}
      <div className=" mx-4 mt-2 flex items-center justify-center">
        <button
          onClick={handleLogout}
          className="flex items-center p-2 cursor-pointer gap-2 text-[#FF0000] text-[16px] rounded-lg w-full  transition-colors"
        >
          <img src={images.logout} alt="logout" className="w-6 h-6" />
          {!menuOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
