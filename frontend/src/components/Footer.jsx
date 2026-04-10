import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useContents } from "../contexts/ContentContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavbar } from "../contexts/NavbarContext";
import CmsEditableRegion from "./admin/CmsEditableRegion";
import {
  getCmsField,
  getCmsAssetUrl,
  getContentValue as getCmsContentValue,
} from "../cms/cmsRegistry";

function Footer({ cmsPreview }) {
  const contentContext = useContents();
  const contents = contentContext?.contents || [];
  const { isDarkMode } = useTheme();
  
  // Bring in the current user to handle dynamic routing
  const { currentUser } = useNavbar();

  const getContentValue = (identifier, fallback = "") =>
    getCmsContentValue(contents, "footer", identifier, fallback);

  const preventPreviewNavigation = (event) => {
    if (!cmsPreview?.enabled) return;
    event.preventDefault();
  };

  return (
    <footer
      className="mt-12 px-8 py-10"
      style={{
        backgroundColor: isDarkMode
          ? "#08111f"
          : getContentValue("footer_bg_color", "#ffffff"),
        backgroundImage: isDarkMode
          ? "none"
          : getContentValue("footer_bg_image", "")
          ? `url(${getCmsAssetUrl(getContentValue("footer_bg_image"))})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
        {/* Brand Section */}
        <div className="space-y-5">
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("footer", "footer_brand")}
            className="inline-block"
          >
            <h2
              className="text-2xl font-semibold tracking-wide"
              style={{
                color: isDarkMode
                  ? "#93c5fd"
                  : getContentValue("footer_text_color", "#2563eb"),
              }}
            >
              {getContentValue("footer_brand", "petal express")}
            </h2>
          </CmsEditableRegion>

          {/* CMS Editable Social Links */}
          <div className="flex gap-5 text-gray-500">
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("footer", "footer_social_facebook")}
              className="inline-block"
            >
              <a
                href={getContentValue("footer_social_facebook", "#")}
                onClick={preventPreviewNavigation}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                <Facebook size={22} strokeWidth={1.75} />
              </a>
            </CmsEditableRegion>
            
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("footer", "footer_social_instagram")}
              className="inline-block"
            >
              <a
                href={getContentValue("footer_social_instagram", "#")}
                onClick={preventPreviewNavigation}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                <Instagram size={22} strokeWidth={1.75} />
              </a>
            </CmsEditableRegion>
            
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("footer", "footer_social_twitter")}
              className="inline-block"
            >
              <a
                href={getContentValue("footer_social_twitter", "#")}
                onClick={preventPreviewNavigation}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                <Twitter size={22} strokeWidth={1.75} />
              </a>
            </CmsEditableRegion>
          </div>

          <div className="space-y-1 text-base">
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("footer", "footer_email")}
              className="inline-block"
            >
              <a
                href={`mailto:${getContentValue("footer_email", "hello@petalexpress.com")}`}
                className="hover:text-gray-900 transition-colors block"
                style={{
                  color: isDarkMode
                    ? "#94a3b8"
                    : getContentValue("footer_subtext_color", "#4b5563"),
                }}
              >
                {getContentValue("footer_email", "petalexpressotp@gmail.com")}
              </a>
            </CmsEditableRegion>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h3
            className="mb-3 font-semibold"
            style={{
              color: isDarkMode
                ? "#f8fafc"
                : getContentValue("footer_text_color", "#1f2937"),
            }}
          >
            Company
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link
                to="/about"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900 transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900 transition-colors"
              >
                Showcase
              </Link>
            </li>
            <li>
              <Link
                to="/schedule"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900 transition-colors"
              >
                Pop-up Events
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3
            className="mb-3 font-semibold"
            style={{
              color: isDarkMode
                ? "#f8fafc"
                : getContentValue("footer_text_color", "#1f2937"),
            }}
          >
            Support
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a
                href={`mailto:${getContentValue("footer_email", "hello@petalexpress.com")}`}
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900 transition-colors"
              >
                Contact Us
              </a>
            </li>
            <li>
              <Link
                to="/about"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900 transition-colors"
              >
                FAQs
              </Link>
            </li>
            <li>
              {/* Dynamic Routing based on login status */}
              <Link
                to={currentUser ? "/profile" : "/login"}
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900 transition-colors"
              >
                My Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Feedback Section */}
        <div>
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("footer", "footer_title")}
            className="inline-block"
          >
            <h3
              className="mb-3 font-semibold"
              style={{
                color: isDarkMode
                  ? "#f8fafc"
                  : getContentValue("footer_text_color", "#1f2937"),
              }}
            >
              {getContentValue("footer_title", "Share us your thoughts!")}
            </h3>
          </CmsEditableRegion>
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("footer", "footer_subtitle")}
            className="inline-block"
          >
            <p
              className="mb-4 text-sm"
              style={{
                color: isDarkMode
                  ? "#94a3b8"
                  : getContentValue("footer_subtext_color", "#4b5563"),
              }}
            >
              {getContentValue(
                "footer_subtitle",
                "We'd love to hear about your experience with Petal Express."
              )}
            </p>
          </CmsEditableRegion>

          <div className="flex w-full max-w-sm items-center mt-2">
            <Link
              to="/feedback"
              onClick={preventPreviewNavigation}
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-[#3f5b89] transition-all shadow-sm inline-block"
            >
              Give Feedback
            </Link>
          </div>
        </div>
      </div>
      
      <CmsEditableRegion
        cmsPreview={cmsPreview}
        field={getCmsField("footer", "footer_copyright")}
        className="mt-10 inline-block w-full"
      >
        <div className="text-center text-sm text-gray-500">
          {getContentValue(
            "footer_copyright",
            "© 2026 Petal Express. All rights reserved."
          )}
        </div>
      </CmsEditableRegion>
    </footer>
  );
}

export default Footer;