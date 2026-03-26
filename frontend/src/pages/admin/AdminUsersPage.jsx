/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import api from "../../services/api";

// 1. Accept the 'user' prop passed from App.jsx
function AdminUsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("created_at");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [toast, setToast] = useState(null);
  
  // 2. Define permissions based on your backend logic
  const isStaff = user?.role === "staff";
  const isOwner = user?.role === "owner";
  const canManageUsers = user?.role === "admin"; // Only admins can edit users based on backend middleware

  const [activeTab, setActiveTab] = useState("users");
  const [activityLogs, setActivityLogs] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    status: ""
  });

  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);

  useEffect(() => {
    fetchUsersFromDatabase();
    fetchActivityLogs();
  }, []);

  const fetchUsersFromDatabase = () => {
    setLoading(true);
    api.get("/users")
      .then((response) => {
        setUsers(response.data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to fetch users from database");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchActivityLogs = () => {
    api.get("/activity-logs")
      .then((response) => {
        setActivityLogs(response.data);
      })
      .catch(() => {
        // Activity logs might not be implemented yet, ignore error
      });
  };

  const formatRole = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "owner") return "Owner";
    if (r === "admin") return "Admin";
    if (r === "staff") return "Staff";
    if (r === "customer" || r === "user") return "Customer";
    return role || "";
  };

  const roleToBackend = (uiRole) => {
    const r = (uiRole || "").toLowerCase();
    if (r === "customer") return "user";
    return r;
  };

  const handleRoleChange = (userId, selectedUiRole) => {
    setUpdatingUserId(userId);
    setUpdateError(null);

    api.put(`/users/${userId}`, { role: roleToBackend(selectedUiRole) })
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? res.data : u))
        );
      })
      .catch(() => {
        setUpdateError("Failed to update user role");
      })
      .finally(() => setUpdatingUserId(null));
  };

  const getFilteredAndSortedUsers = () => {
    let filteredUsers = [...users];

    if (filterRole !== "all") {
      filteredUsers = filteredUsers.filter((user) =>
        formatRole(user.role).toLowerCase() === filterRole
      );
    }

    if (filterStatus !== "all") {
      if (filterStatus === "Locked") {
        filteredUsers = filteredUsers.filter((user) => user.is_locked === true);
      } else {
        filteredUsers = filteredUsers.filter((user) => {
          if (user.is_locked) return false; // locked accounts don't appear in Active/Inactive
          const normalizedStatus = (user.status || "").toLowerCase();
          return normalizedStatus === filterStatus.toLowerCase();
        });
      }
    }

    filteredUsers.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === "id") {
        return Number(valueA) - Number(valueB);
      }
      if (sortBy === "created_at") {
        return new Date(valueB) - new Date(valueA);
      }

      if (typeof valueA === "string") {
        return valueA.localeCompare(valueB);
      }

      return valueA - valueB;
    });

    return filteredUsers;
  };

  const handleUnlockUser = (userId) => {
    api.put(`/users/${userId}`, { is_locked: false })
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? res.data : u))
        );
        setShowEditModal(false);
        setToast({ type: "success", message: "Account unlocked successfully" });
        setTimeout(() => setToast(null), 4000);
      })
      .catch(() => {
        setToast({ type: "error", message: "Failed to unlock account" });
        setTimeout(() => setToast(null), 4000);
      });
  };

  const handleDeleteUser = (userId) => {
    api.delete(`/users/${userId}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setShowConfirmDelete(false);
        setShowEditModal(false);
        setToast({ type: "success", message: "User deleted successfully" });
        setTimeout(() => setToast(null), 4000);
      })
      .catch(() => {
        setUpdateError("Failed to delete user");
      });
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email || "",
      password: "",
      confirmPassword: "",
      phone_number: user.phone_number || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      status: user.status || "Active"
    });
    setShowEditModal(true);
  };

  const handleSaveChanges = () => {
    // Validate phone number
    if (editForm.phone_number && !/^\d{11}$/.test(editForm.phone_number.trim())) {
      setToast({ type: "error", message: "Phone number must be exactly 11 digits" });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    // Validate names
    const namePattern = /^[A-Za-z\s\-']{2,50}$/;
    if (!editForm.first_name.trim() || !namePattern.test(editForm.first_name.trim())) {
      setToast({ type: "error", message: "First name must be 2-50 letters only" });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (!editForm.last_name.trim() || !namePattern.test(editForm.last_name.trim())) {
      setToast({ type: "error", message: "Last name must be 2-50 letters only" });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    // Check if email is being changed
    const emailChanged = editForm.email !== selectedUser.email;
    // Check if password is being set
    const passwordChanged = editForm.password && editForm.password.trim() !== "";

    if (emailChanged && !emailOtpSent) {
      // Need to send OTP for email change
      sendEmailOtp();
      return;
    }

    if (passwordChanged && !passwordOtpSent) {
      // Need to send OTP for password change
      sendPasswordOtp();
      return;
    }

    if ((emailChanged && !emailOtp) || (passwordChanged && !passwordOtp)) {
      setToast({ type: "error", message: "Please enter the OTP codes" });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setShowConfirmSave(true);
  };

  const sendEmailOtp = async () => {
    try {
      await api.post(`/users/${selectedUser.id}/email-otp`, { email: editForm.email });
      setEmailOtpSent(true);
      setToast({ type: "success", message: "OTP sent to new email address" });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to send email OTP" });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const sendPasswordOtp = async () => {
    try {
      await api.post(`/users/${selectedUser.id}/password-otp`);
      setPasswordOtpSent(true);
      setToast({ type: "success", message: "OTP sent to user's email" });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to send password OTP" });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const confirmSaveChanges = () => {
    const payload = {
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      phone_number: editForm.phone_number,
      status: editForm.status
    };

    // Only include email if it changed and OTP is provided
    if (editForm.email !== selectedUser.email) {
      payload.email = editForm.email;
      payload.email_otp = emailOtp;
    }

    // Only include password if it's being changed and OTP is provided
    if (editForm.password) {
      payload.password = editForm.password;
      payload.password_otp = passwordOtp;
    }

    api.put(`/users/${selectedUser.id}`, payload)
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? res.data : u))
        );

        setShowConfirmSave(false);
        setShowEditModal(false);

        // Reset OTP states
        setEmailOtp("");
        setEmailOtpSent(false);
        setPasswordOtp("");
        setPasswordOtpSent(false);

        setToast({ type: "success", message: "User updated successfully" });
        setTimeout(() => setToast(null), 4000);
      })
      .catch((err) => {
        setToast({ type: "error", message: err.response?.data?.message || "Failed to update user" });
        setTimeout(() => setToast(null), 4000);
      });
  };

  const handleCreateUser = () => {
    const payload = {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      password: newUser.password,
      role: roleToBackend(newUser.role),
      status: "Active",
    };

    api.post("/users", payload)
      .then((res) => {
        setUsers((prev) => [...prev, res.data]);
        setToast({ type: "success", message: "User created successfully" });
        setNewUser({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          role: "customer",
        });
        setShowCreateModal(false);
        setTimeout(() => setToast(null), 4000);
      })
      .catch((err) => {
        setToast({
          type: "error",
          message: err.response?.data?.message || "Failed to create user",
        });
        setTimeout(() => setToast(null), 4000);
      });
  };

  return (
    <div className="px-10 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-black mb-6">User Management</h1>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium ${
              activeTab === "users"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            User Profiles
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-3 font-medium ${
              activeTab === "logs"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Activity Logs
          </button>
        </div>
      </div>

      {activeTab === "users" && (
        <>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Profiles List</h2>

            {canManageUsers && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-base font-medium rounded-md transition"
              >
                + Add User
              </button>
            )}
          </div>

      <div className="rounded border p-6 shadow-sm bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Profiles list
          </h2>

          <div className="flex space-x-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="px-5 py-2 border rounded text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                Sort By <ChevronDown className="w-4 h-4" />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10">
                  <button
                    onClick={() => { setSortBy("id"); setShowSortMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    ID
                  </button>
                  <button
                    onClick={() => { setSortBy("first_name"); setShowSortMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Name
                  </button>
                  <button
                    onClick={() => { setSortBy("email"); setShowSortMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => { setSortBy("role"); setShowSortMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Role
                  </button>
                  <button
                    onClick={() => { setSortBy("created_at"); setShowSortMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Created Date
                  </button>
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-5 py-2 border rounded text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                Filter By <ChevronDown className="w-4 h-4" />
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-10">
                  <div className="px-4 py-3 border-b">
                    <p className="text-xs font-semibold text-gray-600 mb-2">ROLE</p>
                    <button onClick={() => setFilterRole("all")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">All</button>
                    <button onClick={() => setFilterRole("admin")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">Admin</button>
                    <button onClick={() => setFilterRole("staff")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">Staff</button>
                    <button onClick={() => setFilterRole("customer")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">Customer</button>
                    <button onClick={() => setFilterRole("owner")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">Owner</button>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">STATUS</p>
                    <button onClick={() => setFilterStatus("all")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">All</button>
                    <button onClick={() => setFilterStatus("Active")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">Active</button>
                    <button onClick={() => setFilterStatus("Inactive")} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">Inactive</button>
                    <button
                      onClick={() => setFilterStatus("Locked")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Locked
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-sm uppercase border-b">
                  <th className="pb-4">ID</th>
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Phone</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {getFilteredAndSortedUsers().map((user) => (
                  <tr
                    key={user.id}
                    // 5. Prevent staff from clicking to edit
                    className={`border-b transition ${canManageUsers ? "hover:bg-gray-50 cursor-pointer" : ""}`}
                    onClick={() => canManageUsers && openEditModal(user)}
                  >
                    <td className="py-5">{user.id}</td>
                    <td className="py-5 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-5">{user.email}</td>
                    <td className="py-5">{user.phone_number || "N/A"}</td>
                    <td className="py-5">
                      {/* 6. Lock Role dropdown for staff */}
                      {!canManageUsers ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {formatRole(user.role)}
                        </span>
                      ) : (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          value={formatRole(user.role).toLowerCase()}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingUserId === user.id}
                          className="px-3 py-1 border rounded text-sm bg-white"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      )}
                    </td>
                    <td className="py-5">
                      {(() => {
                        if (user.is_locked) {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 font-semibold">
                              Locked
                            </span>
                          );
                        }
                        const normalizedStatus = (user.status || "").toLowerCase();
                        const isActive = normalizedStatus === "active";
                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-5">
                      {new Date(user.created_at).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {activeTab === "logs" && (
        <div className="rounded border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Activity Logs</h2>

          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity logs available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {activityLogs.map((log, index) => (
                <div key={index} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{log.action}</p>
                      <p className="text-sm text-gray-600">{log.description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{log.user_name}</p>
                      <p>{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showCreateModal && canManageUsers && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-[90%] max-w-md shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Add User</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
              />

              <div>
                <p className="text-sm font-medium mb-3">Role</p>
                <div className="space-y-2 text-sm">
                  {["owner", "admin", "staff", "customer"].map((role) => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={newUser.role === role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="accent-blue-600"
                      />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2 border rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && canManageUsers && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-[90%] max-w-lg shadow-xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit User</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, first_name: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, last_name: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number (11 digits)"
                value={editForm.phone_number}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone_number: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-3 text-sm"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Change Email</h3>
                <input
                  type="email"
                  placeholder="New Email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 text-sm mb-2"
                />

                {editForm.email !== selectedUser.email && !emailOtpSent && (
                  <button
                    onClick={sendEmailOtp}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Send OTP to New Email
                  </button>
                )}

                {emailOtpSent && (
                  <input
                    type="text"
                    placeholder="Enter Email OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                  />
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Change Password</h3>
                <input
                  type="password"
                  placeholder="New Password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 text-sm mb-2"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={editForm.confirmPassword}
                  onChange={(e) =>
                    setEditForm({ ...editForm, confirmPassword: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 text-sm mb-2"
                />

                {editForm.password && !passwordOtpSent && (
                  <button
                    onClick={sendPasswordOtp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Send OTP to Current Email
                  </button>
                )}

                {passwordOtpSent && (
                  <input
                    type="text"
                    placeholder="Enter Password OTP"
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm"
                  />
                )}
              </div>
            </div>


            {/* Unlock banner if locked */}
            {selectedUser.is_locked && (
              <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold mb-2">🔒 This account is locked.</p>
                <button
                  onClick={() => handleUnlockUser(selectedUser.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Unlock Account
                </button>
              </div>
            )}

            <div className="flex justify-between mt-8 border-t pt-4">
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="text-red-600 hover:underline font-medium"
              >
                Delete User
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEmailOtp("");
                    setEmailOtpSent(false);
                    setPasswordOtp("");
                    setPasswordOtpSent(false);
                  }}
                  className="px-5 py-2 border rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Save Modal */}
      {showConfirmSave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-8 text-center animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Changes
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to save these changes?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmSave(false)}
                className="px-5 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmSaveChanges}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-8 text-center animate-fade-in">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              Delete User
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              This action will permanently remove this user account.
              <br />
              Are you sure you want to continue?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-5 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;