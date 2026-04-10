import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import AuthPage from "../users/AuthPage";
import VerifyOtpPage from "../users/VerifyOtpPage";
import ForgotPasswordPage from "../users/ForgotPasswordPage";
import ResetPasswordPage from "../users/ResetPasswordPage";
import LandingPage from "../users/LandingPage";
import AboutPage from "../users/AboutPage";
import ProductPage from "../users/ProductPage";
import SchedulePage from "../users/SchedulePage";
import { useContents } from "../../contexts/ContentContext";
import { CMS_PAGES, getCmsAssetUrl } from "../../cms/cmsRegistry";
import { ChevronDown, Monitor, LayoutTemplate, Layers, ArchiveRestore, Trash2, Archive, CheckCircle2, X } from "lucide-react";
import {
  canManageAdminDashboard,
  canManageUsersAdmin,
  isStaffReadOnlyAdmin,
} from "../../utils/adminAccess";
import { normalizeApiValidationErrors } from "../../utils/formValidation";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_IMAGE_NAME_REGEX = /\.(jpe?g|png)$/i;
const ADMIN_IMAGE_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";
const MAX_IMAGE_SIZE_LABEL = "2MB";

const getContentRequestErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.status === 422) {
    const serverErrors = error.response.data?.errors;

    if (serverErrors) {
      const firstKey = Object.keys(serverErrors)[0];
      if (firstKey && serverErrors[firstKey]?.[0]) {
        return serverErrors[firstKey][0];
      }
    }
  }

  return error?.response?.data?.error || error?.response?.data?.message || fallbackMessage;
};

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be loaded."));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

const buildOptimizedImageName = (originalName, mimeType) => {
  const baseName = (originalName || "content-image").replace(/\.[^.]+$/, "");
  const extension = mimeType === "image/png" ? ".png" : ".jpg";
  return `${baseName}-optimized${extension}`;
};

const optimizeImageForUpload = async (file) => {
  if (!(file instanceof File) || file.size === 0 || file.size <= MAX_IMAGE_SIZE_BYTES) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

  let scale = 1;
  let quality = mimeType === "image/jpeg" ? 0.9 : undefined;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, mimeType, quality);

    if (blob && blob.size <= MAX_IMAGE_SIZE_BYTES) {
      return new File([blob], buildOptimizedImageName(file.name, mimeType), {
        type: mimeType,
        lastModified: Date.now(),
      });
    }

    if (mimeType === "image/jpeg" && typeof quality === "number" && quality > 0.45) {
      quality = Number((quality - 0.12).toFixed(2));
    } else {
      scale *= 0.82;
    }
  }

  return null;
};

function AdminModalPortal({ children }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

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

  if (activePage === "products") {
    return (
      <div className="bg-white min-h-screen">
        <ProductPage cmsPreview={cmsPreview} />
      </div>
    );
  }

  if (activePage === "schedule") {
    return (
      <div className="bg-white min-h-screen">
        <SchedulePage cmsPreview={cmsPreview} />
      </div>
    );
  }

  if (activePage === "auth") {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col gap-12 py-12">
         {/* Login / Register Toggle */}
         <div>
           <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 text-center">Login / Register View</p>
           <AuthPage cmsPreview={cmsPreview} />
         </div>
         
         <div className="border-t-4 border-dashed border-gray-300 w-full my-4"></div>
         
         {/* Forgot Password */}
         <div>
           <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 text-center">Forgot Password View</p>
           <ForgotPasswordPage cmsPreview={cmsPreview} />
         </div>

         <div className="border-t-4 border-dashed border-gray-300 w-full my-4"></div>

         {/* Verify OTP */}
         <div>
           <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 text-center">Verify OTP View</p>
           <VerifyOtpPage cmsPreview={cmsPreview} />
         </div>

         <div className="border-t-4 border-dashed border-gray-300 w-full my-4"></div>

         {/* Reset Password */}
         <div>
           <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 text-center">Reset Password View</p>
           <ResetPasswordPage cmsPreview={cmsPreview} />
         </div>
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

function AdminContentPage({ user }) {
  const contentContext = useContents() || {};
  const addContent = contentContext.addContent;
  const updateContent = contentContext.updateContent;
  const toggleArchiveContent = contentContext.toggleArchiveContent;
  const deleteContent = contentContext.deleteContent;
  const deleteArchivedContent = contentContext.deleteArchivedContent;

  const canManageContent = canManageAdminDashboard(user);
  const canPermanentlyDelete = canManageUsersAdmin(user);
  const isReadOnly = isStaffReadOnlyAdmin(user);

  const [activePage, setActivePage] = useState("home");
  const [editorField, setEditorField] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [formDataState, setFormDataState] = useState(createEmptyFormState());
  const [editorErrors, setEditorErrors] = useState({ content_text: "", content_image: "" });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // REPLACED TOAST WITH MODAL CONSISTENCY
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", item: null });

  const pageContents = useMemo(
    () => (contentContext.contents || []).filter((item) => item.page === activePage),
    [contentContext.contents, activePage]
  );
  
  const archivedItems = pageContents.filter((item) => item.isArchived);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showModalAlert = (type, message) => {
    setStatusModal({ isOpen: true, type, message });
  };

  const cmsPreview = {
    enabled: true,
    readOnly: isReadOnly,
    activePage,
    onEditField: (field) => {
      const existingItem = pageContents.find(
        (item) => item.identifier === field.identifier && !item.isArchived
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

  // --- FIXED: Use the item's actual input type so it doesn't force textareas ---
  const openArchivedEditor = (item) => {
    const defaultInputType = item.type === "image" ? "image" : "textarea";
    
    setEditorField({
      page: item.page,
      identifier: item.identifier,
      type: item.type,
      label: item.identifier,
      input: item.input || defaultInputType,
    });
    setEditingContent(item);
    setFormDataState({
      page: item.page,
      identifier: item.identifier,
      type: item.type,
      input: item.input || defaultInputType,
      content_text: item.content_text || "",
    });
  };

  const closeEditor = () => {
    setEditorField(null);
    setEditingContent(null);
    setFormDataState(createEmptyFormState());
    setEditorErrors({ content_text: "", content_image: "" });
  };

  const handlePermanentDelete = async (item) => {
    if (!item) return;

    if (item.isArchived) {
      await deleteArchivedContent(item.id);
      return;
    }

    await deleteContent(item.id);
  };

  const executeConfirmAction = async () => {
    const { type, item } = confirmModal;
    if (!item) return;

    try {
      if (type === "delete") {
        if (!item.isArchived) {
           showModalAlert("error", "You must archive this content before deleting it.");
           setConfirmModal({ isOpen: false, type: "", item: null });
           return;
        }
        await handlePermanentDelete(item);
        showModalAlert("success", "Content permanently deleted.");
      } else if (type === "archive") {
        await toggleArchiveContent(item);
        showModalAlert("success", "Content archived successfully.");
      } else if (type === "restore") {
        await toggleArchiveContent(item);
        showModalAlert("success", "Content restored successfully.");
      }

      if (editingContent && editingContent.id === item.id) {
        closeEditor();
      }
    } catch (error) {
      console.error(`Failed to ${type} content`, error);
      showModalAlert("error", `Failed to ${type} content.`);
    } finally {
      setConfirmModal({ isOpen: false, type: "", item: null });
    }
  };

  const activePageLabel = CMS_PAGES.find(p => p.id === activePage)?.label || activePage;

  return (
    <div className="relative min-h-screen isolate rounded-lg bg-white px-8 py-8 flex flex-col">
      
      <div className="relative z-[70] mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-gray-900">Content Manager</h2>
          <p className="mt-1 text-sm text-gray-500">
            {canManageContent
              ? "Select a view below and hover over elements in the preview to edit."
              : "Select a view below and open any content region to inspect it."}
          </p>
        </div>

        <div className="flex items-center gap-4 self-start lg:self-auto">
          {/* Dropdown Navigation */}
          <div className="relative z-[80]" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-64 items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:border-gray-900 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#4f6fa5]" />
                {activePageLabel}
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-[90] mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
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
      </div>

      {/* Fixed-Height Preview Canvas */}
      <div className="relative z-0 mb-12 flex h-[700px] shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex h-12 shrink-0 items-center border-b border-gray-100 bg-[#f5f5f5] px-4">
          <div className="flex gap-1.5 w-20">
             <div className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
             <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
             <div className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
          </div>
          
          <div className="flex h-7 flex-1 max-w-md mx-auto items-center justify-center rounded-md bg-white text-xs font-medium text-gray-600 shadow-sm border border-gray-200/80 gap-1.5">
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            <span>
              petalexpress.com<span className="text-gray-400">{activePage === 'home' ? '' : `/${activePage}`}</span>
            </span>
          </div>
          
          <div className="w-20"></div>
        </div>

        <div className="flex-1 overflow-auto bg-[#fcfaf9]">
          <PreviewScene activePage={activePage} cmsPreview={cmsPreview} />
        </div>
      </div>

      {canManageContent && (
        <div className="pt-8 border-t border-gray-100">
          <div className="mb-6 flex items-end justify-between">
             <div>
                <h3 className="text-2xl font-playfair font-bold text-gray-900">Archived Elements</h3>
                <p className="mt-1 text-sm text-gray-500">Content removed from the {activePageLabel} preview.</p>
             </div>
             {archivedItems.length > 0 && (
               <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-widest">
                 {archivedItems.length} Archived
               </span>
             )}
          </div>

          {archivedItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                <Archive size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-gray-500">No archived content found</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {archivedItems.map(item => {
                   return (
                      <div 
                        key={item.id} 
                        onClick={() => openArchivedEditor(item)}
                        className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#4f6fa5] transition-all overflow-hidden cursor-pointer group"
                      >
                         <div className="h-32 bg-gray-100 flex items-center justify-center border-b border-gray-100 relative overflow-hidden p-4">
                            {item.type === "image" && item.content_image ? (
                               <img src={getCmsAssetUrl(item.content_image)} alt={item.identifier} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                               <p className="text-sm text-gray-600 line-clamp-4 italic text-center">"{item.content_text || "Empty text field"}"</p>
                            )}
                         </div>

                         <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#4f6fa5] transition-colors">{item.identifier}</h3>
                            <p className="text-xs font-mono text-gray-400 mt-1 mb-4 truncate">{item.type} field</p>
                            
                            <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                               {canManageContent && (
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setConfirmModal({ isOpen: true, type: "restore", item });
                                   }} 
                                   className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                                 >
                                    <ArchiveRestore size={16} /> Restore
                                 </button>
                               )}
                               
                               {canPermanentlyDelete && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmModal({ isOpen: true, type: "delete", item });
                                    }}
                                    className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                    title="Delete Permanently"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               )}
                            </div>
                         </div>
                      </div>
                   );
                })}
             </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && canManageContent && (
        <AdminModalPortal>
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-all">
            <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
              
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                confirmModal.type === 'delete' ? 'bg-red-100 text-red-500' :
                confirmModal.type === 'archive' ? 'bg-amber-100 text-amber-500' :
                'bg-emerald-100 text-emerald-500'
              }`}>
                {confirmModal.type === 'delete' ? <Trash2 size={28} /> : 
                 confirmModal.type === 'archive' ? <Archive size={28} /> :
                 <ArchiveRestore size={28} />}
              </div>

              <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
                {confirmModal.type === "delete" ? "Delete Permanently?" : 
                 confirmModal.type === "archive" ? "Archive Content?" : 
                 "Restore Content?"}
              </h3>
              <p className="text-sm text-gray-500 mb-8 px-2">
                {confirmModal.type === "delete" ? "This action cannot be undone. Are you sure you want to delete this forever?" :
                 confirmModal.type === "archive" ? "This will hide the content from the live website. You can restore it later." :
                 "This will restore the content back to the live website."}
              </p>
              
              <div className="flex justify-center gap-3">
                <button onClick={() => setConfirmModal({ isOpen: false, type: "", item: null })} className="rounded-lg px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={executeConfirmAction} 
                  className={`rounded-lg px-5 py-2 text-sm font-bold text-white transition-all duration-300 shadow-sm hover:shadow-md ${
                    confirmModal.type === "delete" ? "bg-red-500 hover:bg-red-600" :
                    confirmModal.type === "archive" ? "bg-amber-500 hover:bg-amber-600" :
                    "bg-emerald-500 hover:bg-emerald-600"
                }`}>
                  {confirmModal.type === "delete" ? "Yes, Delete" : 
                   confirmModal.type === "archive" ? "Yes, Archive" : 
                   "Yes, Restore"}
                </button>
              </div>
            </div>
          </div>
        </AdminModalPortal>
      )}

      {/* WYSIWYG EDITOR MODAL */}
      {!confirmModal.isOpen && editorField && (
        <AdminModalPortal>
         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-all">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5]">
                  {editorField.page}
                </span>
                <h3 className="mt-4 text-2xl font-playfair font-bold text-gray-900">
                  {canManageContent ? (editingContent ? "Edit" : "Add") : "View"} {editorField.label}
                </h3>
                <p className="mt-1 text-sm text-gray-500 font-mono">{editorField.identifier}</p>
              </div>
              
              {editingContent && (
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  editingContent.isArchived ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {editingContent.isArchived ? "Archived" : "Active"}
                </span>
              )}
            </div>

            <form
              className="space-y-6"
              onSubmit={async (event) => {
                event.preventDefault();

                if (!canManageContent) {
                  return;
                }

                const formData = new FormData(event.target);
                
                formData.append("identifier", formDataState.identifier);
                formData.append("page", formDataState.page);
                formData.append("type", formDataState.type);
                
                if (formDataState.type === "text") {
                  const trimmedContentText = (formDataState.content_text || "").trim();

                  if (!trimmedContentText) {
                    setEditorErrors({ content_text: "Content text cannot be empty.", content_image: "" });
                    return;
                  }

                  formData.set("content_text", trimmedContentText);
                }
                
                const imageFile = formData.get("content_image");
                if (formDataState.type === "image" && !editingContent && (!imageFile || imageFile.size === 0)) {
                  setEditorErrors({ content_text: "", content_image: "Please upload an image before saving." });
                  return;
                }

                if (formDataState.type === "image" && imageFile instanceof File && imageFile.size > 0) {
                  const hasValidMimeType = !imageFile.type || ALLOWED_IMAGE_TYPES.includes(imageFile.type);
                  const hasValidExtension = ALLOWED_IMAGE_NAME_REGEX.test(imageFile.name || "");

                  if (!hasValidMimeType || !hasValidExtension) {
                    setEditorErrors({ content_text: "", content_image: "Only JPG, JPEG, and PNG files are allowed." });
                    return;
                  }

                  const optimizedImageFile = await optimizeImageForUpload(imageFile);

                  if (!optimizedImageFile) {
                    setEditorErrors({ content_text: "", content_image: `Image must be ${MAX_IMAGE_SIZE_LABEL} or smaller. Try a smaller image.` });
                    return;
                  }

                  if (optimizedImageFile.size > MAX_IMAGE_SIZE_BYTES) {
                    setEditorErrors({ content_text: "", content_image: `Image must be ${MAX_IMAGE_SIZE_LABEL} or smaller.` });
                    return;
                  }

                  formData.set("content_image", optimizedImageFile, optimizedImageFile.name);
                }

                setEditorErrors({ content_text: "", content_image: "" });

                try {
                  if (editingContent) { 
                    await updateContent(editingContent.id, formData); 
                    showModalAlert("success", "Content updated successfully.");
                  } else { 
                    await addContent(formData); 
                    showModalAlert("success", "Content created successfully.");
                  }
                  closeEditor();
                } catch (error) { 
                  console.error("Failed to save", error.response?.data || error.message);
                  const normalizedError = normalizeApiValidationErrors(error);
                  setEditorErrors((prev) => ({ ...prev, ...normalizedError.fieldErrors }));
                  showModalAlert("error", getContentRequestErrorMessage(error, "Failed to save changes."));
                }
              }}
            >
              {formDataState.type === "text" && formDataState.input === "color" && (
                <div className="space-y-2">
                  <FormFieldHeader label="Color Value" required error={editorErrors.content_text} />
                  <div className="flex items-center gap-3">
                    <input type="color" value={formDataState.content_text || "#ffffff"} onChange={(e) => { setFormDataState((prev) => ({ ...prev, content_text: e.target.value.slice(0, 7) })); setEditorErrors((prev) => ({ ...prev, content_text: "" })); }} disabled={!canManageContent} className="h-12 w-16 cursor-pointer rounded-xl border border-gray-200 disabled:cursor-not-allowed disabled:opacity-60" />
                    <input type="text" value={formDataState.content_text} onChange={(e) => { setFormDataState((prev) => ({ ...prev, content_text: e.target.value.slice(0, 7) })); setEditorErrors((prev) => ({ ...prev, content_text: "" })); }} readOnly={!canManageContent} disabled={!canManageContent} className={getValidationInputClassName({ hasError: !!editorErrors.content_text, baseClassName: "w-full rounded-xl border px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500", validClassName: "border-gray-200 bg-gray-50 focus:border-[#4f6fa5]", invalidClassName: "border-rose-400 bg-rose-50 focus:border-rose-500" })} placeholder="#ffffff" />
                  </div>
                </div>
              )}

              {formDataState.type === "text" && formDataState.input === "textarea" && (
                <div className="space-y-2">
                  <FormFieldHeader label="Text Content" required error={editorErrors.content_text} count={formDataState.content_text.length} max={1000} />
                  <textarea name="content_text" value={formDataState.content_text} onChange={(e) => { setFormDataState((prev) => ({ ...prev, content_text: e.target.value.slice(0, 1000) })); setEditorErrors((prev) => ({ ...prev, content_text: "" })); }} readOnly={!canManageContent} disabled={!canManageContent} className={getValidationInputClassName({ hasError: !!editorErrors.content_text, baseClassName: "min-h-32 w-full rounded-xl border px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500", validClassName: "border-gray-200 bg-gray-50 focus:border-[#4f6fa5]", invalidClassName: "border-rose-400 bg-rose-50 focus:border-rose-500" })} placeholder="Enter content..." />
                </div>
              )}

              {formDataState.type === "text" && formDataState.input === "text" && (
                <div className="space-y-2">
                  <FormFieldHeader label="Text Content" required error={editorErrors.content_text} count={formDataState.content_text.length} max={255} />
                  <input type="text" name="content_text" value={formDataState.content_text} onChange={(e) => { setFormDataState((prev) => ({ ...prev, content_text: e.target.value.slice(0, 255) })); setEditorErrors((prev) => ({ ...prev, content_text: "" })); }} readOnly={!canManageContent} disabled={!canManageContent} className={getValidationInputClassName({ hasError: !!editorErrors.content_text, baseClassName: "w-full rounded-xl border px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500", validClassName: "border-gray-200 bg-gray-50 focus:border-[#4f6fa5]", invalidClassName: "border-rose-400 bg-rose-50 focus:border-rose-500" })} placeholder="Enter content..." />
                </div>
              )}

              {formDataState.type === "image" && (
                <div className="space-y-3">
                  {editingContent?.content_image && (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                      <img src={getCmsAssetUrl(editingContent.content_image)} alt="Preview" className="h-48 w-full object-cover" />
                    </div>
                  )}
                  <FormFieldHeader label="Upload New Image" required={!editingContent} error={editorErrors.content_image} />
                  <input type="file" name="content_image" disabled={!canManageContent} className={getValidationInputClassName({ hasError: !!editorErrors.content_image, baseClassName: "w-full rounded-xl border px-3 py-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 transition-all disabled:cursor-not-allowed disabled:opacity-60", validClassName: "border-gray-200 bg-white", invalidClassName: "border-rose-400 bg-rose-50" })} accept={ADMIN_IMAGE_ACCEPT} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {editingContent ? `Optional on edit. JPG, JPEG, or PNG only. Max ${MAX_IMAGE_SIZE_LABEL}. Larger images are auto-resized when possible.` : `Required for new image content. JPG, JPEG, or PNG only. Max ${MAX_IMAGE_SIZE_LABEL}. Larger images are auto-resized when possible.`}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  {editingContent && canManageContent && (
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ isOpen: true, type: editingContent.isArchived ? "restore" : "archive", item: editingContent })}
                      className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                        editingContent.isArchived ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      {editingContent.isArchived ? "Restore" : "Archive"}
                    </button>
                  )}
                  
                  {editingContent && canPermanentlyDelete && editingContent.isArchived && (
                     <button
                       type="button"
                       onClick={() => setConfirmModal({ isOpen: true, type: "delete", item: editingContent })}
                       className="flex items-center gap-1 rounded-lg bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-100 transition-colors"
                     >
                       <Trash2 size={14} /> Delete
                     </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={closeEditor} className="rounded-lg px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                    {canManageContent ? "Cancel" : "Close"}
                  </button>
                  {canManageContent && (
                    <button type="submit" className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-[#4f6fa5] hover:shadow-md transition-all duration-300">
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        </AdminModalPortal>
      )}

      {/* --- STATUS ALERT MODAL --- */}
      {statusModal.isOpen && (
        <AdminModalPortal>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
            <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${statusModal.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 'bg-rose-100 text-rose-500'}`}>
                 {statusModal.type === 'success' ? <CheckCircle2 size={28} /> : <X size={28} />}
              </div>
              <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
                {statusModal.type === 'success' ? 'Success' : 'Action Failed'}
              </h3>
              <p className="text-sm text-gray-500 mb-8 px-2">{statusModal.message}</p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setStatusModal({ isOpen: false, type: 'success', message: '' })} 
                  className="rounded-xl bg-gray-900 px-8 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </AdminModalPortal>
      )}

    </div>
  );
}

export default AdminContentPage;
