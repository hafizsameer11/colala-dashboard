import React, { useEffect, useMemo, useState } from "react";
import images from "../../../../constants/images";

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
  searchTerm?: string;
}

const ManagementSettingTable: React.FC<ManagementSettingTableProps> = ({
  onRowSelect,
  onAdminDetails,
  newAdmin,
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState<
    Pick<Admin, "name" | "role" | "status" | "email" | "location">
  >({ name: "", role: "Admin", status: "active", email: "", location: "" });

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

  // Load admins on mount (from localStorage or seed)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adminsList");
      if (saved) {
        const parsed: Admin[] = JSON.parse(saved);
        setAdmins(parsed);
      } else {
        setAdmins(initialAdmins);
        localStorage.setItem("adminsList", JSON.stringify(initialAdmins));
      }
    } catch {
      setAdmins(initialAdmins);
      localStorage.setItem("adminsList", JSON.stringify(initialAdmins));
    }
  }, []);

  // Keep selected rows valid if admins list changes
  useEffect(() => {
    if (selectedRows.length === 0) return;
    const ids = new Set(admins.map((a) => a.id));
    setSelectedRows((prev) => prev.filter((id) => ids.has(id)));
  }, [admins]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add new admin (from parent)
  useEffect(() => {
    if (!newAdmin) return;

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

    // Safe avatar pool
    const avatars = [
      images.admin,
      images.sasha,
      images.bella,
      images.jennifer,
      (images as any).tom,
      (images as any).emma,
    ].filter(Boolean);
    const randomAvatar =
      avatars[Math.floor(Math.random() * avatars.length)] || images.admin;

    const newAdminData: Admin = {
      id: Date.now().toString(),
      name: newAdmin.name,
      avatar: randomAvatar,
      role: newAdmin.role,
      dateJoined: getCurrentDateTime(),
      status: "active",
      email: newAdmin.email,
      location: "—",
    };

    setAdmins((prev) => {
      const updated = [...prev, newAdminData];
      localStorage.setItem("adminsList", JSON.stringify(updated));
      return updated;
    });
  }, [newAdmin]);

  // Filtering (case-insensitive, multiple fields)
  const filteredAdmins = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) => {
      const haystack = [
        a.name,
        a.role,
        a.email,
        a.location,
        a.lastLogin,
        a.dateJoined,
        a.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [admins, searchTerm]);

  // Keep select-all in sync for filtered view
  useEffect(() => {
    const filteredIds = new Set(filteredAdmins.map((a) => a.id));
    const visibleSelected = selectedRows.filter((id) => filteredIds.has(id));
    setSelectAll(
      filteredAdmins.length > 0 &&
        visibleSelected.length === filteredAdmins.length
    );
  }, [filteredAdmins, selectedRows]);

  const handleSelectAll = () => {
    if (selectAll) {
      const filteredIds = new Set(filteredAdmins.map((a) => a.id));
      const remaining = selectedRows.filter((id) => !filteredIds.has(id));
      setSelectedRows(remaining);
      onRowSelect?.(remaining);
      setSelectAll(false);
    } else {
      const allVisible = filteredAdmins.map((a) => a.id);
      const unique = Array.from(new Set([...selectedRows, ...allVisible]));
      setSelectedRows(unique);
      onRowSelect?.(unique);
      setSelectAll(true);
    }
  };

  const handleRowSelect = (adminId: string) => {
    setSelectedRows((prev) => {
      const next = prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId];
      onRowSelect?.(next);
      return next;
    });
  };

  const handleAdminDetails = (admin: Admin) => onAdminDetails?.(admin);

  // ----- DELETE -----
  const handleDelete = (admin: Admin) => {
    if (admin.role === "Owner") {
      alert("Cannot delete the owner account");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${admin.name}?`))
      return;

    setAdmins((prev) => {
      const updated = prev.filter((a) => a.id !== admin.id);
      localStorage.setItem("adminsList", JSON.stringify(updated));
      return updated;
    });
    // Remove from selection if selected
    setSelectedRows((prev) => prev.filter((id) => id !== admin.id));
  };

  // ----- EDIT -----
  const openEdit = (admin: Admin) => {
    setEditing(admin);
    setEditForm({
      name: admin.name,
      role: admin.role,
      status: admin.status,
      email: admin.email || "",
      location: admin.location || "",
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    const updatedAdmin: Admin = {
      ...editing,
      name: editForm.name.trim() || editing.name,
      role: editForm.role as Admin["role"],
      status: editForm.status as Admin["status"],
      email: editForm.email?.trim() || undefined,
      location: editForm.location?.trim() || undefined,
    };

    setAdmins((prev) => {
      const updated = prev.map((a) => (a.id === editing.id ? updatedAdmin : a));
      localStorage.setItem("adminsList", JSON.stringify(updated));
      return updated;
    });

    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

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
                  checked={selectAll && filteredAdmins.length > 0}
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
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin, index) => (
                <tr
                  key={admin.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${
                    index === filteredAdmins.length - 1 ? "" : "border-b"
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
                      <span className=" text-black font-medium">
                        {admin.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-black">{admin.role}</td>
                  <td className="p-4 text-black">{admin.dateJoined}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-5 h-5 rounded-full ${
                          admin.status === "active"
                            ? "bg-[#008000]"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleAdminDetails(admin)}
                        className="px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                      >
                        Admin Details
                      </button>

                      {/* EDIT */}
                      <button
                        onClick={() => openEdit(admin)}
                        className="p-1.5 cursor-pointer rounded transition-colors"
                        title="Edit"
                      >
                        <img
                          src={images.edit1}
                          alt="Edit"
                          className="w-8 h-8 p-1 rounded-lg border border-[#989898]"
                        />
                      </button>

                      {/* DELETE */}
                      {admin.role !== "Owner" && (
                        <button
                          onClick={() => handleDelete(admin)}
                          className="p-1.5 cursor-pointer rounded transition-colors"
                          title="Delete"
                        >
                          <img
                            src={images.delete1}
                            alt="Delete"
                            className="w-8 h-8 p-1 rounded-lg border border-[#989898]"
                          />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Edit Modal --- */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
          onClick={() => cancelEdit()}
        >
          <div
            className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Admin</h3>
              <button
                onClick={cancelEdit}
                className="p-1 rounded-full border cursor-pointer"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        role: e.target.value as Admin["role"],
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                  >
                    <option>Owner</option>
                    <option>Admin</option>
                    <option>Moderator</option>
                    <option>Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        status: e.target.value as Admin["status"],
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    value={editForm.location || ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, location: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-lg bg-[#E53E3E] text-white hover:bg-[#D32F2F] cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementSettingTable;
