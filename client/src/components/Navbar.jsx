import { useState, useEffect, useRef } from 'react';
import { NavLink } from "react-router";

const Navbar = ({ account, onConnect, loading }) => {
  const [openPrivateDropdown, setOpenPrivateDropdown] = useState(false);
  const [openPublicDropdown, setOpenPublicDropdown] = useState(false);
  const privateDropdownRef = useRef(null);
  const publicDropdownRef = useRef(null);

  const togglePrivateDropdown = () => {
    setOpenPrivateDropdown(!openPrivateDropdown);
    setOpenPublicDropdown(false);
  };

  const togglePublicDropdown = () => {
    setOpenPublicDropdown(!openPublicDropdown);
    setOpenPrivateDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        privateDropdownRef.current && !privateDropdownRef.current.contains(event.target) &&
        publicDropdownRef.current && !publicDropdownRef.current.contains(event.target)
      ) {
        setOpenPrivateDropdown(false);
        setOpenPublicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 fixed shadow-xl w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <NavLink to="/">
          <span className="text-2xl font-semibold flex items-center dark:text-white">
            <img src="/images/logo.png" alt="Ethereum Logo" className="w-10 h-10 mr-2" />
            LM
          </span>
        </NavLink>
        <div className="hidden md:flex flex-grow justify-center">
          <ul className="flex space-x-8 font-medium">
            <li>
              <NavLink to="/" className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/portal" className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500">
                Portal                    
              </NavLink>
            </li>
            <li className="relative" ref={privateDropdownRef}>
              <button
                onClick={togglePrivateDropdown}
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500 focus:outline-none flex items-center"
              >
                Private License
                <span className="ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>
              {openPrivateDropdown && (
                <ul className="absolute mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-48 left-1/2 transform -translate-x-1/2">
                  <li>
                    <NavLink to="/issue-private-license" onClick={() => setOpenPrivateDropdown(false)} className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500">
                      Issue Private License
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/verify-private-license" onClick={() => setOpenPrivateDropdown(false)} className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500">
                      Verify Private License
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/view-private-licenses" onClick={() => setOpenPrivateDropdown(false)} className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500">
                      View Private Licenses
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            <li className="relative" ref={publicDropdownRef}>
              <button
                onClick={togglePublicDropdown}
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500 focus:outline-none flex items-center"
              >
                Public License
                <span className="ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </button>
              {openPublicDropdown && (
                <ul className="absolute mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-48 left-1/2 transform -translate-x-1/2">
                  <li>
                    <NavLink to="/issue-license" className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500">
                      Issue License
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/verify-license" className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500">
                      Verify License
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/view-public-licenses" className="block px-4 py-2 text-gray-900 hover:bg-blue-100 dark:text-white dark:hover:bg-blue-500">
                      View Public Licenses
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
        <div className="flex items-center">
          <NavLink to="/login" className="w-full inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:from-violet-700 hover:to-blue-600 transition duration-300 cursor-pointer">
            {!account ? (loading ? 'Connecting...' : 'Login') : `${account.slice(0, 6)}...${account.slice(-4)}`}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
