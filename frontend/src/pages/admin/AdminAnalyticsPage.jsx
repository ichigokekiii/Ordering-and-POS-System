import React from "react";
import {
  TrendingUp,
  Users,
  Package,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminAnalyticsPage = () => {
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
    <div className="px-10 py-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black">
          Analytics
        </h2>
      </div>

      {/* Top Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-10">
        <StatCard
          icon={<Package size={18} />}
          label="Orders"
          value="2.5k"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Customers"
          value="33.3k"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Products"
          value="5.21k"
        />
        <StatCard
          icon={<Eye size={18} />}
          label="Views"
          value="13.8k"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Overview */}
        <div className="lg:col-span-2 rounded-xl border p-6 shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-6 text-black">
            Sales Overview
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="relative w-52 h-52">
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

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">1k</span>
                <span className="text-xs text-gray-500">
                  Weekly Visits
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4 mt-6 md:mt-0">
              {pieData.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    {item.name}
                  </div>
                  <p className="font-semibold">
                    ₱{item.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Report */}
        <div className="rounded-xl border p-6 shadow-sm bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-black">
              Revenue Report
            </h3>
            <span className="font-semibold text-green-600">
              +7%
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
                  tick={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563EB"
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

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-xl border p-5 shadow-sm bg-white">
    <div className="mb-3 text-blue-600">
      {icon}
    </div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-xl font-semibold text-black">
      {value}
    </p>
  </div>
);

export default AdminAnalyticsPage;
