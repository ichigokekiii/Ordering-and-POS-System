import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { Loader2 } from "lucide-react";
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import {
  EMAIL_MAX_LENGTH,
  normalizeEmail,
  validateEmail,
} from "../../utils/authValidation";
import { clearFieldError, normalizeApiValidationErrors } from "../../utils/formValidation";

// CMS IMPORTS
import { useContents } from "../../contexts/ContentContext";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import { getCmsField, getCmsAssetUrl, getContentValue as getCmsContentValue } from "../../cms/cmsRegistry";

function ForgotPasswordPage({ cmsPreview }) {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "" });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  // CMS HELPERS
  const contentContext = useContents();
  const contents = contentContext?.contents || [];
  const getContentValue = (identifier, fallback = "") => getCmsContentValue(contents, "auth", identifier, fallback);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cmsPreview?.enabled) return;
    const normalizedEmail = normalizeEmail(email);

    const nextFieldErrors = {
      email: validateEmail(normalizedEmail),
    };

    setFieldErrors(nextFieldErrors);
    setFormError("");

    if (Object.values(nextFieldErrors).some(Boolean)) {
      return;
    }

    setEmail(normalizedEmail);
    setLoading(true);

    try {
      await api.post("/forgot-password", { email: normalizedEmail });
      navigate("/verify-otp", {
        state: { email: normalizedEmail, purpose: "reset-password" }
      });
    } catch (err) {
      const normalizedError = normalizeApiValidationErrors(err);
      setFieldErrors((prev) => ({ ...prev, ...normalizedError.fieldErrors }));
      setFormError(normalizedError.formError || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
      <div className="w-full max-w-4xl min-h-[520px] md:min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL - CMS Editable Image & Title */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gray-200">
          <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_forgot_image")} className="absolute inset-0 w-full h-full">
            <img 
              src={getCmsAssetUrl(getContentValue("auth_forgot_image", "https://images.unsplash.com/photo-1555949963-aa79dcee981c"))}
              alt="Forgot Password decoration"
              className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110"
            />
          </CmsEditableRegion>
          
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-12 text-center backdrop-blur-[3px] pointer-events-none">
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_forgot_title")} className="inline-block w-fit pointer-events-auto mb-4">
               <h2 className="text-4xl font-bold font-sans tracking-tight">{getContentValue("auth_forgot_title", "Account Recovery")}</h2>
            </CmsEditableRegion>
            
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_forgot_subtitle")} className="inline-block w-fit pointer-events-auto mb-8">
              <p className="text-blue-50 leading-relaxed max-w-sm text-lg">
                 {getContentValue("auth_forgot_subtitle", "Enter your email and we'll help you get back into your account safely.")}
              </p>
            </CmsEditableRegion>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 relative z-10 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 tracking-tight">Forgot Password</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Please enter your registered email address. We'll send you a 6-digit OTP to verify your identity.
          </p>

          {formError && <p className="mb-6 text-sm text-red-500 bg-red-50 py-3 px-4 rounded-lg border border-red-100">{formError}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <FormFieldHeader label="Email Address" required error={fieldErrors.email} />
              <input
                type="email"
                className={getValidationInputClassName({
                  hasError: !!fieldErrors.email,
                  baseClassName:
                    "w-full rounded-xl border px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 transition-all shadow-sm",
                })}
                placeholder="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError(setFieldErrors, "email");
                  setFormError("");
                }}
                maxLength={EMAIL_MAX_LENGTH}
                required
                disabled={loading}
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#4f6fa5] py-3.5 text-white font-semibold hover:bg-[#3f5b89] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Send OTP
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" onClick={(event) => cmsPreview?.enabled && event.preventDefault()} className="text-sm text-[#4f6fa5] font-semibold hover:underline inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
