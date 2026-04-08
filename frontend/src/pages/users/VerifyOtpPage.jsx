import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import api from "../../services/api";

// CMS IMPORTS
import { useContents } from "../../contexts/ContentContext";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import { getCmsField, getCmsAssetUrl, getContentValue as getCmsContentValue } from "../../cms/cmsRegistry";

function VerifyOtpPage({ cmsPreview }) {
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  // CMS HELPERS
  const contentContext = useContents();
  const contents = contentContext?.contents || [];
  const getContentValue = (identifier, fallback = "") => getCmsContentValue(contents, "auth", identifier, fallback);

  // When in preview, act as if there is an email so the form renders
  const email = location.state?.email || localStorage.getItem("otp_email") || (cmsPreview?.enabled ? "user@example.com" : null);
  const purpose = location.state?.purpose;
  const from = location.state?.from || "login";

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpArray];
    if (value.length > 1) {
      const pasted = value.split("").slice(0, 6);
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtpArray(newOtp);
      setOtp(newOtp.join(""));
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    newOtp[index] = value;
    setOtpArray(newOtp);
    setOtp(newOtp.join(""));
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (cmsPreview?.enabled) return;
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/verify-otp", { email, otp });
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (!res.data.token) {
        setError("Authentication failed. Please try logging in again.");
        setLoading(false);
        return;
      }
      let userData = null;
      const pendingUser = localStorage.getItem("pendingUser");
      if (pendingUser) {
        userData = JSON.parse(pendingUser);
        localStorage.removeItem("pendingUser");
        setModalMessage("Login verified! Logging you in...");
      } else {
        userData = res.data.user;
        setModalMessage("Account verified successfully! Logging you in...");
      }
      if (purpose === "reset-password") {
        setModalMessage("OTP verified! Redirecting to reset password...");
        setShowModal(true);
        setTimeout(() => {
          navigate("/reset-password", { state: { email, otp } });
        }, 1500);
        return;
      }
      handleLogin(userData);
      localStorage.removeItem("otp_email");
      setShowModal(true);
      const role = (userData?.role || "").toLowerCase();
      setTimeout(() => {
        if (role === "admin" || role === "owner") navigate("/admin");
        else if (role === "staff") navigate("/staff");
        else navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || cmsPreview?.enabled) return;
    setResendLoading(true);
    setError("");
    try {
      await api.post("/resend-otp", { email });
      setCountdown(60);
      setModalMessage("OTP resent successfully!");
      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email && !cmsPreview?.enabled) {
    localStorage.removeItem("otp_email");
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Session expired</h2>
          <p className="mb-6 text-sm text-gray-600">Please register or log in again.</p>
          <button onClick={() => navigate("/login")} className="w-full rounded-lg bg-[#4f6fa5] py-3 text-white hover:bg-[#3f5b89] transition-all">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
      <div className={`w-full max-w-4xl min-h-[520px] md:min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden ${from === 'register' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        
        {/* IMAGE PANEL */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gray-200">
           <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_verify_image")} className="absolute inset-0 w-full h-full">
             <img 
               src={getCmsAssetUrl(getContentValue("auth_verify_image", from === "login" ? "https://images.unsplash.com/photo-1490750967868-88cb4aca2033" : "https://images.unsplash.com/photo-1460500063983-994d4c2b9f53"))}
               alt="Authentication decoration"
               className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110"
             />
           </CmsEditableRegion>
           <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-10 text-center backdrop-blur-[3px] pointer-events-none">
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_verify_title")} className="inline-block w-fit pointer-events-auto mb-4">
                <h2 className="text-3xl font-bold font-sans tracking-tight">{getContentValue("auth_verify_title", "Verification Required")}</h2>
              </CmsEditableRegion>
              <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_verify_subtitle")} className="inline-block w-fit pointer-events-auto mb-8">
                <p className="text-blue-50 leading-relaxed text-lg">
                  {getContentValue("auth_verify_subtitle", "Please confirm your identity to get secure access to your account and continue your journey.")}
                </p>
              </CmsEditableRegion>
           </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 relative z-10 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 tracking-tight">Enter OTP Code</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Please enter the OTP code sent to your registered email address <br/>
            <strong className="text-gray-700">{email}</strong>
          </p>

          {error && <p className="mb-6 text-sm text-red-500 bg-red-50 py-3 px-4 rounded-lg border border-red-100">{error}</p>}

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex gap-2 justify-between w-full max-w-sm mx-auto">
              {otpArray.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="w-11 h-14 sm:w-12 sm:h-16 rounded-xl border border-gray-300 text-center text-xl font-bold focus:bg-white bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4f6fa5] focus:border-transparent transition-all shadow-sm mx-auto"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full rounded-xl bg-[#4f6fa5] py-3.5 text-white font-semibold hover:bg-[#3f5b89] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              Verify OTP
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium">
            {countdown > 0 ? (
              <p className="text-gray-400">
                Didn't receive it? Resend in <span className="text-gray-600 font-semibold">{countdown}s</span>
              </p>
            ) : (
              <p className="text-gray-500">
                Didn't receive it?{" "}
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-[#4f6fa5] hover:underline font-bold disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {resendLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  Resend OTP
                </button>
              </p>
            )}
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => navigate("/login")} className="text-sm text-[#4f6fa5] font-semibold hover:underline inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xs transform rounded-2xl bg-white p-6 text-center shadow-2xl drop-shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">Success</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">{modalMessage}</p>
            {modalMessage.includes("Redirecting") || modalMessage.includes("Logging") ? (
               <div className="flex justify-center mb-2">
                 <Loader2 className="h-6 w-6 animate-spin text-[#4f6fa5]" />
               </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyOtpPage;