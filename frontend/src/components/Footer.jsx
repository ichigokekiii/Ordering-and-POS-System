import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

function Footer() {
  return (
    <footer className="mt-12 bg-white px-8 py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-blue-600">
            petal express
          </h2>

          <div className="flex gap-4 text-gray-500">
            <a href="#" className="hover:text-gray-700">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-gray-700">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-gray-700">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-800">Company</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/about" className="hover:text-gray-900">
                About Us
              </Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 no-underline hover:text-gray-900">
                Careers
              </Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 no-underline hover:text-gray-900">
                Press
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-800">Support</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="#" className="text-gray-600 no-underline hover:text-gray-900">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 no-underline hover:text-gray-900">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 no-underline hover:text-gray-900">
                Shipping Info
              </Link>
            </li>
          </ul>
        </div>

        {/* Subscribe Section */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-800">
            Stay Updated
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Subscribe for exclusive offers
          </p>

          <div className="flex w-full max-w-sm items-center gap-3">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 rounded-full bg-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-500"
            />
            <button className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;