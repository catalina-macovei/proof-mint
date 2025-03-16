import React from "react";
import { NavLink } from "react-router";
import { motion } from "framer-motion";

const Welcome = () => {
  return (
    <div className="h-[100vh] flex flex-col items-center justify-center text-center">
      <motion.div 
        className="max-w-3xl mx-auto p-6 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/images/ethereum-png.png"
          className="w-4/12 max-w-md drop-shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-wide">
          License Manager
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-lg">
          Secure, decentralized, and efficient licensing on the blockchain.
          Issue, verify, and revoke licenses seamlessly.
        </p>
        <div className="flex space-x-6">
          <motion.a
            href="/services"
            className="px-8 py-3 bg-violet-600 text-white font-semibold text-lg rounded-full shadow-lg hover:bg-violet-700 transition duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.1 }}
          >
            Get Started
          </motion.a>
          <NavLink
            to="/faq"
            className="px-8 py-3 bg-gray-700 text-white font-semibold text-lg rounded-full shadow-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
          >
            Learn More
          </NavLink>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
