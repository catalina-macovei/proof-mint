import React from "react";
import { FaTwitter, FaGithub, FaLinkedin, FaEthereum } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-300 w-full text-gray-700">
      <div className="container mx-auto px-6 flex flex-col items-center text-center space-y-6 md:flex-row md:justify-between md:text-left">
        {/* Left Section - Branding */}
        <div className="flex items-center space-x-3">
          <FaEthereum className="text-3xl text-violet-500" />
          <span className="text-xl font-semibold text-gray-900">License Manager</span>
        </div>

        {/* Center Section - Links */}
        <nav className="flex space-x-6 text-gray-600">
          <a href="/about" className="hover:text-violet-500 transition">About</a>
          <a href="/services" className="hover:text-violet-500 transition">Services</a>
          <a href="/faq" className="hover:text-violet-500 transition">FAQ</a>
          <a href="/contact" className="hover:text-violet-500 transition">Contact</a>
        </nav>

        {/* Right Section - Socials */}
        <div className="flex space-x-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-500 transition">
            <FaTwitter className="text-2xl" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-500 transition">
            <FaGithub className="text-2xl" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-500 transition">
            <FaLinkedin className="text-2xl" />
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} License Manager. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
