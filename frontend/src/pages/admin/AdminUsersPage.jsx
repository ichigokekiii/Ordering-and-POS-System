/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ChevronDown, 
  UserPlus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MoreHorizontal, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  X,
  Trash2,
  ArchiveRestore,
  Archive,
  Loader2,
  Pencil
} from "lucide-react";
import api from "../../services/api";
import { canManageUsersAdmin } from "../../utils/adminAccess";
import TermsAndConditionsModal from "../../components/TermsAndConditionsModal";
import TermsConsentField from "../../components/TermsConsentField";
import { resolveTermsScopeFromRole } from "../../utils/termsAndConditions";

const NAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 255;
const PHONE_MAX_LENGTH = 11;
const PASSWORD_MIN_LENGTH = 6;
const NAME_PATTERN = /^[A-Za-z]+(?:[A-Za-z\s'-]*[A-Za-z])?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizePhoneNumber = (value) => value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH);
const limitTextLength = (value, maxLength) => value.slice(0, maxLength);

const validateNameField = (value, label) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) return `${label} is required`;
  if (normalizedValue.length < 2 || normalizedValue.length > NAME_MAX_LENGTH) {
    return `${label} must be between 2 and ${NAME_MAX_LENGTH} characters`;
  }
  if (!NAME_PATTERN.test(normalizedValue)) {
    return `${label} can only contain letters, spaces, apostrophes, and hyphens`;
  }

  return "";
};

const validateEmailField = (value) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) return "Email address is required";
  if (normalizedValue.length > EMAIL_MAX_LENGTH) {
    return `Email address must not exceed ${EMAIL_MAX_LENGTH} characters`;
  }
  if (!EMAIL_PATTERN.test(normalizedValue)) {
    return "Please enter a valid email address";
  }

  return "";
};

const validatePhoneNumber = (value) => (
  /^\d{11}$/.test(value.trim()) ? "" : "Phone number must be exactly 11 digits"
);

function AdminUsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("created_at");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "", last_name: "", email: "", password: "", confirmPassword: "", phone_number: "", role: "customer",
  });
  const [showCreateTerms, setShowCreateTerms] = useState(false);
  const [createTermsAcknowledged, setCreateTermsAcknowledged] = useState(false);
  const [createTermsAccepted, setCreateTermsAccepted] = useState(false);
  const [createTermsError, setCreateTermsError] = useState("");

  const dropdownRef = useRef(null);
  const sortRef = useRef(null);

  const canManageUsers = canManageUsersAdmin(user);
  const createTermsScope = useMemo(
    () => resolveTermsScopeFromRole(user?.role),
    [user?.role]
  );

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Replaced Toast with Modal System
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' });

  const [editForm, setEditForm] = useState({
    email: "", password: "", confirmPassword: "", phone_number: "",
    first_name: "", last_name: "", status: ""
  });

  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);

  useEffect(() => {
    fetchUsersFromDatabase();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowFilterMenu(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setShowSortMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCreateTermsAcknowledged(false);
    setCreateTermsAccepted(false);
    setCreateTermsError("");
  }, [createTermsScope]);

  // Helper to trigger status modal
  const showModalAlert = (type, message) => {
    setStatusModal({ isOpen: true, type, message });
  };

  const resetCreateForm = () => {
    setNewUser({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
      role: "customer",
    });
    setCreateTermsAcknowledged(false);
    setCreateTermsAccepted(false);
    setCreateTermsError("");
  };

  const handleNewUserFieldChange = (field, value) => {
    let nextValue = value;

    if (field === "first_name" || field === "last_name") {
      nextValue = limitTextLength(value, NAME_MAX_LENGTH);
    }

    if (field === "email") {
      nextValue = limitTextLength(value, EMAIL_MAX_LENGTH);
    }

    if (field === "phone_number") {
      nextValue = sanitizePhoneNumber(value);
    }

    setNewUser((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleEditFieldChange = (field, value) => {
    let nextValue = value;

    if (field === "first_name" || field === "last_name") {
      nextValue = limitTextLength(value, NAME_MAX_LENGTH);
    }

    if (field === "email") {
      nextValue = limitTextLength(value, EMAIL_MAX_LENGTH);
      setEmailOtp("");
      setEmailOtpSent(false);
    }

    if (field === "phone_number") {
      nextValue = sanitizePhoneNumber(value);
    }

    if (field === "password") {
      setPasswordOtp("");
      setPasswordOtpSent(false);
    }

    setEditForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const fetchUsersFromDatabase = () => {
    setLoading(true);
    api.get("/users")
      .then((res) => { setUsers(res.data); setError(null); })
      .catch(() => setError("Failed to fetch users"))
      .finally(() => setLoading(false));
  };

  const formatRole = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "owner") return "Owner";
    if (r === "admin") return "Admin";
    if (r === "staff") return "Staff";
    return "Customer";
  };

  const roleToBackend = (uiRole) => uiRole.toLowerCase() === "customer" ? "user" : uiRole.toLowerCase();

  const handleRoleChange = (userId, selectedUiRole) => {
    setUpdatingUserId(userId);
    api.put(`/users/${userId}`, { role: roleToBackend(selectedUiRole) })
      .then((res) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
      })
      .finally(() => setUpdatingUserId(null));
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (filterRole !== "all") result = result.filter((u) => formatRole(u.role).toLowerCase() === filterRole);
    if (filterStatus !== "all") {
      if (filterStatus === "Locked") result = result.filter((u) => u.is_locked);
      else result = result.filter((u) => !u.is_locked && (u.status || "").toLowerCase() === filterStatus.toLowerCase());
    }
    return result.sort((a, b) => {
      if (sortBy === "id") return Number(a.id) - Number(b.id);
      if (sortBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
      return (a[sortBy] || "").toString().localeCompare((b[sortBy] || "").toString());
    });
  }, [users, filterRole, filterStatus, sortBy]);

  const handleUnlockUser = (userId) => {
    api.put(`/users/${userId}`, { is_locked: false })
      .then((res) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
        setShowEditModal(false);
        showModalAlert("success", "Account unlocked successfully");
      });
  };

  const handleDeleteUser = (userId) => {
    api.delete(`/users/${userId}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setShowConfirmDelete(false);
        setShowEditModal(false);
        showModalAlert("success", "User deleted successfully");
      })
      .catch(() => {
        showModalAlert("error", "Failed to delete user");
      });
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email || "", phone_number: user.phone_number || "",
      first_name: user.first_name || "", last_name: user.last_name || "",
      status: user.status || "Active", password: "", confirmPassword: ""
    });
    setEmailOtp("");
    setEmailOtpSent(false);
    setPasswordOtp("");
    setPasswordOtpSent(false);
    setShowEditModal(true);
  };

  const handleCreateUser = () => {
    if (!createTermsAcknowledged || !createTermsAccepted) {
      setCreateTermsError("Please review and accept the applicable Terms & Conditions before creating this account.");
      return;
    }

    const normalizedNewUser = {
      ...newUser,
      first_name: newUser.first_name.trim(),
      last_name: newUser.last_name.trim(),
      email: newUser.email.trim(),
      phone_number: sanitizePhoneNumber(newUser.phone_number),
    };

    const createValidationError =
      validateNameField(normalizedNewUser.first_name, "First name") ||
      validateNameField(normalizedNewUser.last_name, "Last name") ||
      validateEmailField(normalizedNewUser.email) ||
      validatePhoneNumber(normalizedNewUser.phone_number);

    if (createValidationError) {
      showModalAlert("error", createValidationError);
      return;
    }

    if (!normalizedNewUser.password || normalizedNewUser.password.length < PASSWORD_MIN_LENGTH) {
      showModalAlert("error", `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    if (normalizedNewUser.password !== normalizedNewUser.confirmPassword) {
      showModalAlert("error", "Passwords do not match");
      return;
    }

    api.post("/users", {
      first_name: normalizedNewUser.first_name,
      last_name: normalizedNewUser.last_name,
      email: normalizedNewUser.email,
      password: normalizedNewUser.password,
      phone_number: normalizedNewUser.phone_number,
      role: roleToBackend(normalizedNewUser.role),
      status: "Active",
      terms_accepted: true,
      terms_scope: createTermsScope,
    })
      .then((res) => {
        setUsers((prev) => [...prev, res.data.user || res.data]);
        showModalAlert("success", "User created successfully");
        setShowCreateModal(false);
        resetCreateForm();
      })
      .catch((err) => {
        showModalAlert("error", err.response?.data?.error || err.response?.data?.message || "Failed to create user");
      });
  };

  const handleSaveChanges = () => {
    const normalizedEditForm = {
      ...editForm,
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      email: editForm.email.trim(),
      phone_number: sanitizePhoneNumber(editForm.phone_number),
    };

    const editValidationError =
      validateNameField(normalizedEditForm.first_name, "First name") ||
      validateNameField(normalizedEditForm.last_name, "Last name") ||
      validateEmailField(normalizedEditForm.email) ||
      validatePhoneNumber(normalizedEditForm.phone_number);

    if (editValidationError) {
      showModalAlert("error", editValidationError);
      return;
    }

    const emailChanged = normalizedEditForm.email !== selectedUser.email;
    const passwordChanged = normalizedEditForm.password !== "";

    if (passwordChanged && normalizedEditForm.password.length < PASSWORD_MIN_LENGTH) {
      showModalAlert("error", `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }
    if (passwordChanged && normalizedEditForm.password !== normalizedEditForm.confirmPassword) {
      showModalAlert("error", "Passwords do not match");
      return;
    }

    if (emailChanged && !emailOtpSent) {
      sendEmailOtp();
      return;
    }
    if (passwordChanged && !passwordOtpSent) {
      sendPasswordOtp();
      return;
    }
    if ((emailChanged && !emailOtp) || (passwordChanged && !passwordOtp)) {
      showModalAlert("error", "Please enter the OTP codes");
      return;
    }

    setShowConfirmSave(true);
  };

  const sendEmailOtp = async () => {
    const normalizedEmail = editForm.email.trim();
    const emailValidationError = validateEmailField(normalizedEmail);

    if (emailValidationError) {
      showModalAlert("error", emailValidationError);
      return;
    }

    try {
      await api.post(`/users/${selectedUser.id}/email-otp`, { email: normalizedEmail });
      setEmailOtpSent(true);
      showModalAlert("success", "OTP sent to new email address");
    } catch (err) {
      showModalAlert("error", err.response?.data?.message || "Failed to send email OTP");
    }
  };

  const sendPasswordOtp = async () => {
    if (editForm.password.length < PASSWORD_MIN_LENGTH) {
      showModalAlert("error", `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    if (editForm.password !== editForm.confirmPassword) {
      showModalAlert("error", "Passwords do not match");
      return;
    }

    try {
      await api.post(`/users/${selectedUser.id}/password-otp`);
      setPasswordOtpSent(true);
      showModalAlert("success", "OTP sent to user's email");
    } catch (err) {
      showModalAlert("error", err.response?.data?.message || "Failed to send password OTP");
    }
  };

  const confirmSaveChanges = () => {
    const normalizedEditForm = {
      ...editForm,
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      email: editForm.email.trim(),
      phone_number: sanitizePhoneNumber(editForm.phone_number),
    };

    const payload = {
      first_name: normalizedEditForm.first_name,
      last_name: normalizedEditForm.last_name,
      status: normalizedEditForm.status
    };

    if (normalizedEditForm.phone_number !== "") {
      payload.phone_number = normalizedEditForm.phone_number;
    }

    if (normalizedEditForm.email !== selectedUser.email) {
      payload.email = normalizedEditForm.email;
      payload.email_otp = emailOtp.trim();
    }
    if (normalizedEditForm.password) {
      payload.password = normalizedEditForm.password;
      payload.password_otp = passwordOtp.trim();
    }

    api.put(`/users/${selectedUser.id}`, payload)
      .then((res) => {
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? res.data : u)));
        setShowConfirmSave(false);
        setShowEditModal(false);
        setEmailOtp(""); setEmailOtpSent(false);
        setPasswordOtp(""); setPasswordOtpSent(false);
        showModalAlert("success", "User updated successfully");
      })
      .catch((err) => {
        showModalAlert("error", err.response?.data?.error || err.response?.data?.message || "Failed to update user");
      });
  };

  // --- REUSABLE PILL ---
  const StatusPill = ({ u }) => {
    if (u.is_locked) return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">Locked</span>;
    const active = (u.status || "").toLowerCase() === "active";
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
        {u.status || "Inactive"}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col px-8 py-8 bg-white rounded-lg relative font-sans">
      
      {/* HEADER AREA */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-gray-500">Overview of all registered users, staff accounts, and system access levels.</p>
        </div>

        <div className="flex items-center gap-4">
          {canManageUsers && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          )}
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by name or email..." 
             className="w-full bg-slate-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#eaf2ff] transition-all"
           />
        </div>

        <div className="flex gap-3">
          {/* SORT DROPDOWN */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Sort
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSortMenu ? "rotate-180" : ""}`} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in duration-100">
                {["id", "first_name", "email", "created_at"].map((key) => (
                  <button key={key} onClick={() => { setSortBy(key); setShowSortMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-[#eaf2ff] hover:text-[#4f6fa5] rounded-xl capitalize transition-colors">
                    {key.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FILTER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#eaf2ff]"
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilterMenu ? "rotate-180" : ""}`} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in duration-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Filter by Role</p>
                <div className="space-y-1 mb-4">
                  {["all", "admin", "staff", "customer"].map(r => (
                    <button key={r} onClick={() => setFilterRole(r)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${filterRole === r ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"}`}>{r}</button>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Filter by Status</p>
                <div className="space-y-1">
                  {["all", "Active", "Inactive", "Locked"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors ${filterStatus === s ? "bg-[#eaf2ff] text-[#4f6fa5]" : "text-gray-600 hover:bg-gray-50"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div className="flex-1 rounded-[1.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 py-40">
             <Loader2 className="w-8 h-8 animate-spin text-[#4f6fa5]" />
             <span className="text-xs font-bold uppercase tracking-widest">Loading Database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-[#f8fafc]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Registered</th>
                  {canManageUsers && (
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right whitespace-nowrap">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr 
                    key={u.id} 
                    className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => openEditModal(u)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#4f6fa5] font-bold shrink-0">
                          {u.first_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight whitespace-nowrap">{u.first_name} {u.last_name}</p>
                          <p className="text-xs font-medium text-gray-400">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{u.email}</p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">{u.phone_number || "No Phone"}</p>
                    </td>
                    <td className="px-6 py-5">
                       {canManageUsers ? (
                         <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <select 
                              value={formatRole(u.role).toLowerCase()} 
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-transparent border-none text-sm font-bold text-[#4f6fa5] focus:ring-0 p-0 cursor-pointer hover:underline"
                            >
                              <option value="customer">Customer</option>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                         </div>
                       ) : (
                         <span className="text-sm font-bold text-gray-600">{formatRole(u.role)}</span>
                       )}
                    </td>
                    <td className="px-6 py-5">
                      <StatusPill u={u} />
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric'})}
                      </p>
                    </td>
                    {canManageUsers && (
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(u); }}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white border-2 border-amber-500 hover:bg-transparent hover:text-amber-500 transition-all duration-300 shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedUser(u); setShowConfirmDelete(true); }}
                            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white border-2 border-rose-500 hover:bg-transparent hover:text-rose-500 transition-all duration-300 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showCreateModal && canManageUsers && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[300]">
          <div className="bg-white rounded-3xl w-[90%] max-w-lg shadow-2xl border border-white/20 p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-playfair font-bold mb-6 text-gray-900">Add New User</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={newUser.first_name}
                onChange={(e) => handleNewUserFieldChange("first_name", e.target.value)}
                maxLength={NAME_MAX_LENGTH}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={newUser.last_name}
                onChange={(e) => handleNewUserFieldChange("last_name", e.target.value)}
                maxLength={NAME_MAX_LENGTH}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => handleNewUserFieldChange("email", e.target.value)}
                maxLength={EMAIL_MAX_LENGTH}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
              />

              <input
                type="tel"
                placeholder="Phone Number (11 digits)"
                value={newUser.phone_number}
                onChange={(e) => handleNewUserFieldChange("phone_number", e.target.value)}
                maxLength={PHONE_MAX_LENGTH}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="New Password"
                  value={newUser.password}
                  onChange={(e) => handleNewUserFieldChange("password", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={newUser.confirmPassword}
                  onChange={(e) => handleNewUserFieldChange("confirmPassword", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                />
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">System Access Role</p>
                <div className="space-y-2 text-sm">
                  {["customer", "staff", "admin", "owner"].map((role) => (
                    <label key={role} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={newUser.role === role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-4 h-4 text-[#4f6fa5] bg-gray-100 border-gray-300 focus:ring-[#eaf2ff] focus:ring-2"
                      />
                      <span className="font-semibold text-gray-700 capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <TermsConsentField
                scope={createTermsScope}
                checked={createTermsAccepted}
                acknowledged={createTermsAcknowledged}
                onToggle={(checked) => {
                  setCreateTermsAccepted(checked);
                  setCreateTermsError("");
                }}
                onOpen={() => setShowCreateTerms(true)}
                error={createTermsError}
              />
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!createTermsAccepted}
                className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      <TermsAndConditionsModal
        open={showCreateTerms}
        scope={createTermsScope}
        onClose={() => setShowCreateTerms(false)}
        onAcknowledge={() => {
          setCreateTermsAcknowledged(true);
          setCreateTermsAccepted(true);
          setCreateTermsError("");
          setShowCreateTerms(false);
        }}
      />

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[300]">
          <div className="bg-white rounded-3xl w-[90%] max-w-lg shadow-2xl border border-white/20 p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-playfair font-bold text-gray-900">{canManageUsers ? "Edit User Details" : "User Details"}</h2>
               <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                 ID: #{selectedUser.id}
               </span>
            </div>

            <fieldset disabled={!canManageUsers} className="space-y-4 disabled:opacity-100">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={editForm.first_name}
                  onChange={(e) => handleEditFieldChange("first_name", e.target.value)}
                  maxLength={NAME_MAX_LENGTH}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={editForm.last_name}
                  onChange={(e) => handleEditFieldChange("last_name", e.target.value)}
                  maxLength={NAME_MAX_LENGTH}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number (11 digits)"
                value={editForm.phone_number}
                onChange={(e) => handleEditFieldChange("phone_number", e.target.value)}
                maxLength={PHONE_MAX_LENGTH}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
              />

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-2">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Update Email Address</h3>
                <input
                  type="email"
                  placeholder="New Email"
                  value={editForm.email}
                  onChange={(e) => handleEditFieldChange("email", e.target.value)}
                  maxLength={EMAIL_MAX_LENGTH}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all mb-3"
                />

                {editForm.email !== selectedUser.email && !emailOtpSent && (
                  <button
                    onClick={sendEmailOtp}
                    className="w-full rounded-xl bg-[#4f6fa5] px-4 py-3 text-sm font-bold text-white border-2 border-[#4f6fa5] hover:bg-transparent hover:text-[#4f6fa5] transition-all duration-300 shadow-sm"
                  >
                    Send OTP to New Email
                  </button>
                )}

                {emailOtpSent && (
                  <input
                    type="text"
                    placeholder="Enter 6-Digit Email OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all font-mono font-bold tracking-widest text-center"
                  />
                )}
              </div>

              <div className="border-t border-gray-100 pt-5 mt-2">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Reset Security Password</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={editForm.password}
                    onChange={(e) => handleEditFieldChange("password", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={editForm.confirmPassword}
                    onChange={(e) => handleEditFieldChange("confirmPassword", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#4f6fa5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eaf2ff] transition-all"
                  />
                </div>

                {editForm.password && !passwordOtpSent && (
                  <button
                    onClick={sendPasswordOtp}
                    className="w-full rounded-xl bg-[#4f6fa5] px-4 py-3 text-sm font-bold text-white border-2 border-[#4f6fa5] hover:bg-transparent hover:text-[#4f6fa5] transition-all duration-300 shadow-sm"
                  >
                    Send OTP to Current Email
                  </button>
                )}

                {passwordOtpSent && (
                  <input
                    type="text"
                    placeholder="Enter 6-Digit Password OTP"
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value)}
                    className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all font-mono font-bold tracking-widest text-center"
                  />
                )}
              </div>
            </fieldset>

            {selectedUser.is_locked && canManageUsers && (
              <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-100 p-5 flex flex-col items-center text-center">
                <Lock className="w-8 h-8 text-rose-500 mb-2" />
                <p className="font-bold text-rose-900 mb-1">Account Locked</p>
                <p className="text-xs text-rose-700 mb-4">This user has exceeded the maximum number of failed login attempts.</p>
                <button
                  onClick={() => handleUnlockUser(selectedUser.id)}
                  className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white border-2 border-rose-600 hover:bg-transparent hover:text-rose-600 transition-all duration-300 shadow-sm w-full"
                >
                  Unlock Account Access
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-4">
              <div>
                {canManageUsers && (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="text-xs font-bold text-gray-400 hover:text-rose-600 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false); setEmailOtp(""); setEmailOtpSent(false);
                    setPasswordOtp(""); setPasswordOtpSent(false);
                  }}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {canManageUsers ? "Cancel" : "Close"}
                </button>
                {canManageUsers && (
                  <button
                    onClick={handleSaveChanges}
                    className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white border-2 border-gray-900 hover:bg-transparent hover:text-gray-900 transition-all duration-300 shadow-sm"
                  >
                    Save Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Save Modal */}
      {showConfirmSave && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[400]">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
               <ShieldCheck size={28} />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Confirm Updates</h3>
            <p className="text-sm text-gray-500 mb-8 px-2">Are you sure you want to apply these security and profile changes?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowConfirmSave(false)} className="rounded-lg px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={confirmSaveChanges} className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white border-2 border-emerald-500 hover:bg-transparent hover:text-emerald-600 transition-all duration-300 shadow-sm">
                Yes, Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[400]">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
               <Trash2 size={28} />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-8 px-2">This action is irreversible and will permanently remove this account from the system.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowConfirmDelete(false)} className="rounded-lg px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDeleteUser(selectedUser.id)} className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-bold text-white border-2 border-rose-500 hover:bg-transparent hover:text-rose-600 transition-all duration-300 shadow-sm">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STATUS ALERT MODAL (Replaces Toast) --- */}
      {statusModal.isOpen && (
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
      )}
    </div>
  );
}

export default AdminUsersPage;
