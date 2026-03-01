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
    if (isOwner) return;
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    api.delete(`/users/${userId}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      })
      .catch(() => {
        setUpdateError("Failed to delete user");
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
        <h1 className="text-3xl font-semibold text-black">Users</h1>

        {!isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-medium rounded-xl transition"
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
                  {!isOwner && <th className="pb-4">Actions</th>}
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {getFilteredAndSortedUsers().map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 border-b">
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
                    {!isOwner && (
                      <td className="py-5">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
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
    </div>
  );
}

export default AdminUsersPage;
