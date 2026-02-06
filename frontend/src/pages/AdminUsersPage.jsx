import React from "react";
import { Search, Bell, Settings, User, Plus } from "lucide-react"; // Using lucide-react for icons

function AdminUsersPage() {
  const profiles = [
    {
      id: "225",
      username: "Malupiton",
      role: "User",
      email: "Malots64@gmai...",
      password: "**********",
      created: "12-02-2025",
      updated: "12-02-2025",
      status: "Active",
    },
    {
      id: "002",
      username: "iHeartFlower23",
      role: "Admin",
      email: "123@gmail.com",
      password: "****",
      created: "12-02-2025",
      updated: "12-02-2025",
      status: "Active",
    },
    {
      id: "032",
      username: "Carlos",
      role: "User",
      email: "Carlos.ust@gmai...",
      password: "**********",
      created: "12-02-2025",
      updated: "12-02-2025",
      status: "Active",
    },
    {
      id: "213",
      username: "RastamanEdgeLord",
      role: "Admin",
      email: "admin@gmail.co...",
      password: "****",
      created: "12-02-2025",
      updated: "12-02-2025",
      status: "Active",
    },
    {
      id: "001",
      username: "1000100101",
      role: "Admin",
      email: "eleven@gmail.co...",
      password: "***",
      created: "12-02-2025",
      updated: "12-02-2025",
      status: "Archiv...",
    },
  ];

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
            <button className="px-6 py-2 border border-[#5A78A6] text-[#5A78A6] rounded-full text-sm font-medium hover:bg-blue-50">
              Sort By
            </button>
            <button className="px-6 py-2 border border-[#5A78A6] text-[#5A78A6] rounded-full text-sm font-medium hover:bg-blue-50">
              Filter By
            </button>
            <button className="px-6 py-2 bg-[#7C8DB5] text-white rounded-full text-sm font-medium flex items-center hover:bg-[#6b7ca3]">
              Add Profile <Plus className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-100">
                <th className="pb-4 font-semibold">ID</th>
                <th className="pb-4 font-semibold">Username</th>
                <th className="pb-4 font-semibold">Role</th>
                <th className="pb-4 font-semibold">Email</th>
                <th className="pb-4 font-semibold">Password</th>
                <th className="pb-4 font-semibold">Created At</th>
                <th className="pb-4 font-semibold">Updated At</th>
                <th className="pb-4 font-semibold">Arc...</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {profiles.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-5">{user.id}</td>
                  <td className="py-5 font-medium">{user.username}</td>
                  <td className="py-5">{user.role}</td>
                  <td className="py-5 truncate max-w-[120px]">{user.email}</td>
                  <td className="py-5 tracking-tighter">{user.password}</td>
                  <td className="py-5 text-gray-400">{user.created} 23...</td>
                  <td className="py-5 text-gray-400">{user.updated} 23...</td>
                  <td className="py-5">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsersPage;
