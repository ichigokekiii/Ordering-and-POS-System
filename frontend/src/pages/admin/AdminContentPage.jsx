/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useContents } from "../../contexts/ContentContext";

const CONTENT_FIELDS = {
  home: [
    // Banner 1
    { key: "hero_title_1", label: "Banner 1 Title" },
    { key: "hero_subtitle_1", label: "Banner 1 Subtitle" },
    { key: "hero_image_1", label: "Banner 1 Image" },

    // Banner 2
    { key: "hero_title_2", label: "Banner 2 Title" },
    { key: "hero_subtitle_2", label: "Banner 2 Subtitle" },
    { key: "hero_image_2", label: "Banner 2 Image" },

    // Banner 3
    { key: "hero_title_3", label: "Banner 3 Title" },
    { key: "hero_subtitle_3", label: "Banner 3 Subtitle" },
    { key: "hero_image_3", label: "Banner 3 Image" },

    // Banner 4
    { key: "hero_title_4", label: "Banner 4 Title" },
    { key: "hero_subtitle_4", label: "Banner 4 Subtitle" },
    { key: "hero_image_4", label: "Banner 4 Image" },

    // Banner 5
    { key: "hero_title_5", label: "Banner 5 Title" },
    { key: "hero_subtitle_5", label: "Banner 5 Subtitle" },
    { key: "hero_image_5", label: "Banner 5 Image" },

    // Intro Section
    { key: "home_intro_title", label: "Intro Title" },
    { key: "home_intro_description", label: "Intro Description" },

    // Featured Section
    { key: "home_featured_title", label: "Featured Section Title" },
    { key: "home_featured_description", label: "Featured Description" },

    // Promo Section
    { key: "home_promo_title", label: "Promo Title" },
    { key: "home_promo_description", label: "Promo Description" },
    { key: "home_promo_button_text", label: "Promo Button Text" },
    { key: "home_promo_image", label: "Promo Image" },
  ],
  about: [
    { key: "about_title", label: "About Title" },
    { key: "about_description", label: "About Description" },
  ],
  navbar: [
    { key: "brand_name", label: "Brand Name" },
    { key: "logo", label: "Navbar Logo" },
    { key: "navbar_bg", label: "Navbar Background" },
  ],
  footer: [
    { key: "footer_email", label: "Footer Email" },
    { key: "footer_phone", label: "Footer Phone" },
  ],
};

function AdminContentPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [editingContent, setEditingContent] = useState(null);
  const [formDataState, setFormDataState] = useState({
    identifier: "",
    page: "",
    type: "",
    content_text: "",
  });

  const contentContext = useContents() || {};
  const contents = contentContext.contents || [];
  const addContent = contentContext.addContent;
  const updateContent = contentContext.updateContent;
  const toggleArchiveContent = contentContext.toggleArchiveContent;
  const deleteContent = contentContext.deleteContent;

  const safeContents = contents || [];

  const groupedActive = {
    home: safeContents.filter((c) => c.page === "home" && !c.isArchived),
    about: safeContents.filter((c) => c.page === "about" && !c.isArchived),
    navbar: safeContents.filter((c) => c.page === "navbar" && !c.isArchived),
    footer: safeContents.filter((c) => c.page === "footer" && !c.isArchived),
  };

  const archivedContent = safeContents.filter((c) => c.isArchived);

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
        {Object.keys(groupedActive).map((section) => (
          <div key={section}>
            <h3 className="mb-4 text-xl font-semibold text-gray-700 border-b pb-2 capitalize">
              {section} Content
            </h3>

            <div className="grid gap-6 md:grid-cols-3">
              {groupedActive[section].length === 0 ? (
                <p className="text-gray-400">No content yet</p>
              ) : (
                groupedActive[section].map((item) => {
                  const fieldLabel =
                    CONTENT_FIELDS[section]?.find((f) => f.key === item.identifier)
                      ?.label || item.identifier;

                  return (
                    <div key={item.id} className="rounded border p-4 shadow-sm">
                      <div className="mb-2">
                        <span className="flex items-center text-xs font-bold text-green-600">
                          ✓ Active
                        </span>
                      </div>

                      {item.type === "image" && item.content_image && (
                        <img
                          src={`http://localhost:8000${item.content_image}`}
                          alt={item.identifier}
                          className="mb-3 h-40 w-full rounded object-cover"
                        />
                      )}

                      <h3 className="font-medium">
                        {fieldLabel}
                        {item.identifier.includes("hero_image") && (
                          <span className="ml-2 text-xs text-blue-500">(Banner)</span>
                        )}
                      </h3>

                      <p className="text-xs uppercase text-gray-400">
                        {item.identifier}
                      </p>

                      {item.type === "text" && (
                        <p className="mt-2 text-sm text-gray-700">
                          {item.content_text}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingContent(item);
                            setSelectedPage(item.page);
                            setFormDataState({
                              identifier: item.identifier,
                              page: item.page,
                              type: item.type,
                              content_text: item.content_text || "",
                            });
                            setShowModal(true);
                          }}
                          className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => toggleArchiveContent && toggleArchiveContent(item)}
                          className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}

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

                  {item.type === "image" && item.content_image && (
                    <img
                      src={`http://localhost:8000${item.content_image}`}
                      alt={item.identifier}
                      className="mb-3 h-40 w-full rounded object-cover grayscale opacity-60"
                    />
                  )}

                  <h3 className="font-medium">{item.identifier}</h3>

                  <p className="text-xs font-semibold uppercase text-blue-500">
                    {item.page}
                  </p>

                  {item.type === "text" && (
                    <p className="mt-2 text-sm text-gray-700 opacity-60">
                      {item.content_text}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingContent(item);
                        setSelectedPage(item.page);
                        setFormDataState({
                          identifier: item.identifier,
                          page: item.page,
                          type: item.type,
                          content_text: item.content_text || "",
                        });
                        setShowModal(true);
                      }}
                      className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleArchiveContent && toggleArchiveContent(item)}
                      className="rounded border px-3 py-1 text-sm text-green-700 hover:bg-green-50"
                    >
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
            <h3 className="mb-2 text-lg font-semibold">{editingContent ? "Edit Content" : "Add Content"}</h3>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                // manually append required fields (important for Laravel validation)
                formData.append("identifier", formDataState.identifier);
                formData.append("page", formDataState.page);
                formData.append("type", formDataState.type);

                // only append text if exists
                if (formDataState.type === "text") {
                  formData.set("content_text", formDataState.content_text || "");
                }

                // TEMPORARY: debug log for payload
                console.log("Submitting content:", {
                  identifier: formDataState.identifier,
                  page: formDataState.page,
                  type: formDataState.type,
                });

                // Validate banner image count (min 2)
                if (formDataState.page === "home" && formDataState.identifier.includes("hero_image")) {
                  const existingBannerImages = contents.filter(
                    (c) =>
                      c.page === "home" &&
                      c.identifier.includes("hero_image") &&
                      !c.isArchived
                  );

                  if (existingBannerImages.length >= 5 && !editingContent) {
                    alert("Maximum of 5 banner images allowed.");
                    return;
                  }
                }

                try {
                  if (editingContent) {
                    await updateContent(editingContent.id, formData);
                  } else {
                    await addContent(formData);
                  }
                  setShowModal(false);
                  setEditingContent(null);
                  setFormDataState({
                    identifier: "",
                    page: "",
                    type: "",
                    content_text: "",
                  });
                  e.target.reset();
                } catch (err) {
                  console.error("Failed to add content", err);
                }
              }}
            >
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Select Section
              </label>
              <select
                name="page"
                className="w-full rounded border px-4 py-2"
                required
                onChange={(e) => {
                  setSelectedPage(e.target.value);
                  setFormDataState({
                    ...formDataState,
                    page: e.target.value,
                    identifier: "",
                    type: "",
                    content_text: "",
                  });
                }}
                value={formDataState.page}
              >
                <option value="">Select Section</option>
                <option value="home">Home</option>
                <option value="about">About</option>
                <option value="navbar">Navbar</option>
                <option value="footer">Footer</option>
              </select>

              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Content Field
              </label>

              {selectedPage === "home" && (
                <p className="text-xs text-gray-400 -mt-1 mb-1">
                  Manage homepage sections: Banners, Intro, Featured, and Promo (images auto-detected)
                </p>
              )}

              {selectedPage && (
                <>
                  <select
                    name="identifier"
                    value={formDataState.identifier}
                    onChange={(e) => {
                      const selectedKey = e.target.value;

                      // infer type automatically
                      const isImage = selectedKey.includes("image") || selectedKey.includes("logo");

                      setFormDataState({
                        ...formDataState,
                        identifier: selectedKey,
                        type: isImage ? "image" : "text",
                        content_text: "",
                      });
                    }}
                    className="w-full rounded border px-4 py-2"
                    required
                  >
                    <option value="">Select Content Field</option>
                    {CONTENT_FIELDS[selectedPage]?.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {formDataState.identifier && formDataState.type === "text" && (
                <>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Text Content
                  </label>
                  <textarea
                    name="content_text"
                    value={formDataState.content_text}
                    onChange={(e) =>
                      setFormDataState({ ...formDataState, content_text: e.target.value })
                    }
                    className="w-full rounded border px-4 py-2"
                    placeholder="Enter text content..."
                  />
                </>
              )}

              {formDataState.identifier && formDataState.type === "image" && (
                <>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    name="content_image"
                    className="w-full text-sm"
                  />
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingContent(null);
                    setFormDataState({
                      identifier: "",
                      page: "",
                      type: "",
                      content_text: "",
                    });
                  }}
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
