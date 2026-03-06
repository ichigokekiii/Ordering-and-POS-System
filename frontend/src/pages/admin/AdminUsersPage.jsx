/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function AdminUsersPage() {
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

  const { user: currentUser } = useAuth();
  const [toast, setToast] = useState(null);
  const isOwner = currentUser?.role?.toLowerCase() === "owner";

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchUsersFromDatabase();
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
      filteredUsers = filteredUsers.filter((user) => {
        const normalizedStatus = (user.status || "").toLowerCase();
        return normalizedStatus === filterStatus.toLowerCase();
      });
    }

    filteredUsers.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === "id") {
        return Number(valueA) - Number(valueB);
      }
      if (sortBy === "created_at") {
        // Default: latest first (descending)
        return new Date(valueB) - new Date(valueA);
      }

      if (typeof valueA === "string") {
        return valueA.localeCompare(valueB);
      }

      return valueA - valueB;
    });

    return filteredUsers;
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

  // Edit Modal helpers
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email || "",
      password: "",
      confirmPassword: ""
    });
    setShowEditModal(true);
  };

  const handleSaveChanges = () => {
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setShowConfirmSave(true);
  };

  const confirmSaveChanges = () => {
    const payload = {
      email: editForm.email
    };

    if (editForm.password) {
      payload.password = editForm.password;
    }

    api.put(`/users/${selectedUser.id}`, payload)
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? res.data : u))
        );

        setShowConfirmSave(false);
        setShowEditModal(false);

        setToast({ type: "success", message: "User updated successfully" });
        setTimeout(() => setToast(null), 4000);
      })
      .catch(() => {
        setToast({ type: "error", message: "Failed to update user" });
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black">Users</h1>

        {!isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-base font-medium rounded-md transition"
          >
            + Add User
          </button>
        )}
      </div>

      <div className="rounded border p-6 shadow-sm">

        {/* Header + Sort + Filter */}
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
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      ROLE
                    </p>
                    <button
                      onClick={() => setFilterRole("all")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterRole("admin")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => setFilterRole("staff")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Staff
                    </button>
                    <button
                      onClick={() => setFilterRole("customer")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Customer
                    </button>
                    <button
                      onClick={() => setFilterRole("owner")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Owner
                    </button>
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      STATUS
                    </p>
                    <button
                      onClick={() => setFilterStatus("all")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus("Active")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus("Inactive")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Inactive
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
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Created Date</th>
                  {/* Actions column removed */}
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {getFilteredAndSortedUsers().map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 border-b cursor-pointer"
                    onClick={() => openEditModal(user)}
                  >
                    <td className="py-5">{user.id}</td>
                    <td className="py-5 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-5">{user.email}</td>
                    <td className="py-5">
                      {isOwner ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {formatRole(user.role)}
                        </span>
                      ) : (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          value={formatRole(user.role).toLowerCase()}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingUserId === user.id}
                          className="px-3 py-1 border rounded text-sm"
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
                        const normalizedStatus = (user.status || "").toLowerCase();
                        const isActive = normalizedStatus === "active";

                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
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
                    {/* Actions cell removed */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white text-sm ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {showCreateModal && (
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

            <div className="flex justify-end gap-3 mt-8">
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
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-[90%] max-w-md shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Edit User</h2>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-3 text-sm"
              />

              <input
                type="password"
                placeholder="New Password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-3 text-sm"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={editForm.confirmPassword}
                onChange={(e) =>
                  setEditForm({ ...editForm, confirmPassword: e.target.value })
                }
                className="w-full border rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="text-red-600 hover:underline"
              >
                Delete User
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
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
