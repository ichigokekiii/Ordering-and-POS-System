import AdminSidebar from "../components/AdminSidebar";

function AdminOverviewPage() {
  return (
    <div className="flex">

      <div className="flex-1 px-10 py-10">
        <h1 className="mb-6 text-2xl font-semibold">
          Admin Overview
        </h1>

        <p className="mb-10 text-gray-500">
          This is the Admin Page
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded border p-6">
            <h3 className="text-sm text-gray-500">Products</h3>
            <p className="mt-2 text-2xl font-semibold">—</p>
          </div>

          <div className="rounded border p-6">
            <h3 className="text-sm text-gray-500">Orders</h3>
            <p className="mt-2 text-2xl font-semibold">—</p>
          </div>

          <div className="rounded border p-6">
            <h3 className="text-sm text-gray-500">Revenue</h3>
            <p className="mt-2 text-2xl font-semibold">—</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverviewPage;
