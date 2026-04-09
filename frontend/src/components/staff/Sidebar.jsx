import React from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

function Sidebar({ isOpen, dm, onLogout }) {
  return (
    <div
      className={`w-64 flex flex-col z-20 absolute top-0 left-0 h-full transition-transform duration-200 ease-out transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } border-r shadow-md ${
        dm ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`p-4 border-b flex justify-between items-center h-16 ${
          dm ? "border-gray-700" : ""
        }`}
      >
        <h2
          className={`font-bold text-lg ${
            dm ? "text-blue-400" : "text-blue-600"
          }`}
        >
          Petal Express
        </h2>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <p
          className={`text-xs font-bold uppercase tracking-wider mb-2 ${
            dm ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Order Types
        </p>

        <Link
          to="/staff/orderpremade"
          className={`p-3 rounded-lg font-semibold transition shadow-sm border border-transparent ${
            dm
              ? "bg-gray-700 text-gray-200 hover:bg-green-900/40 hover:text-green-300 hover:border-green-700"
              : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
          }`}
        >
          Premade Orders
        </Link>

        <Link
          to="/staff/ordercustom"
          className={`p-3 rounded-lg font-semibold transition shadow-sm border border-transparent ${
            dm
              ? "bg-gray-700 text-gray-200 hover:bg-blue-900/40 hover:text-blue-300 hover:border-blue-700"
              : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
          }`}
        >
          Custom Orders
        </Link>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <Link
            to="/admin"
            className={`w-full p-3 rounded-lg font-semibold transition shadow-sm border border-transparent text-center block ${
              dm
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Go to Admin Dashboard
          </Link>
          
          <button
            onClick={onLogout}
            className={`w-full p-3 flex items-center justify-center gap-2 rounded-lg font-bold transition shadow-sm border ${
              dm
                ? "bg-gray-800 text-rose-400 border-gray-700 hover:bg-rose-900/20 hover:border-rose-500/50"
                : "bg-white text-rose-500 border-gray-200 hover:bg-rose-50 hover:border-rose-200"
            }`}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;