import { useState, useEffect, useRef } from 'react';
import { NavLink } from "react-router";

const Navbar = ({ account, onConnect, loading }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        {/* Logo on the left */}
        <span className="text-2xl font-semibold flex items-center dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path fill="#01C853" d="m5.975 10.959l6.084-2.484l5.883 2.55L12.042 2zm.017 2.758l6.067 3.417l6.191-3.418L12.117 22zm6.083-4.025l6.159 2.658l-6.159 3.334l-6.325-3.409l6.334-2.583z" />
          </svg>
          LM
        </span>

        {/* Centered navigation links */}
        <div className="hidden md:flex flex-grow justify-center">
          <ul className="flex space-x-8 font-medium">
            <li>
              <NavLink to="/" className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500">
                Home
              </NavLink>
            </li>
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500 focus:outline-none flex items-center"
              >
                License Services
                <span className="ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>
              {isDropdownOpen && (
                <ul className="absolute mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-48 left-1/2 transform -translate-x-1/2">
                  <li>
                    <NavLink
                      to="/license-services"
                      className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500"
                    >
                      All Services
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/licenses"
                      className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500"
                    >
                      All Licenses
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/issue-license"
                      className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500"
                    >
                      Issue License
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/verify-license"
                      className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500"
                    >
                      Verify License
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/revoke-license"
                      className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500"
                    >
                      Revoke License
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <NavLink to="/faq" className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500">
                FAQ
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Account button on the right */}
        <div className="flex items-center">
          <NavLink to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {!account ? (loading ? 'Connecting...' : 'Connect Wallet') : `${account.slice(0, 6)}...${account.slice(-4)}`}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
