/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for sort and filter
  const [sortBy, setSortBy] = useState('name');  // Sort by name, email, role, etc
  const [filterRole, setFilterRole] = useState('all');  // Filter by role
  const [filterStatus, setFilterStatus] = useState('all');  // Filter by status
  const [showSortMenu, setShowSortMenu] = useState(false);  // Show/hide sort dropdown
  const [showFilterMenu, setShowFilterMenu] = useState(false);  // Show/hide filter dropdown
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // This runs once when page loads
  useEffect(() => {
    fetchUsersFromDatabase();
  }, []);

  const fetchUsersFromDatabase = () => {
    setLoading(true);

    fetch("http://localhost:8000/api/users", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch users from database");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Normalize/display role labels (backwards-compatible)
  const formatRole = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 'Admin';
    if (r === 'staff') return 'Staff';
    if (r === 'customer' || r === 'user') return 'Customer';
    return role || '';
  };

  // Map UI role to backend role value
  const roleToBackend = (uiRole) => {
    const r = (uiRole || '').toLowerCase();
    if (r === 'customer') return 'user';
    return r;
  };

  // Update a user's role on the backend
  const handleRoleChange = (userId, selectedUiRole) => {
    setUpdatingUserId(userId);
    setUpdateError(null);

    const backendRole = roleToBackend(selectedUiRole);

    fetch(`http://localhost:8000/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: backendRole }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update user role');
        return res.json();
      })
      .then((updatedUser) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      })
      .catch((err) => {
        console.error(err);
        setUpdateError(err.message);
      })
      .finally(() => setUpdatingUserId(null));
  };

  // Function to filter and sort users
  const getFilteredAndSortedUsers = () => {
    // Step 1: Filter by role (use normalized UI labels)
    let filteredUsers = users;
    if (filterRole !== 'all') {
      filteredUsers = filteredUsers.filter((user) => {
        const normalized = formatRole(user.role).toLowerCase();
        return normalized === filterRole;
      });
    }

    // Step 2: Filter by status
    if (filterStatus !== 'all') {
      filteredUsers = filteredUsers.filter((user) => user.status === filterStatus);
    }

    // Step 3: Sort the list
    filteredUsers.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === "created_at") {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
        return valueA - valueB;
      }

      if (typeof valueA === "string") {
        return valueA.localeCompare(valueB);
      }

      return valueA - valueB;
    });

    return filteredUsers;
  };

  return (
    <div className="px-10 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Users</h1>
      </div>

      <div className="rounded border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Profiles list
          </h2>

          <div className="flex space-x-3">
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
                    onClick={() => {
                      setSortBy("name");
                      setShowSortMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Name
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("email");
                      setShowSortMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("role");
                      setShowSortMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Role
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("created_at");
                      setShowSortMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Created Date
                  </button>
                </div>
              )}
            </div>

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
                      onClick={() => setFilterRole('staff')}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-blue-50 ${filterRole === 'staff' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                    >
                      Staff
                    </button>
                    <button
                      onClick={() => setFilterRole('customer')}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-blue-50 ${filterRole === 'customer' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                    >
                      Customer
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

        {loading && (
          <div className="text-center py-8 text-gray-500">
            Loading users...
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            Error: {error}
          </div>
        )}

        {!loading && !error && getFilteredAndSortedUsers().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}

        {!loading && !error && getFilteredAndSortedUsers().length > 0 && (
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
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {getFilteredAndSortedUsers().map((user) => {
                  const createdDate = new Date(
                    user.created_at
                  ).toLocaleDateString("en-US");

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                      <td className="py-5">{user.id}</td>
                      <td className="py-5 font-medium">{user.name}</td>
                      <td className="py-5">{user.email}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <select
                            value={formatRole(user.role).toLowerCase()}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={updatingUserId === user.id}
                            className="px-3 py-1 border rounded text-sm"
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updatingUserId === user.id && (
                            <span className="text-xs text-gray-500">Saving...</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5">
                        {user.status === 'Active' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-gray-400">
                        {createdDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;
