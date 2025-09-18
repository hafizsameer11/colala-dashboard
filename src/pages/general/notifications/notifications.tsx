import PageHeader from "../../../components/PageHeader";
import { useState } from "react";
import NotificationsFilters from "./components/notificationsfilters";
import NotificationTable from "./components/notificationtable";
import BannerTable from "./components/bannertable";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("Notification");
  const [search, setSearch] = useState("");

  return (
    <>
      <div>
        <PageHeader title="Notifications" />
        <div className="p-5">
          <NotificationsFilters
            onBulkActionSelect={(a) => console.log("Bulk action:", a)}
            onTabChange={setActiveTab}
            activeTab={activeTab}
            onSearchChange={setSearch} // <- NEW
          />

          {activeTab === "Notification" && (
            <NotificationTable
              searchTerm={search} // <- NEW
              onRowSelect={(ids) => console.log("Selected IDs:", ids)}
            />
          )}

          {activeTab === "Banner" && (
            <BannerTable
              searchTerm={search} // <- NEW
              onRowSelect={(ids) => console.log("Selected IDs:", ids)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
