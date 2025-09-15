import PageHeader from "../../../components/PageHeader";
import { useState } from "react";
import NotificationsFilters from "./components/notificationsfilters";
import NotificationTable from "./components/notificationtable";
import BannerTable from "./components/bannertable";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("Notification");

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Notifications:", action);
    // Add your custom logic here
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRowSelect = (selectedIds: number[]) => {
    console.log("Selected IDs:", selectedIds);
  };

  return (
    <>
      <div>
        <PageHeader title="Notifications" />
        <div className="p-5" >
          <NotificationsFilters
            onBulkActionSelect={handleBulkActionSelect}
            onTabChange={handleTabChange}
            activeTab={activeTab}
          />

          {/* Conditional content based on active tab */}
          {activeTab === "Notification" && (
            <NotificationTable onRowSelect={handleRowSelect} />
          )}

          {activeTab === "Banner" && (
            <BannerTable onRowSelect={handleRowSelect} />
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
