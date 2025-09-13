import React, { useState, useEffect } from "react";
import images from "../../../constants/images";

interface Admin {
  id: string;
  name: string;
  avatar: string;
  role: string;
  dateJoined: string;
  status: "active" | "inactive";
  email?: string;
  location?: string;
  lastLogin?: string;
}

interface ManagementSettingTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  onAdminDetails?: (admin: Admin) => void;
  newAdmin?: {
    name: string;
    email: string;
    password: string;
    role: string;
  } | null;
}

const ManagementSettingTable: React.FC<ManagementSettingTableProps> = ({
  onRowSelect,
  onAdminDetails,
  newAdmin,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Initial admin data
  const initialAdmins: Admin[] = [
    {
      id: "1",
      name: "Qamardeen Malik",
      avatar: images.admin,
      role: "Owner",
      dateJoined: "10/08/25 - 07:21 AM",
      status: "active",
      email: "qamardeen@admingmail.com",
      location: "Lagos, Nigeria",
      lastLogin: "23/02/25 - 11:22 AM",
    },
    {
      id: "2",
      name: "Cynthia Uwak",
      avatar: images.sasha,
      role: "Admin",
      dateJoined: "22/08/25 - 08:22 AM",
      status: "active",
      email: "cynthia@admingmail.com",
      location: "Abuja, Nigeria",
      lastLogin: "22/10/25 - 07:22 AM",
    },
    {
      id: "3",
      name: "Karen Minty",
      avatar: images.bella,
      role: "Admin",
      dateJoined: "22/08/25 - 08:22 AM",
      status: "active",
      email: "karen@admingmail.com",
      location: "Port Harcourt, Nigeria",
      lastLogin: "21/10/25 - 09:15 AM",
    },
    {
      id: "4",
      name: "Adesola Kamil",
      avatar: images.jennifer,
      role: "Admin",
      dateJoined: "22/08/25 - 08:22 AM",
      status: "active",
      email: "adesola@admingmail.com",
      location: "Kano, Nigeria",
      lastLogin: "20/10/25 - 14:30 PM",
    },
  ];

  // Load admins from localStorage on component mount
  useEffect(() => {
    const savedAdmins = localStorage.getItem("adminsList");
    if (savedAdmins) {
      setAdmins(JSON.parse(savedAdmins));
    } else {
      setAdmins(initialAdmins);
      localStorage.setItem("adminsList", JSON.stringify(initialAdmins));
    }
  }, []);

  // Add new admin when newAdmin prop changes
  useEffect(() => {
    if (newAdmin) {
      const getCurrentDateTime = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = now.getHours() >= 12 ? "PM" : "AM";
        const displayHours = now.getHours() % 12 || 12;

        return `${day}/${month}/${year} - ${String(displayHours).padStart(
          2,
          "0"
        )}:${minutes} ${ampm}`;
      };

      // Get a random avatar for new admin
      const avatars = [
        images.admin,
        images.sasha,
        images.bella,
        images.jennifer,
        images.tom,
        images.emma,
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      const newAdminData: Admin = {
        id: Date.now().toString(),
        name: newAdmin.name,
        avatar: randomAvatar,
        role: newAdmin.role,
        dateJoined: getCurrentDateTime(),
        status: "active",
      };

      setAdmins((prevAdmins) => {
        const updatedAdmins = [...prevAdmins, newAdminData];
        localStorage.setItem("adminsList", JSON.stringify(updatedAdmins));
        return updatedAdmins;
      });
    }
  }, [newAdmin]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(admins.map((admin) => admin.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(selectAll ? [] : admins.map((admin) => admin.id));
    }
  };

  const handleRowSelect = (adminId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(adminId)) {
      newSelectedRows = selectedRows.filter((id) => id !== adminId);
    } else {
      newSelectedRows = [...selectedRows, adminId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === admins.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  const handleAdminDetails = (admin: Admin) => {
    if (onAdminDetails) {
      onAdminDetails(admin);
    }
  };

  const handleEdit = (admin: Admin) => {
    console.log("Edit clicked for:", admin.name);
    // Add your edit logic here
  };

  const handleDelete = (admin: Admin) => {
    if (admin.role === "Owner") {
      alert("Cannot delete the owner account");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
      setAdmins((prevAdmins) => {
        const updatedAdmins = prevAdmins.filter((a) => a.id !== admin.id);
        localStorage.setItem("adminsList", JSON.stringify(updatedAdmins));
        return updatedAdmins;
      });

      // Remove from selected rows if it was selected
      setSelectedRows((prev) => prev.filter((id) => id !== admin.id));
    }
  };

  const StatusIndicator = ({ status }: { status: "active" | "inactive" }) => (
    <div className="flex items-center justify-center">
      <div
        className={`w-5 h-5 rounded-full ${
          status === "active" ? "bg-[#008000]" : "bg-red-500"
        }`}
      />
    </div>
  );

  return (
    <div className="border border-[#989898] rounded-2xl w-full mt-4 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Admins
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-semibold text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">User Name</th>
              <th className="text-left p-3 font-normal">Role</th>
              <th className="text-left p-3 font-normal">Date Joined</th>
              <th className="text-center p-3 font-normal">Status</th>
              <th className="text-center p-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr
                key={admin.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === admins.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(admin.id)}
                    onChange={() => handleRowSelect(admin.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-[12px] text-black font-medium">
                      {admin.name}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-black">{admin.role}</td>
                <td className="p-4 text-black">{admin.dateJoined}</td>
                <td className="p-4">
                  <StatusIndicator status={admin.status} />
                </td>
                <td className="p-4">
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => handleAdminDetails(admin)}
                      className="px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F] text-sm"
                    >
                      Admin Details
                    </button>
                    <button
                      onClick={() => handleEdit(admin)}
                      className="p-2 cursor-pointer rounded-lg border border-[#E5E5E5]  transition-colors"
                    >
                      <img src={images.edit1} alt="Edit" className="w-5 h-5" />
                    </button>
                    {admin.role !== "Owner" && (
                      <button
                        onClick={() => handleDelete(admin)}
                        className="p-2 cursor-pointer rounded-lg border border-[#E5E5E5]  transition-colors"
                      >
                        <img
                          src={images.delete1}
                          alt="Delete"
                          className="w-5 h-5"
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagementSettingTable;
