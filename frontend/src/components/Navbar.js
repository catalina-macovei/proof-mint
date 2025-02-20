import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ account, onConnect, loading }) => {
  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <span className="text-2xl font-semibold flex flex-row dark:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#01C853" d="m5.975 10.959l6.084-2.484l5.883 2.55L12.042 2zm.017 2.758l6.067 3.417l6.191-3.418L12.117 22zm6.083-4.025l6.159 2.658l-6.159 3.334l-6.325-3.409l6.334-2.583z"/></svg>
        LM
        </span>
        <div className="items-center justify-between hidden w-full md:flex md:w-auto">
          <ul className="flex space-x-8 font-medium">
          <li>
              <Link
                to="/licenses"
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
              >
                all licenses
              </Link>
            </li>
          <li>
              <Link
                to="/test-veramo"
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
              >
                test veramo
              </Link>
            </li>
          <li>
              <Link
                to="/create-did"
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
              >
                Create DID
              </Link>
            </li>
          <li>
              <Link
                to="/"
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/issue-license"
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
              >
                Issue License
              </Link>
            </li>
            <li>
              <Link
                to="/verify-license"
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
              >
                Verify License
              </Link>
            </li>
            <li>
              <Link
                to="/revoke-license"
                className="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500"
              >
                Revoke License
              </Link>
            </li>
            <li>
              {!account ? (
                <button 
                  onClick={onConnect}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <span className="px-4 py-2 bg-gray-100 rounded-lg">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
