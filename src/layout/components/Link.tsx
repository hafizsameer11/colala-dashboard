import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface SubLink {
  name: string;
  link: string;
  icon: string;
}

interface LinkCompProps {
  name: string;
  link: string;
  sub?: SubLink[];
  isActiveCheck: boolean;
  icon: string;
  onClick: () => void;
  menuStatus: boolean;
}

const LinkComp: React.FC<LinkCompProps> = ({
  name,
  link,
  sub = [],
  isActiveCheck,
  icon,
  onClick,
  menuStatus,
}) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState<boolean>(isActiveCheck);

  useEffect(() => {
    setIsActive(
      location.pathname.split("/")[1] === link.split("/")[1] ||
        sub.some(
          (item) =>
            location.pathname === item.link ||
            location.pathname.split("/")[1] === link.split("/")[1]
        )
    );
  }, [location.pathname, link, sub]);

  return (
    <div className="relative group">
      {/* Red side border on active or hover */}
      <div
        className={`absolute left-[-10px] top-1/2 h-[50%] bg-[#E53E3E] w-1 rounded transform -translate-y-1/2 transition-opacity duration-200
          ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      ></div>

      <Link
        to={link}
        onClick={onClick}
        className={`flex items-center py-5 rounded-2xl transition-all duration-200 mx-4 relative pl-3 text-[20px]
          ${
            isActive
              ? "bg-[#E53E3E] text-white"
              : "text-[#FFFFFF80] hover:bg-[#ff5757] hover:text-white font-normal"
          }`}
      >
        <img
          src={icon}
          alt={`${name} icon`}
          className={`w-6 h-6 transition duration-200 filter
            ${
              isActive
                ? "invert brightness-0"
                : "opacity-50 group-hover:invert group-hover:brightness-0 group-hover:opacity-100"
            }`}
        />

        <div
          className={`absolute left-[-10px] top-1/2 h-[50%] bg-[#E53E3E] w-1 rounded hidden transform -translate-y-1/2 ${
            isActive ? "block" : "group-hover:block"
          }`}
        ></div>

        {!menuStatus && <span className="font-medium ml-2">{name}</span>}
      </Link>
    </div>
  );
};

export default LinkComp;
