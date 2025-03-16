import React from "react";
import { NavLink } from "react-router";
import { motion } from "framer-motion";
import { FaLock, FaGlobe } from "react-icons/fa";

const Services = () => {
  const services = [
    {
      title: "Private License",
      description: "Secure, permissioned, and on-chain attestation for private entities.",
      link: "/private-license",
      icon: <FaLock className="text-4xl text-violet-500" />,
    },
    {
      title: "Public License",
      description: "Transparent and verifiable licensing for open access and public use.",
      link: "/public-license",
      icon: <FaGlobe className="text-4xl text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-10 relative">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-violet-300 via-white to-blue-300 opacity-20 blur-3xl"></div>

      <motion.h1 
        className="text-5xl font-extrabold text-gray-800 mb-12 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        On-Chain Licensing Services
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-12 z-10">
        {services.map((service, index) => (
          <motion.div 
            key={index}
            className="relative bg-white bg-opacity-80 border border-gray-300 backdrop-blur-md rounded-3xl p-8 shadow-xl text-gray-900 text-left max-w-md transition-all duration-300 hover:shadow-2xl hover:scale-105"
            whileHover={{ scale: 1.07 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              {service.icon}
              <h2 className="text-3xl font-semibold">{service.title}</h2>
            </div>
            <p className="text-gray-700 mb-6">{service.description}</p>
            <NavLink
              to={service.link}
              className="inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:from-violet-700 hover:to-blue-600 transition duration-300 cursor-pointer"
            >
              Learn More
            </NavLink>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services;
