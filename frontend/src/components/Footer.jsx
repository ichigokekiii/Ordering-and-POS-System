import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useContents } from "../contexts/ContentContext";
import CmsEditableRegion from "./admin/CmsEditableRegion";
import {
  getCmsField,
  getContentValue as getCmsContentValue,
} from "../cms/cmsRegistry";

function Footer({ cmsPreview }) {
  const contentContext = useContents();
  const contents = contentContext?.contents || [];

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
        backgroundColor: getContentValue("footer_bg_color", "#ffffff"),
        backgroundImage: getContentValue("footer_bg_image", "")
          ? `url(http://localhost:8000${getContentValue("footer_bg_image")})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
        {/* Brand Section */}
        <div className="space-y-4">
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("footer", "footer_brand")}
            className="inline-block"
          >
            <h2
              className="text-xl font-bold"
              style={{ color: getContentValue("footer_text_color", "#2563eb") }}
            >
              {getContentValue("footer_brand", "petal express")}
            </h2>
          </CmsEditableRegion>

          <div className="flex gap-4 text-gray-500">
            <a
              href="#"
              onClick={preventPreviewNavigation}
              className="hover:text-gray-700"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              onClick={preventPreviewNavigation}
              className="hover:text-gray-700"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              onClick={preventPreviewNavigation}
              className="hover:text-gray-700"
            >
              <Twitter size={20} />
            </a>
          </div>

          <div className="space-y-1 text-sm">
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("footer", "footer_email")}
              className="inline-block"
            >
              <p
                style={{
                  color: getContentValue("footer_subtext_color", "#4b5563"),
                }}
              >
                {getContentValue("footer_email", "hello@petalexpress.com")}
              </p>
            </CmsEditableRegion>
            <CmsEditableRegion
              cmsPreview={cmsPreview}
              field={getCmsField("footer", "footer_phone")}
              className="inline-block"
            >
              <p
                style={{
                  color: getContentValue("footer_subtext_color", "#4b5563"),
                }}
              >
                {getContentValue("footer_phone", "+63 912 345 6789")}
              </p>
            </CmsEditableRegion>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h3
            className="mb-3 font-semibold"
            style={{ color: getContentValue("footer_text_color", "#1f2937") }}
          >
            Company
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link
                to="/about"
                onClick={preventPreviewNavigation}
                className="hover:text-gray-900"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="#"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link
                to="#"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900"
              >
                Press
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3
            className="mb-3 font-semibold"
            style={{ color: getContentValue("footer_text_color", "#1f2937") }}
          >
            Support
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link
                to="#"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="#"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                to="#"
                onClick={preventPreviewNavigation}
                className="text-gray-600 no-underline hover:text-gray-900"
              >
                Shipping Info
              </Link>
            </li>
          </ul>
        </div>

        {/* Subscribe Section */}
        <div>
          <CmsEditableRegion
            cmsPreview={cmsPreview}
            field={getCmsField("footer", "footer_title")}
            className="inline-block"
          >
            <h3
              className="mb-3 font-semibold"
              style={{ color: getContentValue("footer_text_color", "#1f2937") }}
            >
              {getContentValue("footer_title", "Stay Updated")}
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
                color: getContentValue("footer_subtext_color", "#4b5563"),
              }}
            >
              {getContentValue(
                "footer_subtitle",
                "Subscribe for exclusive offers",
              )}
            </p>
          </CmsEditableRegion>

          <div className="flex w-full max-w-sm items-center gap-3">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 rounded-full bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={preventPreviewNavigation}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <CmsEditableRegion
        cmsPreview={cmsPreview}
        field={getCmsField("footer", "footer_copyright")}
        className="mt-10 inline-block"
      >
        <div className="text-center text-sm text-gray-500">
          {getContentValue(
            "footer_copyright",
            "© 2026 Petal Express. All rights reserved.",
          )}
        </div>
      </CmsEditableRegion>
    </footer>
  );
}

export default Footer;
