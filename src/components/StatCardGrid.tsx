import React from 'react';

interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const StatCardGrid: React.FC<StatCardGridProps> = ({
  children,
  columns = 2,
  className = ""
}) => {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 sm:gap-4 md:gap-5 ${className}`}>
      {children}
    </div>
  );
};

export default StatCardGrid;
