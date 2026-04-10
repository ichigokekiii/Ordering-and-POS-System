/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import api from "../../services/api";
import TermsAndConditionsModal from "../../components/TermsAndConditionsModal";
import TermsConsentField from "../../components/TermsConsentField";
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import { TERMS_SCOPE } from "../../utils/termsAndConditions";
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  normalizeEmail,
  normalizeName,
  normalizePhoneNumber,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhoneNumber,
} from "../../utils/authValidation";
import {
  clearFieldError,
  focusFirstInvalidField,
  normalizeApiValidationErrors,
} from "../../utils/formValidation";

// CMS IMPORTS
import { useContents } from "../../contexts/ContentContext";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import { getCmsField, getCmsAssetUrl, getContentValue as getCmsContentValue } from "../../cms/cmsRegistry";

function AuthPage({ onLogin, initialView = "login", cmsPreview }) {
  const navigate = useNavigate();
  const location = useLocation();

  const startingMode = location.state?.mode || initialView;
  const [isSignIn, setIsSignIn] = useState(startingMode === "login");

  // --- CMS HELPERS ---
  const contentContext = useContents();
  const contents = contentContext?.contents || [];
  const getContentValue = (identifier, fallback = "") => getCmsContentValue(contents, "auth", identifier, fallback);

  // =====================
  // LOGIN STATE
  // =====================
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginFormError, setLoginFormError] = useState("");
  const [loginFieldErrors, setLoginFieldErrors] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  // =====================
  // REGISTER STATE
  // =====================
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [regTermsAcknowledged, setRegTermsAcknowledged] = useState(false);
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [regFormError, setRegFormError] = useState("");
  const [regPhoneError, setRegPhoneError] = useState("");
  const [regFieldErrors, setRegFieldErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });
  const [regLoading, setRegLoading] = useState(false);

  const loginEmailRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const regFirstNameRef = useRef(null);
  const regLastNameRef = useRef(null);
  const regEmailRef = useRef(null);
  const regPhoneRef = useRef(null);
  const regPasswordRef = useRef(null);
  const regConfirmPasswordRef = useRef(null);

  // =====================
  // LOGIN COUNTDOWN TICKER
  // =====================
  useEffect(() => {
    if (countdown <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setLoginFormError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [countdown]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // =====================
  // HANDLERS
  // =====================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (cmsPreview?.enabled) return;
    if (countdown > 0 || isLocked) return;

    const normalizedEmail = normalizeEmail(loginEmail);
    const nextFieldErrors = {
      email: validateEmail(normalizedEmail),
      password: validatePassword(loginPassword),
    };

    setLoginFieldErrors(nextFieldErrors);
    setLoginFormError("");
    setAttemptsLeft(null);

    if (Object.values(nextFieldErrors).some(Boolean)) {
      focusFirstInvalidField(
        {
          email: loginEmailRef,
          password: loginPasswordRef,
        },
        nextFieldErrors
      );
      return;
    }

    setLoginEmail(normalizedEmail);
    setLoginLoading(true);

    try {
      const res = await api.post("/login", {
        email: normalizedEmail,
        password: loginPassword,
      });

      const loggedInUser = res.data.user || res.data;

      localStorage.setItem("pendingUser", JSON.stringify(loggedInUser));
      navigate("/verify-otp", { state: { email: normalizedEmail, from: 'login' } });
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;

      if (status === 423 || data?.locked) {
        setIsLocked(true);
        setLoginFormError(data?.message || "Your account has been locked. Please contact an administrator.");
        setAttemptsLeft(null);
      } else if (status === 429 || data?.cooldown) {
        const secs = data?.remaining_seconds ?? 120;
        setCountdown(secs);
        setAttemptsLeft(null);
        setLoginFormError("");
      } else if (status === 401) {
        setLoginFormError("Invalid email or password.");
        if (data?.attempts_left !== undefined) {
          setAttemptsLeft(Math.max(0, data.attempts_left));
        }
      } else {
        const normalizedError = normalizeApiValidationErrors(err);
        setLoginFieldErrors((prev) => ({ ...prev, ...normalizedError.fieldErrors }));
        setLoginFormError(normalizedError.formError || data?.message || "Invalid credentials.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (cmsPreview?.enabled) return;
    setRegFormError("");
    setRegFieldErrors((prev) => ({ ...prev, terms: "" }));

    const normalizedFirstName = normalizeName(regFirstName);
    const normalizedLastName = normalizeName(regLastName);
    const normalizedEmail = normalizeEmail(regEmail);
    const normalizedPhone = normalizePhoneNumber(regPhone);

    // 1. Validate Names (No Symbols or Numbers)
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (!nameRegex.test(normalizedFirstName) || !nameRegex.test(normalizedLastName)) {
      setRegFormError("Names can only contain letters, spaces, and hyphens.");
      return;
    }

    // 2. Validate Phone Number (Exactly 11 digits)
    if (normalizedPhone.length !== 11) {
      setRegFormError("Phone number must be exactly 11 digits.");
      return;
    }

    // 3. Validate Password strength
    if (regPassword.length < 8) {
      setRegFormError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(regPassword)) {
      setRegFormError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(regPassword)) {
      setRegFormError("Password must contain at least one number.");
      return;
    }

    // 4. Validate Passwords match
    if (regPassword !== regConfirmPassword) {
      setRegFormError("Passwords do not match.");
      return;
    }

    if (!regTermsAcknowledged || !regTermsAccepted) {
      setRegFieldErrors((prev) => ({ ...prev, terms: "Please review and accept the Customer Terms & Conditions before continuing." }));
      return;
    }

    setRegFirstName(normalizedFirstName);
    setRegLastName(normalizedLastName);
    setRegEmail(normalizedEmail);
    setRegPhone(normalizedPhone);
    setRegLoading(true);

    try {
      await api.post("/register", {
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: normalizedEmail,
        password: regPassword,
        phone_number: normalizedPhone,
        terms_accepted: true,
        terms_scope: TERMS_SCOPE.CUSTOMER,
      });

      navigate("/verify-otp", { state: { email: normalizedEmail, from: 'register' } });
    } catch (err) {
      const normalizedError = normalizeApiValidationErrors(err, {
        terms_accepted: "terms",
      });

      setRegFieldErrors((prev) => ({ ...prev, ...normalizedError.fieldErrors }));
      setRegFormError(normalizedError.formError || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const isCoolingDown = countdown > 0;
  const loginFormDisabled = isCoolingDown || isLocked || loginLoading;

  // Password strength indicators for register
  const regPasswordStrength = {
    length: regPassword.length >= 8,
    uppercase: /[A-Z]/.test(regPassword),
    number: /[0-9]/.test(regPassword),
    match: regConfirmPassword.length > 0 && regPassword === regConfirmPassword,
  };

  return (
    <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
      {/* Reduced min-height slightly to make it feel more compact */}
      <div className="relative overflow-hidden w-full max-w-4xl min-h-[500px] md:min-h-[560px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row">
        
        {/* REGISTER FORM */}
        {/* Reduced vertical padding (py-10 -> py-6) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-6 order-2 md:order-none z-0 mt-16 md:mt-0 relative">
          <div className={`md:hidden ${!isSignIn ? 'block' : 'hidden'}`}></div>
          <div className="w-full pt-2 pb-6 md:pt-0" style={{ pointerEvents: !isSignIn ? 'auto' : 'none' }}>
            {/* Reduced margin bottom on title */}
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Create Account</h2>
            {regFormError && <p className="mb-4 text-xs font-semibold text-red-500 bg-red-50 py-2 px-3 rounded border border-red-200">{regFormError}</p>}
            
            {/* Tightened form gaps (space-y-4 -> space-y-3) */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="flex gap-2">
                <div className="w-full">
                  <FormFieldHeader label="First Name" required error={regFieldErrors.first_name} />
                  <input
                    ref={regFirstNameRef}
                    className={getValidationInputClassName({
                      hasError: !!regFieldErrors.first_name,
                      // Reduced input padding to save vertical space
                      baseClassName: "w-full rounded-lg border px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all",
                    })}
                    placeholder="First Name"
                    value={regFirstName}
                    onChange={(e) => {
                      setRegFirstName(e.target.value);
                      clearFieldError(setRegFieldErrors, "first_name");
                    }}
                    maxLength={NAME_MAX_LENGTH}
                    required
                  />
                </div>
                <div className="w-full">
                  <FormFieldHeader label="Last Name" required error={regFieldErrors.last_name} />
                  <input
                    ref={regLastNameRef}
                    className={getValidationInputClassName({
                      hasError: !!regFieldErrors.last_name,
                      baseClassName: "w-full rounded-lg border px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all",
                    })}
                    placeholder="Last Name"
                    value={regLastName}
                    onChange={(e) => {
                      setRegLastName(e.target.value);
                      clearFieldError(setRegFieldErrors, "last_name");
                    }}
                    maxLength={NAME_MAX_LENGTH}
                    required
                  />
                </div>
              </div>
              <div>
                <FormFieldHeader label="Email Address" required error={regFieldErrors.email} />
                <input
                  ref={regEmailRef}
                  type="email"
                  className={getValidationInputClassName({
                    hasError: !!regFieldErrors.email,
                    baseClassName: "w-full rounded-lg border px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all",
                  })}
                  placeholder="Email Address"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    clearFieldError(setRegFieldErrors, "email");
                  }}
                  maxLength={EMAIL_MAX_LENGTH}
                  required
                />
              </div>
              <div>
                <FormFieldHeader label="Phone Number" required error={regFieldErrors.phone_number} />
                <input
                  ref={regPhoneRef}
                  type="tel"
                  inputMode="numeric"
                  className={getValidationInputClassName({
                    hasError: !!regFieldErrors.phone_number,
                    baseClassName: "w-full rounded-lg border px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all",
                  })}
                  placeholder="09123456789"
                  value={regPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH);
                    setRegPhone(value);
                    clearFieldError(setRegFieldErrors, "phone_number");
                    
                    if (value.length === 0) {
                      setRegPhoneError("");
                    } else if (value.length < 11) {
                      setRegPhoneError(`Phone number must be exactly 11 digits (${11 - value.length} more needed)`);
                    } else {
                      setRegPhoneError("");
                    }
                  }}
                  maxLength={PHONE_MAX_LENGTH}
                  required
                />
                {regPhoneError && (
                  <p className="text-xs text-amber-600 px-1 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-500" />
                    {regPhoneError}
                  </p>
                )}
              </div>
              
              <div>
                <FormFieldHeader label="Password" required error={regFieldErrors.password} />
                <input
                  ref={regPasswordRef}
                  type="password"
                  className={getValidationInputClassName({
                    hasError: !!regFieldErrors.password,
                    baseClassName: "w-full rounded-lg border px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all",
                  })}
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    clearFieldError(setRegFieldErrors, "password");
                  }}
                  required
                />
              </div>
              
              <div>
                <FormFieldHeader label="Confirm Password" required error={regFieldErrors.confirmPassword} />
                <input
                  ref={regConfirmPasswordRef}
                  type="password"
                  className={getValidationInputClassName({
                    hasError: !!regFieldErrors.confirmPassword,
                    baseClassName: "w-full rounded-lg border px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all",
                  })}
                  placeholder="Confirm Password"
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    clearFieldError(setRegFieldErrors, "confirmPassword");
                  }}
                  required
                />
              </div>

              {/* Password strength hints */}
              {regPassword.length > 0 && (
                <ul className="text-xs space-y-1 px-1">
                  <li className={`flex items-center gap-1.5 ${regPasswordStrength.length ? "text-emerald-600" : "text-gray-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${regPasswordStrength.length ? "bg-emerald-500" : "bg-gray-300"}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-1.5 ${regPasswordStrength.uppercase ? "text-emerald-600" : "text-gray-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${regPasswordStrength.uppercase ? "bg-emerald-500" : "bg-gray-300"}`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-1.5 ${regPasswordStrength.number ? "text-emerald-600" : "text-gray-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${regPasswordStrength.number ? "bg-emerald-500" : "bg-gray-300"}`} />
                    One number
                  </li>
                  <li className={`flex items-center gap-1.5 ${regPasswordStrength.match ? "text-emerald-600" : "text-gray-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${regPasswordStrength.match ? "bg-emerald-500" : "bg-gray-300"}`} />
                    Passwords match
                  </li>
                </ul>
              )}

              <TermsConsentField
                scope={TERMS_SCOPE.CUSTOMER}
                checked={regTermsAccepted}
                acknowledged={regTermsAcknowledged}
                onToggle={(checked) => {
                  setRegTermsAccepted(checked);
                  clearFieldError(setRegFieldErrors, "terms");
                }}
                onOpen={() => setShowTerms(true)}
                error={regFieldErrors.terms}
              />

              <button
                disabled={regLoading || !regTermsAccepted}
                className="w-full mt-2 rounded-lg bg-[#4f6fa5] py-2.5 text-sm text-white font-semibold transition-all hover:bg-[#3f5b89] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {regLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign Up
              </button>
            </form>

            <p className="mt-4 md:hidden text-gray-600 text-sm">
              Already have an account? <button type="button" onClick={() => setIsSignIn(true)} className="text-[#4f6fa5] font-semibold hover:underline">Log In</button>
            </p>
          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-12 py-6 bg-white z-0 mt-16 md:mt-0" style={{ opacity: (!isSignIn && window.innerWidth < 768) ? 0 : 1, pointerEvents: isSignIn ? 'auto' : 'none' }}>
          <div className="w-full pt-8 pb-6 text-center md:pt-0">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Login to Account</h2>

            {isLocked && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-left">
                🔒 <strong>Account Locked.</strong> Your account has been locked due to too many failed login attempts.
              </div>
            )}
            {isCoolingDown && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 text-left">
                <p className="font-semibold">Too many failed attempts.</p>
                <p>Wait <span className="font-mono font-bold">{formatCountdown(countdown)}</span> before retrying.</p>
              </div>
            )}
            {loginFormError && !isLocked && !isCoolingDown && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-left">
                <p>{loginFormError}</p>
                {attemptsLeft !== null && attemptsLeft > 0 && (
                  <p className="mt-1 font-semibold text-xs text-red-800">
                    ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining.
                  </p>
                )}
              </div>
            )}

            {/* Tightened form gaps and padding */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <FormFieldHeader label="Email Address" required error={loginFieldErrors.email} />
                <input
                  ref={loginEmailRef}
                  type="email"
                  className={getValidationInputClassName({
                    hasError: !!loginFieldErrors.email,
                    baseClassName: "w-full rounded-lg border px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:bg-gray-100",
                  })}
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    clearFieldError(setLoginFieldErrors, "email");
                    setLoginFormError("");
                  }}
                  maxLength={EMAIL_MAX_LENGTH}
                  disabled={loginFormDisabled}
                  required
                />
              </div>
              <div>
                <FormFieldHeader label="Password" required error={loginFieldErrors.password} />
                <input
                  ref={loginPasswordRef}
                  type="password"
                  className={getValidationInputClassName({
                    hasError: !!loginFieldErrors.password,
                    baseClassName: "w-full rounded-lg border px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:bg-gray-100",
                  })}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    clearFieldError(setLoginFieldErrors, "password");
                    setLoginFormError("");
                  }}
                  disabled={loginFormDisabled}
                  required
                />
              </div>

              <div className="text-right">
                <Link to="/forgot-password" onClick={(event) => cmsPreview?.enabled && event.preventDefault()} className="text-sm text-[#4f6fa5] font-medium hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                disabled={loginFormDisabled}
                className="w-full mt-4 rounded-lg bg-[#4f6fa5] py-4 text-lg text-white font-semibold transition-all hover:bg-[#3f5b89] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isCoolingDown ? `Wait ${formatCountdown(countdown)}` : "Login"}
              </button>
            </form>

            <p className="mt-6 md:hidden text-gray-600 text-sm">
              Don't have an account? <button type="button" onClick={() => setIsSignIn(false)} className="text-[#4f6fa5] font-semibold hover:underline">Sign Up</button>
            </p>
          </div>
        </div>

        {/* OVERLAY CONTAINER (SLIDES LEFT/RIGHT) */}
        <motion.div
          className="absolute top-0 w-1/2 h-full z-20 hidden md:flex items-center justify-center overflow-hidden"
          animate={{ x: isSignIn ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Picture shown when Login active (Overlay covers Register on the LEFT) */}
          <motion.div 
            className="absolute inset-0 w-full h-full"
            animate={{ opacity: isSignIn ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ pointerEvents: isSignIn ? 'auto' : 'none', zIndex: isSignIn ? 10 : 0 }}
          >
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_login_image")} className="absolute inset-0 w-full h-full">
              <img 
                src={getCmsAssetUrl(getContentValue("auth_login_image", "https://images.unsplash.com/photo-1490750967868-88cb4aca2033"))}
                alt="Decorative flowers"
                className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110"
              />
            </CmsEditableRegion>
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-12 text-center backdrop-blur-[3px] pointer-events-none">
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_login_title")} className="inline-block w-fit pointer-events-auto mb-4">
                <h2 className="text-4xl font-bold font-sans tracking-tight">{getContentValue("auth_login_title", "New Here?")}</h2>
              </CmsEditableRegion>
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_login_subtitle")} className="inline-block w-fit pointer-events-auto mb-6">
                <p className="text-blue-50 leading-relaxed max-w-sm text-base">
                  {getContentValue("auth_login_subtitle", "Enter your personal details and start your journey with us.")}
                </p>
              </CmsEditableRegion>
              <button 
                onClick={() => setIsSignIn(false)} 
                type="button"
                className="relative z-10 border-2 border-white/80 rounded-full px-12 py-3 font-semibold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </motion.div>

          {/* Picture shown when Register active (Overlay covers Login on the RIGHT) */}
          <motion.div 
            className="absolute inset-0 w-full h-full"
            animate={{ opacity: isSignIn ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            style={{ pointerEvents: !isSignIn ? 'auto' : 'none', zIndex: !isSignIn ? 10 : 0 }}
          >
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_register_image")} className="absolute inset-0 w-full h-full">
              <img 
                src={getCmsAssetUrl(getContentValue("auth_register_image", "https://images.unsplash.com/photo-1460500063983-994d4c2b9f53"))}
                alt="Decorative vase flowers"
                className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110"
              />
            </CmsEditableRegion>
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-10 text-center backdrop-blur-[3px] pointer-events-none">
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_register_title")} className="inline-block w-fit pointer-events-auto mb-4">
                <h2 className="text-4xl font-bold font-sans tracking-tight">{getContentValue("auth_register_title", "Welcome Back!")}</h2>
              </CmsEditableRegion>
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_register_subtitle")} className="inline-block w-fit pointer-events-auto mb-6">
                <p className="text-blue-50 leading-relaxed max-w-sm text-base">
                  {getContentValue("auth_register_subtitle", "To keep connected with us please login with your registered personal info.")}
                </p>
              </CmsEditableRegion>
              <button 
                type="button"
                onClick={() => setIsSignIn(true)} 
                className="relative z-10 border-2 border-white/80 rounded-full px-12 py-3 font-semibold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </motion.div>

      </div>

      <TermsAndConditionsModal
        open={showTerms}
        scope={TERMS_SCOPE.CUSTOMER}
        onClose={() => setShowTerms(false)}
        onAcknowledge={() => {
          setRegTermsAcknowledged(true);
          setRegTermsAccepted(true);
          clearFieldError(setRegFieldErrors, "terms");
          setShowTerms(false);
        }}
      />
    </div>
  );
}

export default AuthPage;