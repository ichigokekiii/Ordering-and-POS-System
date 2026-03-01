import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminOverviewPage() {
  const [stats, setStats] = useState({
    products: 0,
    schedules: 0,
    activeUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, premadesRes, schedulesRes, usersRes] =
          await Promise.all([
            api.get("/products"),
            api.get("/premades"),
            api.get("/schedules"),
            api.get("/users"),
          ]);

        const totalProducts =
          (productsRes.data?.length || 0) +
          (premadesRes.data?.length || 0);

        const totalSchedules = schedulesRes.data?.length || 0;

        const totalActiveUsers =
          usersRes.data?.filter(
            (user) =>
              user.status &&
              user.status.toLowerCase() === "active"
          ).length || 0;

        setStats({
          products: totalProducts,
          schedules: totalSchedules,
          activeUsers: totalActiveUsers,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex">
      <div className="flex-1 px-10 py-10">
        <h1 className="mb-6 text-3xl font-semibold text-black">
          Admin Overview
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded border p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide">
              Total Products
            </h3>
            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {loading ? "—" : stats.products}
            </p>
          </div>

          <div className="rounded border p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide">
              Total Schedules
            </h3>
            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {loading ? "—" : stats.schedules}
            </p>
          </div>

          <div className="rounded border p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide">
              Active Users
            </h3>
            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {loading ? "—" : stats.activeUsers}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverviewPage;
