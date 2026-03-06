import { useState } from "react";

function AdminContentPage() {
  const [showModal, setShowModal] = useState(false);

  // temporary placeholder data until backend/context is added
  const [contents] = useState([
    {
      id: 1,
      identifier: "hero_title",
      page: "home",
      type: "text",
      content: "Fresh flowers delivered daily",
      isArchived: false,
    },
    {
      id: 2,
      identifier: "hero_banner",
      page: "home",
      type: "image",
      image:
        "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
      isArchived: true,
    },
  ]);

  const activeContent = contents.filter((c) => !c.isArchived);
  const archivedContent = contents.filter((c) => c.isArchived);

  return (
    <div className="px-10 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Content</h2>

        <button
          onClick={() => setShowModal(true)}
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Content
        </button>
      </div>

      <div className="space-y-10">
        {/* Active Content */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-700 border-b pb-2">
            Active Content
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            {activeContent.length === 0 ? (
              <p className="text-gray-400">No active content</p>
            ) : (
              activeContent.map((item) => (
                <div key={item.id} className="rounded border p-4 shadow-sm">
                  <div className="mb-2">
                    <span className="flex items-center text-xs font-bold text-green-600">
                      <span className="mr-1">✓</span> Active
                    </span>
                  </div>

                  {item.type === "image" && (
                    <img
                      src={item.image}
                      alt={item.identifier}
                      className="mb-3 h-40 w-full rounded object-cover"
                    />
                  )}

                  <h3 className="font-medium">{item.identifier}</h3>

                  <p className="text-sm text-gray-500">Page: {item.page}</p>

                  {item.type === "text" && (
                    <p className="mt-2 text-sm text-gray-700">
                      {item.content}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
                      Edit
                    </button>

                    <button className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100">
                      Archive
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Archived Content */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-700 border-b pb-2">
            Archived Content
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            {archivedContent.length === 0 ? (
              <p className="text-gray-400">No archived content</p>
            ) : (
              archivedContent.map((item) => (
                <div key={item.id} className="rounded border p-4 shadow-sm">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-gray-500">
                      Archived
                    </span>
                  </div>

                  {item.type === "image" && (
                    <img
                      src={item.image}
                      alt={item.identifier}
                      className="mb-3 h-40 w-full rounded object-cover grayscale opacity-60"
                    />
                  )}

                  <h3 className="font-medium">{item.identifier}</h3>

                  <p className="text-sm text-gray-500">Page: {item.page}</p>

                  {item.type === "text" && (
                    <p className="mt-2 text-sm text-gray-700 opacity-60">
                      {item.content}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
                      Edit
                    </button>

                    <button className="rounded border px-3 py-1 text-sm text-green-700 hover:bg-green-50">
                      Restore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal (same style as schedules) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Add Content</h3>

            <form className="space-y-4">
              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Identifier (ex: hero_title)"
              />

              <input
                className="w-full rounded border px-4 py-2"
                placeholder="Page (ex: home)"
              />

              <select className="w-full rounded border px-4 py-2">
                <option value="text">Text Content</option>
                <option value="image">Image Content</option>
              </select>

              <textarea
                className="w-full rounded border px-4 py-2"
                placeholder="Text content..."
              />

              <input type="file" className="w-full text-sm" />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContentPage;
