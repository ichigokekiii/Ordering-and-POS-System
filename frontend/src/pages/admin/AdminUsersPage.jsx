/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import { Search, Bell, Settings, User, Plus, ChevronDown } from "lucide-react"; // for icons

function AdminUsersPage() {
  // State variables to store data
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

  // Function to fetch users from backend
  const fetchUsersFromDatabase = () => {
    // Set loading to true before fetching
    setLoading(true);

    // Make HTTP GET request to backend
    fetch("http://localhost:8000/api/users", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })
      // First .then() - check if response is ok
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch users from database");
        }
        // Convert response to JSON format and pass to next .then()
        return response.json();
      })
      // Second .then() - receive the JSON data
      .then(data => {
        // Update state with user data
        setUsers(data);
        // Clear any previous errors
        setError(null);
      })
      // .catch() - run if any error occurs
      .catch(err => {
        // Store the error message in state
        setError(err.message);
        // Log error to browser console for debugging
        console.log(err);
      })
      // .finally() - always runs at the end
      .finally(() => {
        // Always set loading to false when done (success or error)
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

      // Handle dates
      if (sortBy === 'created_at') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
        return valueA - valueB;
      }

      // Handle strings (name, email, role)
      if (typeof valueA === 'string') {
        return valueA.localeCompare(valueB);
      }

      // Handle numbers
      return valueA - valueB;
    });

    return filteredUsers;
  };

  return (
    <div className="min-h-screen bg-blue-50/30 p-8 font-sans text-[#4A5568]">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#5A78A6]">Users</h1>
        <div className="flex items-center space-x-6">
          <Search className="w-5 h-5 text-gray-400 cursor-pointer" />
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-400 cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </div>
          <Settings className="w-5 h-5 text-gray-400 cursor-pointer" />
          <div className="flex items-center space-x-2 border-l pl-6 border-gray-300">
            <span className="text-sm font-medium">User Admin</span>
            <div className="bg-white border-2 border-gray-300 rounded-full p-1">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Profiles list</h2>
          <div className="flex space-x-3">
            {/* SORT BY BUTTON */}
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="px-6 py-2 border border-[#5A78A6] text-[#5A78A6] rounded-full text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
              >
                Sort By <ChevronDown className="w-4 h-4" />
              </button>

              {/* Sort dropdown menu */}
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => { setSortBy('name'); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${sortBy === 'name' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                  >
                    Name
                  </button>
                  <button
                    onClick={() => { setSortBy('email'); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${sortBy === 'email' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => { setSortBy('role'); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${sortBy === 'role' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                  >
                    Role
                  </button>
                  <button
                    onClick={() => { setSortBy('created_at'); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${sortBy === 'created_at' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                  >
                    Created Date
                  </button>
                </div>
              )}
            </div>

            {/* FILTER BY BUTTON */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-6 py-2 border border-[#5A78A6] text-[#5A78A6] rounded-full text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
              >
                Filter By <ChevronDown className="w-4 h-4" />
              </button>

              {/* Filter dropdown menu */}
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {/* Role Filter */}
                  <div className="px-4 py-3 border-b">
                    <p className="text-xs font-bold text-gray-700 mb-2">ROLE</p>
                    <button
                      onClick={() => setFilterRole('all')}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-blue-50 ${filterRole === 'all' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterRole('admin')}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-blue-50 ${filterRole === 'admin' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
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

                  {/* Status Filter */}
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-gray-700 mb-2">STATUS</p>
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-blue-50 ${filterStatus === 'all' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus('Active')}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-blue-50 ${filterStatus === 'Active' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus('Inactive')}
                      className={`w-full text-left px-3 py-1 text-sm hover:bg-blue-50 ${filterStatus === 'Inactive' ? 'bg-blue-100 text-[#5A78A6]' : ''}`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-8 text-gray-500">Loading users...</div>}
        {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

        {!loading && !error && getFilteredAndSortedUsers().length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found</div>
        )}

        {!loading && !error && getFilteredAndSortedUsers().length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-4 font-semibold">ID</th>
                  <th className="pb-4 font-semibold">Name</th>
                  <th className="pb-4 font-semibold">Email</th>
                  <th className="pb-4 font-semibold">Role</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {getFilteredAndSortedUsers().map((user) => {
                  // Format the date to readable format
                  const createdDate = new Date(user.created_at).toLocaleDateString('en-US');
                  
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
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-5 text-gray-400">{createdDate}</td>
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
