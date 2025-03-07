import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaPlusCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const LicenseServices = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
        License Services
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 justify-items-center">
        <Link
          to="/licenses"
          className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 w-full max-w-sm"
        >
          <FaFileAlt className="text-blue-500 text-5xl" />
          <span className="text-gray-900 dark:text-white text-xl font-semibold mt-4">
            All Licenses
          </span>
        </Link>
        <Link
          to="/issue-license"
          className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 w-full max-w-sm"
        >
          <FaPlusCircle className="text-yellow-500 text-5xl" />
          <span className="text-gray-900 dark:text-white text-xl font-semibold mt-4">
            Issue License
          </span>
        </Link>
        <Link
          to="/verify-license"
          className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 w-full max-w-sm"
        >
          <FaCheckCircle className="text-green-500 text-5xl" />
          <span className="text-gray-900 dark:text-white text-xl font-semibold mt-4">
            Verify License
          </span>
        </Link>
        <Link
          to="/revoke-license"
          className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 w-full max-w-sm"
        >
          <FaTimesCircle className="text-red-500 text-5xl" />
          <span className="text-gray-900 dark:text-white text-xl font-semibold mt-4">
            Revoke License
          </span>
        </Link>
      </div>
    </div>
  );
};

export default LicenseServices;
