import React from 'react';

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  iconBgColor?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  iconBgColor = "#E53E3E",
  className = ""
}) => {
  return (
    <div
      className={`flex flex-row rounded-2xl flex-1 ${className}`}
      style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <div 
        className="rounded-l-2xl p-4 flex justify-center items-center w-16 flex-shrink-0"
        style={{ backgroundColor: iconBgColor }}
      >
        <img className="w-6 h-6 filter brightness-0 invert" src={icon} alt="" />
      </div>
      <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-4 justify-center flex-1">
        <span className="font-semibold text-sm text-gray-700 mb-1">
          {title}
        </span>
        <span className="font-bold text-2xl text-gray-900">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
