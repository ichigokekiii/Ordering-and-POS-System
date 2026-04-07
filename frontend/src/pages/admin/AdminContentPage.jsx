import { useMemo, useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LandingPage from "../users/LandingPage";
import AboutPage from "../users/AboutPage";
import { useContents } from "../../contexts/ContentContext";
import { CMS_PAGES } from "../../cms/cmsRegistry";
import { ChevronDown, Monitor, LayoutTemplate, Layers } from "lucide-react";

// ISOLATED PREVIEWS
function PreviewScene({ activePage, cmsPreview }) {
  if (activePage === "home") {
    return (
      <div className="bg-white min-h-screen">
        <LandingPage cmsPreview={cmsPreview} />
      </div>
    );
  }

  if (activePage === "about") {
    return (
      <div className="bg-white min-h-screen">
        <AboutPage cmsPreview={cmsPreview} />
      </div>
    );
  }

  if (activePage === "navbar") {
    return (
      <div className="min-h-[500px] bg-slate-50/50 p-8 flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8 text-center">Navbar Preview Area</p>
        <div className="shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            <Navbar cmsPreview={cmsPreview} />
        </div>
      </div>
    );
  }
  
  if (activePage === "footer") {
     return (
       <div className="min-h-[500px] bg-slate-50/50 p-8 flex flex-col justify-end">
         <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8 text-center">Footer Preview Area</p>
         <div className="shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
             <Footer cmsPreview={cmsPreview} />
         </div>
       </div>
     );
  }

  return (
    <div className="flex h-full min-h-[400px] items-center justify-center bg-gray-50 text-gray-400">
       <p>Preview not configured for {activePage}</p>
    </div>
  )
}

const createEmptyFormState = () => ({
  page: "",
  identifier: "",
  type: "text",
  input: "text",
  content_text: "",
});

function AdminContentPage() {
  const contentContext = useContents() || {};
  const contents = contentContext.contents || [];
  const addContent = contentContext.addContent;
  const updateContent = contentContext.updateContent;
  const toggleArchiveContent = contentContext.toggleArchiveContent;
  const deleteContent = contentContext.deleteContent;
  const deleteArchivedContent = contentContext.deleteArchivedContent;

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";

  const [activePage, setActivePage] = useState("home");
  const [editorField, setEditorField] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [formDataState, setFormDataState] = useState(createEmptyFormState());
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageContents = useMemo(
    () => contents.filter((item) => item.page === activePage),
    [contents, activePage]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cmsPreview = {
    enabled: true,
    activePage,
    onEditField: (field) => {
      const existingItem = pageContents.find(
        (item) => item.identifier === field.identifier
      );

      setEditorField(field);
      setEditingContent(existingItem || null);
      setFormDataState({
        page: field.page,
        identifier: field.identifier,
        type: field.type,
        input: field.input,
        content_text: existingItem?.content_text || "",
      });
    },
  };

  const closeEditor = () => {
    setEditorField(null);
    setEditingContent(null);
    setFormDataState(createEmptyFormState());
  };

  const activePageLabel = CMS_PAGES.find(p => p.id === activePage)?.label || activePage;

  return (
    <div className="flex h-full flex-col px-8 py-8 overflow-hidden bg-white rounded-lg  ">
      
      {/* Header & Scalable Navigation */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-gray-900">Content Manager</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a view below and hover over elements in the preview to edit.
          </p>
        </div>

        {/* Dropdown Navigation */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-64 items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:border-[#4f6fa5] hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4f6fa5]" />
              {activePageLabel}
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
              <div className="mb-2 px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50">
                Pages & Components
              </div>
              {CMS_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    setActivePage(page.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activePage === page.id
                      ? "bg-[#eaf2ff] text-[#4f6fa5]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {page.id === 'navbar' || page.id === 'footer' ? (
                     <LayoutTemplate className="h-4 w-4 opacity-70" />
                  ) : (
                     <Monitor className="h-4 w-4 opacity-70" />
                  )}
                  {page.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace - Full Width Preview Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm min-h-0">
        {/* Fake Browser Header */}
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4">
          <div className="flex gap-1.5">
             <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
             <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
             <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
          </div>
          <div className="ml-4 flex h-6 flex-1 items-center justify-center rounded bg-white text-[10px] font-bold uppercase tracking-widest text-gray-400 shadow-sm">
            Live Preview • {activePageLabel}
          </div>
          <div className="w-16"></div>
        </div>

        {/* Live Preview Content */}
        <div className="flex-1 overflow-auto bg-[#fcfaf9]">
          <PreviewScene activePage={activePage} cmsPreview={cmsPreview} />
        </div>
      </div>

      {/* Glassmorphic Edit Modal (Now includes Archive/Delete) */}
      {editorField && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-all">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl border border-white/20">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5]">
                  {editorField.page}
                </span>
                <h3 className="mt-4 text-2xl font-playfair font-bold text-gray-900">
                  {editingContent ? "Edit" : "Add"} {editorField.label}
                </h3>
                <p className="mt-1 text-sm text-gray-500 font-mono text-xs">{editorField.identifier}</p>
              </div>
              
              {/* Status Indicator */}
              {editingContent && (
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  editingContent.isArchived ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                }`}>
                  {editingContent.isArchived ? "Archived" : "Active"}
                </span>
              )}
            </div>

            <form
              className="space-y-6"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                formData.append("identifier", formDataState.identifier);
                formData.append("page", formDataState.page);
                formData.append("type", formDataState.type);
                if (formDataState.type === "text") {
                  formData.set("content_text", formDataState.content_text || "");
                }
                if (formDataState.type === "image" && !editingContent && !formData.get("content_image")) {
                  window.alert("Please upload an image before saving.");
                  return;
                }
                try {
                  if (editingContent) { await updateContent(editingContent.id, formData); } 
                  else { await addContent(formData); }
                  closeEditor();
                } catch (error) { console.error("Failed to save", error); }
              }}
            >
              {/* Inputs */}
              {formDataState.type === "text" && formDataState.input === "color" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Color Value</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={formDataState.content_text || "#ffffff"} onChange={(e) => setFormDataState((prev) => ({ ...prev, content_text: e.target.value }))} className="h-12 w-16 cursor-pointer rounded-xl border border-gray-200" />
                    <input type="text" value={formDataState.content_text} onChange={(e) => setFormDataState((prev) => ({ ...prev, content_text: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all" placeholder="#ffffff" />
                  </div>
                </div>
              )}

              {formDataState.type === "text" && formDataState.input === "textarea" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Text Content</label>
                  <textarea name="content_text" value={formDataState.content_text} onChange={(e) => setFormDataState((prev) => ({ ...prev, content_text: e.target.value }))} className="min-h-32 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all" placeholder="Enter content..." />
                </div>
              )}

              {formDataState.type === "text" && formDataState.input === "text" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Text Content</label>
                  <input type="text" name="content_text" value={formDataState.content_text} onChange={(e) => setFormDataState((prev) => ({ ...prev, content_text: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all" placeholder="Enter content..." />
                </div>
              )}

              {formDataState.type === "image" && (
                <div className="space-y-3">
                  {editingContent?.content_image && (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                      <img src={`http://localhost:8000${editingContent.content_image}`} alt="Preview" className="h-48 w-full object-cover" />
                    </div>
                  )}
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Upload New Image</label>
                  <input type="file" name="content_image" className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 transition-all" accept="image/*" />
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                
                {/* Left Side: Archive & Delete Actions (Moved from Sidebar) */}
                <div className="flex gap-2">
                  {editingContent && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleArchiveContent(editingContent);
                        closeEditor();
                      }}
                      className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                        editingContent.isArchived ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {editingContent.isArchived ? "Restore" : "Archive"}
                    </button>
                  )}
                  
                  {editingContent && isAdmin && (
                     <button
                       type="button"
                       onClick={() => {
                         if (window.confirm("Delete permanently?")) {
                           deleteArchivedContent ? deleteArchivedContent(editingContent.id) : deleteContent(editingContent.id);
                           closeEditor();
                         }
                       }}
                       className="rounded-lg bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-100 transition-colors"
                     >
                       Delete
                     </button>
                  )}
                </div>

                {/* Right Side: Save & Cancel */}
                <div className="flex gap-3">
                  <button type="button" onClick={closeEditor} className="rounded-full px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-full bg-gray-900 px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#4f6fa5] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    Save Changes
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContentPage;