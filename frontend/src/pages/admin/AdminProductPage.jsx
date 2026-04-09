/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useMemo } from "react";
import { useProducts } from "../../contexts/ProductContext";
import { 
  ChevronDown, 
  PackagePlus, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  X, 
  Layers, 
  Package,
  Image as ImageIcon,
  Archive,
  ArchiveRestore
} from "lucide-react";

// Validation rules
const VALIDATION = {
  name: {
    regex: /^[a-zA-Z0-9 \-'&]+$/,
    maxLength: 50,
    message: "Letters, numbers, spaces, hyphens, apostrophes, or & only",
  },
  description: {
    regex: /^[a-zA-Z0-9 .,!?'\-&()\n]+$/,
    maxLength: 200,
    message: "Contains invalid characters",
  },
  price: {
    regex: /^\d+(\.\d{0,2})?$/,
    maxLength: 7,
    message: "Valid number with up to 2 decimal places",
  },
};

const PREMADE_CATEGORIES = [
  "Roses",
  "Lilies",
  "Tulips",
  "Carnation",
  "Addons",
];

const SECTION_OPTIONS = [
  { id: "custom", label: "Custom", icon: Layers },
  { id: "premades", label: "Premade", icon: Package },
];

const validate = (field, value) => {
  const rule = VALIDATION[field];
  if (!value) return "This field is required";
  if (value.length > rule.maxLength) return rule.message;
  if (!rule.regex.test(value)) return rule.message;
  return "";
};

const CharCount = ({ value, max }) => (
  <span className={`text-[10px] font-bold tracking-widest uppercase ${value.length > max ? "text-rose-500" : "text-gray-400"}`}>
    {value.length}/{max}
  </span>
);

const FieldError = ({ error }) =>
  error ? <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wide">{error}</p> : null;

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_IMAGE_NAME_REGEX = /\.(jpe?g|png|gif)$/i;
const ADMIN_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif";

const asBoolean = (value) => value === 1 || value === true || value === "1";

const StatusPill = ({ isAvailable }) => (
  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-md border ${
    isAvailable ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-rose-500/90 text-white border-rose-400"
  }`}>
    {isAvailable ? "Available" : "Out of Stock"}
  </span>
);

const ProductCard = ({ product, onEdit, onDelete, canEdit, isArchived }) => (
  <div className={`flex flex-col rounded-[1.5rem] border border-gray-200 overflow-hidden transition-all group ${isArchived ? "bg-gray-50 opacity-80 hover:opacity-100 hover:shadow-md" : "bg-white shadow-sm hover:shadow-lg hover:border-[#4f6fa5]"}`}>
    <div className={`h-48 border-b border-gray-100 relative overflow-hidden ${isArchived ? "bg-gray-200 grayscale" : "bg-gray-50"}`}>
      {product.image ? (
        <img
          src={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:8000'}${product.image}`}
          alt={product.name}
          className={`w-full h-full object-cover ${!isArchived && "transition-transform duration-700 group-hover:scale-105"}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
        </div>
      )}
      <div className="absolute top-3 left-3">
        <StatusPill isAvailable={product.isAvailable} />
      </div>
    </div>
    
    <div className="p-5 flex flex-col flex-1">
      <h3 className={`text-lg font-playfair font-bold mb-1 truncate ${isArchived ? "text-gray-600" : "text-gray-900"}`}>{product.name}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed min-h-[2.5rem]">{product.description}</p>
      
      <p className={`text-lg font-bold mb-4 mt-auto ${isArchived ? "text-gray-500" : "text-[#4f6fa5]"}`}>₱{product.price}</p>
      
      {canEdit && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => onEdit(product)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${isArchived ? "text-gray-500 hover:bg-gray-200 hover:text-gray-900" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-white border-2 transition-all duration-300 shadow-sm ${
              isArchived
                ? "bg-rose-500 border-rose-500 hover:bg-transparent hover:text-rose-500"
                : "bg-amber-500 border-amber-500 hover:bg-transparent hover:text-amber-500"
            }`}
          >
            {isArchived ? <Trash2 className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            {isArchived ? "Delete" : "Archive"}
          </button>
        </div>
      )}
    </div>
  </div>
);

const SectionGrid = ({ title, items, emptyMsg, onEdit, onDelete, canEdit, isArchived = false }) => (
  <div className="mb-10">
    {title && (
      <h4 className="mb-4 text-lg font-playfair font-bold text-gray-800 border-b border-gray-100 pb-2">{title}</h4>
    )}
    {items.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
        <Package className="mb-3 opacity-20 w-10 h-10" />
        <p className="text-sm font-bold text-gray-500">{emptyMsg}</p>
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} isArchived={isArchived} />
        ))}
      </div>
    )}
  </div>
);

function AdminProductPage({ user }) {
  const {
    products,
    premades,
    addProduct,
    addPremade,
    updateProduct,
    updatePremade,
    deleteProduct,
    deletePremade,
  } = useProducts();

  const canEdit = user?.role === "admin" || user?.role === "owner";

  const [activeSection, setActiveSection] = useState("custom");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [isAvailable, setIsAvailable] = useState(1);
  const [isArchived, setIsArchived] = useState(0);
  const [requiredMainCount, setRequiredMainCount] = useState("1");
  const [requiredFillerCount, setRequiredFillerCount] = useState("2");

  const [errors, setErrors] = useState({ name: "", description: "", price: "", image: "" });

  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null });
  const [archiveConfirm, setArchiveConfirm] = useState({ isOpen: false, type: "", item: null });

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const hasValidMimeType = !file.type || ALLOWED_IMAGE_TYPES.includes(file.type);
    const hasValidExtension = ALLOWED_IMAGE_NAME_REGEX.test(file.name || "");

    if (!hasValidMimeType || !hasValidExtension) {
      setErrors(prev => ({ ...prev, image: "Only JPG, JPEG, PNG, and GIF files are allowed." }));
      setImage(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors(prev => ({ ...prev, image: "Image must be 5MB or smaller." }));
      setImage(null);
      e.target.value = "";
      return;
    }

    setErrors(prev => ({ ...prev, image: "" }));
    setImage(file);
  };

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const sanitized = raw.split(".").length > 2 ? raw.slice(0, raw.lastIndexOf(".")) : raw;
    handleFieldChange("price", sanitized, setPrice);
  };

  const validateAll = () => {
    const newErrors = {
      name: validate("name", name),
      description: validate("description", description),
      price: validate("price", price),
      image: (!image && !isEditing) ? "An image is required" : ""
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some((e) => e !== "")) return false;

    // Hard block missing categories to prevent 500 errors
    if (activeSection === "custom") {
      if (!category) {
        showModalAlert("error", "Please select a Structural Category.");
        return false;
      }
      if (category === "Additional" && !type) {
        showModalAlert("error", "Please select a Flora Type.");
        return false;
      }
    } else {
      if (!category) {
        showModalAlert("error", "Please select a Collection Category.");
        return false;
      }
    }

    return true;
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    
    try {
      // 1. We MUST construct a FormData object to send images properly.
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("isAvailable", isAvailable ? 1 : 0);
      formData.append("isArchived", isArchived ? 1 : 0);
      
      // Only append image if the user uploaded a new one
      if (image) {
        formData.append("image", image);
      }

      if (activeSection === "custom") {
        if (type) formData.append("type", type);
        if (category === "Bouquets") {
            formData.append("required_main_count", requiredMainCount);
            formData.append("required_filler_count", requiredFillerCount);
        }

        if (isEditing) {
          // Send _method PUT so Laravel handles the multipart/form-data update properly
          formData.append("_method", "PUT"); 
          await updateProduct(currentId, formData);
          showModalAlert("success", "Product updated successfully!");
        } else {
          await addProduct(formData);
          showModalAlert("success", "Product added successfully!");
        }
      } else {
        if (isEditing) {
          formData.append("_method", "PUT");
          await updatePremade(currentId, formData);
          showModalAlert("success", "Premade updated successfully!");
        } else {
          await addPremade(formData);
          showModalAlert("success", "Premade added successfully!");
        }
      }
      resetForm();
      setShowModal(false);
} catch (error) {
      console.error("Operation failed", error);
      
      let errorMsg = "Operation failed. Please check your inputs.";
      
      // If Laravel throws a 422, let's print EXACTLY what it rejected to the console!
      if (error.response && error.response.status === 422) {
         console.error("🚨 LARAVEL REJECTED THESE FIELDS:", error.response.data.errors);
         
         const serverErrors = error.response.data.errors;
         if (serverErrors) {
            // Grab the very first error message from Laravel and put it in the modal
            const firstKey = Object.keys(serverErrors)[0];
            errorMsg = serverErrors[firstKey][0];
         } else if (error.response.data.message) {
            errorMsg = error.response.data.message;
         }
      } else if (error.response?.data?.message) {
         errorMsg = error.response.data.message;
      }
      
      showModalAlert("error", errorMsg);
    }
  };

  const promptDelete = (item) => {
    setDeleteConfirm({ isOpen: true, item });
  };

  const promptArchive = (item) => {
    setArchiveConfirm({
      isOpen: true,
      type: "archive",
      item: {
        ...item,
        section: activeSection,
        isArchived: asBoolean(item.isArchived),
      },
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.item) return;

    if (!asBoolean(deleteConfirm.item.isArchived)) {
      showModalAlert("error", "You must archive this item before deleting it.");
      setDeleteConfirm({ isOpen: false, item: null });
      return;
    }

    try {
      if (activeSection === "custom") await deleteProduct(deleteConfirm.item.id);
      else await deletePremade(deleteConfirm.item.id);
      
      showModalAlert("success", "Item deleted successfully.");
    } catch (error) {
      showModalAlert("error", "Failed to delete item.");
    } finally {
      setDeleteConfirm({ isOpen: false, item: null });
    }
  };

  const toggleArchiveItem = async (item) => {
    const formData = new FormData();
    formData.append("isArchived", item.isArchived ? 0 : 1);
    formData.append("_method", "PUT");

    if (item.section === "custom") {
      await updateProduct(item.id, formData);
      return;
    }

    await updatePremade(item.id, formData);
  };

  const executeArchiveAction = async () => {
    const { item, type } = archiveConfirm;
    if (!item) return;

    try {
      await toggleArchiveItem(item);
      showModalAlert("success", type === "archive" ? "Item archived successfully." : "Item restored successfully.");

      if (currentId === item.id) {
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error(`Failed to ${type} item`, error);
      showModalAlert("error", `Failed to ${type} item.`);
    } finally {
      setArchiveConfirm({ isOpen: false, type: "", item: null });
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setName(product.name);
    setImage(null);
    setPrice(product.price);
    setDescription(product.description);
    setCategory(product.category);
    setType(product.type || "");

    setIsAvailable(asBoolean(product.isAvailable) ? 1 : 0);
    setIsArchived(asBoolean(product.isArchived) ? 1 : 0);

    setRequiredMainCount(String(product.required_main_count ?? 1));
    setRequiredFillerCount(String(product.required_filler_count ?? 2));
    setErrors({ name: "", description: "", price: "", image: "" });
    setShowModal(true);
  };

  const resetForm = () => {
    setName(""); setImage(null); setPrice(""); setDescription("");
    setCategory(""); setType(""); setIsAvailable(1); setIsArchived(0);
    setRequiredMainCount("1"); setRequiredFillerCount("2");
    setCurrentId(null); setIsEditing(false);
    setErrors({ name: "", description: "", price: "", image: "" });
  };

  const activeOption = useMemo(
    () => SECTION_OPTIONS.find((opt) => opt.id === activeSection) || SECTION_OPTIONS[0],
    [activeSection]
  );

  const activeProducts = products.filter((p) => !asBoolean(p.isArchived));
  const archivedProducts = products.filter((p) => asBoolean(p.isArchived));

  const activePremades = premades.filter((p) => !asBoolean(p.isArchived));
  const archivedPremades = premades.filter((p) => asBoolean(p.isArchived));

  const bouquets = activeProducts.filter((p) => p.category === "Bouquets");
  const mainFlowers = activeProducts.filter((p) => p.category === "Additional" && p.type === "Main Flowers");
  const fillers = activeProducts.filter((p) => p.category === "Additional" && p.type === "Fillers");

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      
      {/* HEADER AREA */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between relative z-[160]">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">Product Management</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">
            Manage your custom builder components and curated premade collections.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {!canEdit && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100">
              View-Only Access
            </span>
          )}
          {canEdit && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm active:scale-95"
            >
              <PackagePlus className="w-4 h-4" />
              {activeSection === "custom" ? "+ Add Custom" : "+ Add Premade"}
            </button>
          )}

          {/* DROPDOWN NAVIGATION */}
          <div className="relative w-[160px]" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 border-2 border-gray-200 hover:border-gray-900 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
            >
              <div className="flex items-center gap-2">
                <activeOption.icon className="h-4 w-4" />
                {activeOption.label}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-[170] mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in duration-100">
                <div className="mb-1 border-b border-gray-50 px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Views
                </div>
                {SECTION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => { setActiveSection(option.id); setIsDropdownOpen(false); }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        activeSection === option.id ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-bold tracking-tight">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC CONTENT GRID */}
      <div className="flex-1 mt-4">
        {activeSection === "custom" && (
          <div className="animate-in fade-in duration-500">
            <SectionGrid title="Bouquet Frameworks" items={bouquets} emptyMsg="No bouquets available in inventory." onEdit={handleEdit} onDelete={promptArchive} canEdit={canEdit} />
            <SectionGrid title="Main Flowers" items={mainFlowers} emptyMsg="No main flowers available in inventory." onEdit={handleEdit} onDelete={promptArchive} canEdit={canEdit} />
            <SectionGrid title="Filler Elements" items={fillers} emptyMsg="No fillers available in inventory." onEdit={handleEdit} onDelete={promptArchive} canEdit={canEdit} />

            {/* Archived Items */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-playfair font-bold text-gray-400">Archived Items</h3>
                {archivedProducts.length > 0 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {archivedProducts.length} Hidden
                  </span>
                )}
              </div>
              
              {archivedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
                  <Archive className="mb-4 opacity-20 w-12 h-12" />
                  <p className="text-sm font-bold text-gray-500">No archived custom items found.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {archivedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onEdit={handleEdit} onDelete={promptDelete} canEdit={canEdit} isArchived={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "premades" && (
          <div className="animate-in fade-in duration-500">
            <SectionGrid title="Curated Collections" items={activePremades} emptyMsg="No curated collections available in inventory." onEdit={handleEdit} onDelete={promptArchive} canEdit={canEdit} />

            {/* Archived Premades */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-playfair font-bold text-gray-400">Archived Collections</h3>
                {archivedPremades.length > 0 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {archivedPremades.length} Hidden
                  </span>
                )}
              </div>
              
              {archivedPremades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
                  <Archive className="mb-4 opacity-20 w-12 h-12" />
                  <p className="text-sm font-bold text-gray-500">No archived premade collections found.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {archivedPremades.map((p) => (
                    <ProductCard key={p.id} product={p} onEdit={handleEdit} onDelete={promptDelete} canEdit={canEdit} isArchived={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && canEdit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4f6fa5] mb-3 inline-block">
                  {activeSection === "custom" ? "Custom Element" : "Premade Collection"}
                </span>
                <h2 className="text-2xl font-playfair font-bold text-gray-900">
                  {isEditing ? "Edit Item Details" : "Create New Item"}
                </h2>
              </div>
              {isEditing && (
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${isArchived ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isArchived ? "Archived" : "Active"}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name & Price Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Product Name</label>
                    <CharCount value={name} max={VALIDATION.name.maxLength} />
                  </div>
                  <input
                    className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-semibold text-gray-900 ${errors.name ? "border-rose-400 focus:ring-rose-100" : "focus:border-[#4f6fa5]"}`}
                    placeholder="e.g. Crimson Rose"
                    value={name}
                    onChange={(e) => handleFieldChange("name", e.target.value, setName)}
                    maxLength={VALIDATION.name.maxLength}
                  />
                  <FieldError error={errors.name} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Price (₱)</label>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all font-bold text-[#4f6fa5] ${errors.price ? "border-rose-400 focus:ring-rose-100" : "focus:border-[#4f6fa5]"}`}
                    placeholder="0.00"
                    value={price}
                    onChange={handlePriceChange}
                    maxLength={VALIDATION.price.maxLength}
                  />
                  <FieldError error={errors.price} />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <CharCount value={description} max={VALIDATION.description.maxLength} />
                </div>
                <textarea
                  className={`min-h-24 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all text-gray-700 leading-relaxed ${errors.description ? "border-rose-400 focus:ring-rose-100" : "focus:border-[#4f6fa5]"}`}
                  placeholder="Describe the product details..."
                  value={description}
                  onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                  maxLength={VALIDATION.description.maxLength}
                />
                <FieldError error={errors.description} />
              </div>

              {/* Category & Type Logic */}
              {activeSection === "custom" && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Structural Category</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value="Bouquets"
                          checked={category === "Bouquets"}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            setType("");
                            setRequiredMainCount("1");
                            setRequiredFillerCount("2");
                          }}
                          className="w-4 h-4 text-[#4f6fa5] bg-white border-gray-300 focus:ring-[#eaf2ff] focus:ring-2"
                        />
                        <span className="text-sm font-semibold text-gray-700">Bouquets Wrapper</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value="Additional"
                          checked={category === "Additional"}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            setRequiredMainCount("1");
                            setRequiredFillerCount("2");
                          }}
                          className="w-4 h-4 text-[#4f6fa5] bg-white border-gray-300 focus:ring-[#eaf2ff] focus:ring-2"
                        />
                        <span className="text-sm font-semibold text-gray-700">Flora & Additional</span>
                      </label>
                    </div>
                  </div>

                  {category === "Additional" && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Flora Type</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="Main Flowers"
                            checked={type === "Main Flowers"}
                            onChange={(e) => setType(e.target.value)}
                            className="w-4 h-4 text-[#4f6fa5] bg-white border-gray-300 focus:ring-[#eaf2ff] focus:ring-2"
                          />
                          <span className="text-sm font-semibold text-gray-700">Main Flowers</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="Fillers"
                            checked={type === "Fillers"}
                            onChange={(e) => setType(e.target.value)}
                            className="w-4 h-4 text-[#4f6fa5] bg-white border-gray-300 focus:ring-[#eaf2ff] focus:ring-2"
                          />
                          <span className="text-sm font-semibold text-gray-700">Fillers</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {category === "Bouquets" && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Builder Requirements</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Required Main Flowers</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#4f6fa5] focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
                            value={requiredMainCount}
                            onChange={(e) => setRequiredMainCount(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600">Required Fillers</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#4f6fa5] focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
                            value={requiredFillerCount}
                            onChange={(e) => setRequiredFillerCount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "premades" && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Collection Category</label>
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>Select Premade Category...</option>
                    {PREMADE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status & Image Row */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Status</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isAvailable"
                        value={1}
                        checked={!!isAvailable}
                        onChange={() => setIsAvailable(1)}
                        className="w-4 h-4 text-emerald-500 bg-gray-50 border-gray-300 focus:ring-emerald-100 focus:ring-2"
                      />
                      <span className="text-sm font-bold text-emerald-600">Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isAvailable"
                        value={0}
                        checked={!isAvailable}
                        onChange={() => setIsAvailable(0)}
                        className="w-4 h-4 text-rose-500 bg-gray-50 border-gray-300 focus:ring-rose-100 focus:ring-2"
                      />
                      <span className="text-sm font-bold text-rose-500">Unavailable</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Cover Image</label>
                  <input
                    type="file"
                    accept={ADMIN_IMAGE_ACCEPT}
                    onChange={handleImageChange}
                    className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-gray-600 hover:file:bg-gray-200 transition-all cursor-pointer"
                  />
                  <p className="mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-tight">
                    JPG, JPEG, PNG, or GIF only. Max 5MB.
                  </p>
                  {!image && isEditing && (
                    <p className="mt-2 text-[9px] font-bold text-amber-500 uppercase tracking-wider leading-tight">
                      Current image kept if blank.
                    </p>
                  )}
                  <FieldError error={errors.image} />
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-gray-100">
                <div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setArchiveConfirm({
                        isOpen: true,
                        type: isArchived ? "restore" : "archive",
                        item: {
                          id: currentId,
                          name,
                          isArchived: !!isArchived,
                          section: activeSection,
                        },
                      })}
                      className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${isArchived ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                    >
                      {isArchived ? "Restore" : "Archive"}
                    </button>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
                >
                  {isEditing ? "Save Changes" : "Create Product"}
                </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {archiveConfirm.isOpen && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${archiveConfirm.type === "archive" ? "bg-amber-100 text-amber-500" : "bg-emerald-100 text-emerald-500"}`}>
              {archiveConfirm.type === "archive" ? <Archive size={28} /> : <ArchiveRestore size={28} />}
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
              {archiveConfirm.type === "archive" ? "Archive Item?" : "Restore Item?"}
            </h3>
            <p className="text-sm text-gray-500 mb-8 px-2">
              {archiveConfirm.type === "archive"
                ? `This will hide "${archiveConfirm.item?.name}" from the live catalog until it is restored.`
                : `This will restore "${archiveConfirm.item?.name}" back to the live catalog.`}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setArchiveConfirm({ isOpen: false, type: "", item: null })}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeArchiveAction}
                className={`rounded-lg px-5 py-2 text-sm font-bold text-white transition-all duration-300 shadow-sm ${archiveConfirm.type === "archive" ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
              >
                {archiveConfirm.type === "archive" ? "Yes, Archive" : "Yes, Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
               <Trash2 size={28} />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Delete Item?</h3>
            <p className="text-sm text-gray-500 mb-8 px-2">Are you sure you want to permanently delete "{deleteConfirm.item?.name}"? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, item: null })} 
                className="rounded-lg px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-bold text-white border-2 border-rose-500 hover:bg-transparent hover:text-rose-600 transition-all duration-300 shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STATUS ALERT MODAL --- */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[400] p-4">
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
      )}

    </div>
  );
}

export default AdminProductPage;
