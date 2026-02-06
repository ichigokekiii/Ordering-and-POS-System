import React from "react";
import {
  Search,
  Bell,
  Settings,
  User,
  TrendingUp,
  Users,
  Package,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminAnalyticsPage = () => {
  // Mock data matching your screenshot
  const lineData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 800 },
  ];

  const pieData = [
    { name: "Roses", value: 5709, color: "#00D1FF" },
    { name: "Tulips", value: 4095, color: "#FF99CC" },
    { name: "Lilies", value: 8115, color: "#A5A6F6" },
    { name: "Peonies", value: 3320, color: "#FFDB5C" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-8 font-sans text-[#2D3748]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#5A78A6]">Analytics</h1>
        <div className="flex items-center space-x-4">
          <Search className="text-gray-400 w-5 h-5 cursor-pointer" />
          <Bell className="text-gray-400 w-5 h-5 cursor-pointer" />
          <Settings className="text-gray-400 w-5 h-5 cursor-pointer" />
          <div className="flex items-center space-x-2 ml-4 border-l pl-4">
            <span className="text-sm font-semibold text-gray-600">
              User Admin
            </span>
            <User className="bg-white rounded-full p-1 border border-gray-200 w-9 h-9" />
          </div>
        </div>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Total Ratings */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="text-gray-500 font-medium mb-4">Total Ratings</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">4.3k</span>
            <span className="text-green-500 text-sm font-bold">+7%</span>
          </div>
          <p className="text-gray-400 text-xs mt-2 font-medium">
            Updated 2.3 Secs Ago
          </p>
        </div>

        {/* Statistics Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">
              Statistics Card
            </h3>
            <span className="text-xs text-gray-400">
              <span className="font-bold text-gray-600">40%</span> Total Growth
              this week
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <StatItem
              icon={<Package size={16} />}
              label="Orders"
              value="2.5k"
              color="bg-green-100 text-green-600"
            />
            <StatItem
              icon={<Users size={16} />}
              label="Customers"
              value="33.3k"
              color="bg-blue-100 text-blue-600"
            />
            <StatItem
              icon={<TrendingUp size={16} />}
              label="Products"
              value="5.21k"
              color="bg-pink-100 text-pink-600"
            />
            <StatItem
              icon={<Eye size={16} />}
              label="Views"
              value="13.8k"
              color="bg-indigo-100 text-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview (Pie Chart) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm">
          <h3 className="font-bold text-lg mb-6">Sales Overview</h3>
          <div className="flex flex-col md:flex-row items-center justify-around">
            <div className="relative w-48 h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold">1k</span>
                <span className="text-[10px] text-gray-400">Weekly Visits</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold ml-4">
                    ₱{item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Report (Line Chart) */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Revenue Report</h3>
            <span className="text-lg font-bold">
              10.5k{" "}
              <span className="text-green-500 text-xs font-bold">+7%</span>
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#A0AEC0" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4A3AFF"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#FF8A00"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, color }) => (
  <div className="flex flex-col items-start">
    <div className={`p-2 rounded-xl mb-2 ${color}`}>{icon}</div>
    <span className="text-[10px] text-gray-400 uppercase font-semibold">
      {label}
    </span>
    <span className="text-lg font-bold">{value}</span>
  </div>
);

export default AdminAnalyticsPage;
