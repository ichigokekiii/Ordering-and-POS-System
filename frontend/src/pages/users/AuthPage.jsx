/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import api from "../../services/api";

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
  const [loginError, setLoginError] = useState("");
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
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

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
          setLoginError("");
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
    if (cmsPreview?.enabled) return; // Prevent API calls in CMS preview
    if (countdown > 0 || isLocked) return;

    setLoginError("");
    setAttemptsLeft(null);
    setLoginLoading(true);

    try {
      const res = await api.post("/login", {
        email: loginEmail,
        password: loginPassword,
      });

      const loggedInUser = res.data.user || res.data;

      try {
        await api.post("/resend-otp", { email: loginEmail });
      } catch (otpErr) {
        console.warn("OTP sending failed", otpErr);
      }

      localStorage.setItem("pendingUser", JSON.stringify(loggedInUser));
      navigate("/verify-otp", { state: { email: loginEmail, from: 'login' } });
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;

      if (status === 423 || data?.locked) {
        setIsLocked(true);
        setLoginError(data?.message || "Your account has been locked. Please contact an administrator.");
        setAttemptsLeft(null);
      } else if (status === 429 || data?.cooldown) {
        const secs = data?.remaining_seconds ?? 120;
        setCountdown(secs);
        setAttemptsLeft(null);
        setLoginError("");
      } else if (status === 401) {
        setLoginError("Invalid email or password.");
        if (data?.attempts_left !== undefined) {
          setAttemptsLeft(Math.max(0, data.attempts_left));
        }
      } else {
        setLoginError(data?.message || "Invalid credentials.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (cmsPreview?.enabled) return;
    setRegError("");

    // 1. Validate Names (No Symbols or Numbers)
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (!nameRegex.test(regFirstName) || !nameRegex.test(regLastName)) {
      setRegError("Names can only contain letters, spaces, and hyphens.");
      return;
    }

    // 2. Validate Phone Number (Exactly 11 digits)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(regPhone)) {
      setRegError("Phone number must be exactly 11 digits (e.g. 09123456789).");
      return;
    }

    // 3. Validate Passwords
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    setRegLoading(true);

    try {
      await api.post("/register", {
        first_name: regFirstName,
        last_name: regLastName,
        email: regEmail,
        password: regPassword,
        phone_number: regPhone,
      });

      navigate("/verify-otp", { state: { email: regEmail, from: 'register' } });
    } catch (err) {
      setRegError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const isCoolingDown = countdown > 0;
  const loginFormDisabled = isCoolingDown || isLocked || loginLoading;

  return (
    <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
      <div className="relative overflow-hidden w-full max-w-4xl min-h-[520px] md:min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row">
        
        {/* REGISTER FORM */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 order-2 md:order-none z-0 mt-20 md:mt-0 relative">
          <div className={`md:hidden ${!isSignIn ? 'block' : 'hidden'}`}></div>
          <div className="w-full pt-4 pb-8 md:pt-0" style={{ pointerEvents: !isSignIn ? 'auto' : 'none' }}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Account</h2>
            {regError && <p className="mb-4 text-sm text-red-500 bg-red-50 py-2 px-3 rounded border border-red-200">{regError}</p>}
            
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all"
                  placeholder="First Name"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  required
                />
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all"
                  placeholder="Last Name"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  required
                />
              </div>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all"
                placeholder="Email Address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all"
                placeholder="Phone Number e.g. 09123456789"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all"
                placeholder="Confirm Password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
              />

              <button
                disabled={regLoading}
                className="w-full mt-2 rounded-lg bg-[#4f6fa5] py-3 text-white font-semibold transition-all hover:bg-[#3f5b89] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {regLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                Sign Up
              </button>
            </form>

            <p className="mt-6 md:hidden text-gray-600 text-sm">
              Already have an account? <button type="button" onClick={() => setIsSignIn(true)} className="text-[#4f6fa5] font-semibold hover:underline">Log In</button>
            </p>
          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-12 bg-white z-0 mt-20 md:mt-0" style={{ opacity: (!isSignIn && window.innerWidth < 768) ? 0 : 1, pointerEvents: isSignIn ? 'auto' : 'none' }}>
          <div className="w-full pt-10 pb-8 text-center md:pt-0">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Login to Account</h2>

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
            {loginError && !isLocked && !isCoolingDown && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-left">
                <p>{loginError}</p>
                {attemptsLeft !== null && attemptsLeft > 0 && (
                  <p className="mt-1 font-semibold text-xs text-red-800">
                    ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining.
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all disabled:opacity-60 disabled:bg-gray-100"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loginFormDisabled}
              />
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-4 py-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all disabled:opacity-60 disabled:bg-gray-100"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loginFormDisabled}
              />

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
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_login_subtitle")} className="inline-block w-fit pointer-events-auto mb-8">
                <p className="text-blue-50 leading-relaxed max-w-sm text-lg">
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
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-12 text-center backdrop-blur-[3px] pointer-events-none">
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_register_title")} className="inline-block w-fit pointer-events-auto mb-4">
                <h2 className="text-4xl font-bold font-sans tracking-tight">{getContentValue("auth_register_title", "Welcome Back!")}</h2>
              </CmsEditableRegion>
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_register_subtitle")} className="inline-block w-fit pointer-events-auto mb-8">
                <p className="text-blue-50 leading-relaxed max-w-sm text-lg">
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
    </div>
  );
}

export default AuthPage;