import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../services/api";
import FormFieldHeader from "../../components/form/FormFieldHeader";
import { getValidationInputClassName } from "../../components/form/fieldStyles";
import {
  PASSWORD_MIN_LENGTH,
  validatePassword,
  validatePasswordConfirmation,
} from "../../utils/authValidation";
import { clearFieldError, normalizeApiValidationErrors } from "../../utils/formValidation";

// CMS IMPORTS
import { useContents } from "../../contexts/ContentContext";
import CmsEditableRegion from "../../components/admin/CmsEditableRegion";
import { getCmsField, getCmsAssetUrl, getContentValue as getCmsContentValue } from "../../cms/cmsRegistry";

function ResetPasswordPage({ cmsPreview }) {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || (cmsPreview?.enabled ? "user@example.com" : null);
  const otp = location.state?.otp || (cmsPreview?.enabled ? "123456" : null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ password: "", confirmPassword: "" });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // CMS HELPERS
  const contentContext = useContents();
  const contents = contentContext?.contents || [];
  const getContentValue = (identifier, fallback = "") => getCmsContentValue(contents, "auth", identifier, fallback);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cmsPreview?.enabled) return;
    setFormError("");

    if (!email || !otp) {
      setFormError("Your reset session expired. Please request a new OTP.");
      return;
    }

    const nextFieldErrors = {
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };

    setFieldErrors(nextFieldErrors);

    if (Object.values(nextFieldErrors).some(Boolean)) {
      return;
    }

    setLoading(true);

    try {
      await api.post("/reset-password", {
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      });

      setModalMessage("Password reset successful! Redirecting to login...");
      setShowModal(true);

      setTimeout(() => {
        navigate("/login", {
          state: {
            mode: "login",
          },
        });
      }, 1500);
    } catch (err) {
      const normalizedError = normalizeApiValidationErrors(err, {
        password_confirmation: "confirmPassword",
      });
      setFieldErrors((prev) => ({ ...prev, ...normalizedError.fieldErrors }));
      setFormError(normalizedError.formError || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!email && !cmsPreview?.enabled) {
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Session expired</h2>
          <p className="mb-6 text-sm text-gray-600">Please request a new password reset OTP.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full rounded-lg bg-[#4f6fa5] py-3 text-white hover:bg-[#3f5b89] transition-all"
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf9] flex items-start justify-center pt-10 pb-4">
      <div className="w-full max-w-4xl min-h-[520px] md:min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden md:flex-row">
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gray-200">
          <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_reset_image")} className="absolute inset-0 w-full h-full">
            <img
              src={getCmsAssetUrl(getContentValue("auth_reset_image", "https://images.unsplash.com/photo-1490750967868-88cb4aca2033"))}
              alt="Reset password decoration"
              className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110"
            />
          </CmsEditableRegion>
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-10 text-center backdrop-blur-[3px] pointer-events-none">
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_reset_title")} className="inline-block w-fit pointer-events-auto mb-4">
              <h2 className="text-3xl font-bold font-sans tracking-tight">
                {getContentValue("auth_reset_title", "Create a New Password")}
              </h2>
            </CmsEditableRegion>
            <CmsEditableRegion cmsPreview={cmsPreview} field={getCmsField("auth", "auth_reset_subtitle")} className="inline-block w-fit pointer-events-auto mb-8">
              <p className="text-blue-50 leading-relaxed text-lg">
                {getContentValue("auth_reset_subtitle", "Set a fresh password to secure your account and get back into Petal Express.")}
              </p>
            </CmsEditableRegion>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 relative z-10 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Create a new password for your registered email address <br />
            <strong className="text-gray-700">{email}</strong>
          </p>

          {formError ? (
            <p className="mb-6 text-sm text-red-500 bg-red-50 py-3 px-4 rounded-lg border border-red-100">
              {formError}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <FormFieldHeader
                label="New Password"
                required
                error={fieldErrors.password}
                hint={`Minimum ${PASSWORD_MIN_LENGTH} characters`}
              />
              <input
                type="password"
                className={getValidationInputClassName({
                  hasError: !!fieldErrors.password,
                  baseClassName:
                    "w-full rounded-lg border px-4 py-4 focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:bg-gray-100",
                })}
                placeholder="New Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError(setFieldErrors, "password");
                }}
                disabled={loading}
                required
              />
            </div>
            <div>
              <FormFieldHeader label="Confirm New Password" required error={fieldErrors.confirmPassword} />
              <input
                type="password"
                className={getValidationInputClassName({
                  hasError: !!fieldErrors.confirmPassword,
                  baseClassName:
                    "w-full rounded-lg border px-4 py-4 focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:bg-gray-100",
                })}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError(setFieldErrors, "confirmPassword");
                }}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full mt-4 rounded-lg bg-[#4f6fa5] py-4 text-lg text-white font-semibold transition-all hover:bg-[#3f5b89] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Update Password
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#4f6fa5] font-semibold hover:underline inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xs transform rounded-2xl bg-white p-6 text-center shadow-2xl drop-shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">Success</h3>
            <p className="text-sm text-gray-600 font-medium mb-4">{modalMessage}</p>
            <div className="flex justify-center mb-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#4f6fa5]" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ResetPasswordPage;
