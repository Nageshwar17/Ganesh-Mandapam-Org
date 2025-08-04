// src/pages/NotAuthorized.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center"
      >
        <div className="text-5xl text-red-500 mb-4">
          <FaLock />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2 rounded-lg shadow"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate("/userdashboard")}
            className="bg-cyan-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg shadow"
          >
            User Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotAuthorized;
