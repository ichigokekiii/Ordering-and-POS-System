/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("name");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

  const getFilteredAndSortedUsers = () => {
    let filteredUsers = users;

    if (filterRole !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === filterRole
      );
    }

    if (filterStatus !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filterStatus
      );
    }

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
                      onClick={() => setFilterRole("user")}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      User
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
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-4">{user.id}</td>
                      <td className="py-4 font-medium">
                        {user.name}
                      </td>
                      <td className="py-4">{user.email}</td>
                      <td className="py-4 capitalize">
                        {user.role}
                      </td>
                      <td className="py-4">
                        {user.status === "Active" ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
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
