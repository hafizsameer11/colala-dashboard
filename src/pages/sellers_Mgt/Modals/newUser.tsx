import images from "../../../constants/images";
import { useState } from "react";

interface NewUserProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewUser: React.FC<NewUserProps> = ({ isOpen, onClose }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [dropdownStates, setDropdownStates] = useState({
    role: false,
  });
  const [errors, setErrors] = useState({
    role: "",
  });

  const roles = ["Admin", "Manager", "Staff", "Viewer"];

  const toggleDropdown = (dropdownName: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName as keyof typeof prev],
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      role: false,
    });
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    closeAllDropdowns();
    setErrors((prev) => ({ ...prev, role: "" }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
        <div className="bg-white w-[500px] relative h-130 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#787878] px-3 py-3 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New User</h2>
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="p-2 rounded-md  cursor-pointer"
                  aria-label="Close"
                >
                  <img className="w-7 h-7" src={images.close} alt="Close" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-3">
            <form action="#">
              <div className="flex flex-col gap-3">
                <label htmlFor="userEmail" className="text-xl font-medium">
                  User Email Address
                </label>
                <input
                  type="email"
                  name="userEmail"
                  id="userEmail"
                  placeholder="user email"
                  className="w-full rounded-2xl border border-[#989898] p-5"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <label htmlFor="userPassword" className="text-xl font-medium">
                  Password
                </label>
                <input
                  type="password"
                  name="userPassword"
                  id="userPassword"
                  placeholder="user password"
                  className="w-full rounded-2xl border border-[#989898] p-5"
                  required
                />
              </div>

              {/* Role Dropdown */}
              <div className="flex flex-col gap-3 mt-5">
                <label className="text-xl font-medium">Select Role</label>
                <div className="relative">
                  <div
                    className={`flex items-center justify-between w-full p-5 border rounded-2xl cursor-pointer transition-colors ${
                      errors.role ? "border-red-500" : "border-[#989898]"
                    }`}
                    onClick={() => toggleDropdown("role")}
                  >
                    <div
                      className={
                        selectedRole ? "text-black" : "text-[#00000080]"
                      }
                    >
                      {selectedRole || "Select role"}
                    </div>
                    <div
                      className={`transform transition-transform duration-200 ${
                        dropdownStates.role ? "rotate-90" : ""
                      }`}
                    >
                      <img src={images.rightarrow} alt="arrow" />
                    </div>
                  </div>

                  {dropdownStates.role && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#989898] rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                      {roles.map((role, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 cursor-pointer text-lg border-b border-gray-100 last:border-b-0"
                          onClick={() => handleRoleSelect(role)}
                        >
                          {role}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>
              <div className="mt-5">
                <button className="bg-[#E53E3E] text-white cursor-pointer py-4 w-full rounded-2xl">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewUser;
