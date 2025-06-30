import React from "react";
import { useParams, NavLink } from "react-router";
import { motion } from "framer-motion";
import { FaLock, FaGlobe, FaShieldAlt, FaUsers, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const LearnMore = () => {
  const { type } = useParams();

  const serviceData = {
    "private-license": {
      title: "Private Attestation",
      icon: <FaLock className="text-6xl text-violet-500" />,
      description: "Secure, permissioned, and on-chain attestation for private entities with controlled access.",
      features: [
        {
          icon: <FaShieldAlt className="text-2xl text-violet-500" />,
          title: "Enhanced Security",
          description: "Multi-layer encryption and permissioned access ensure your attestations remain secure and private."
        },
        {
          icon: <FaUsers className="text-2xl text-violet-500" />,
          title: "Controlled Access",
          description: "Only authorized parties can view and verify your private attestations, maintaining confidentiality."
        },
        {
          icon: <FaCheckCircle className="text-2xl text-violet-500" />,
          title: "Compliance Ready",
          description: "Built to meet compliance requirements while maintaining blockchain immutability."
        }
      ],
      useCases: [
        "Academic credentials and certificates",
        "Private certification programs",
        "Internal compliance tracking",
        "Keep personal information private"
      ],
      benefits: [
        "Complete privacy control",
        "Enterprise security",
        "Regulatory compliance",
        "Selective disclosure",
      ]
    },
    "public-license": {
      title: "Public Attestation",
      icon: <FaGlobe className="text-6xl text-blue-500" />,
      description: "Transparent and verifiable attestation for open access, promoting trust through public verification.",
      features: [
        {
          icon: <FaGlobe className="text-2xl text-blue-500" />,
          title: "Full Transparency",
          description: "All attestations are publicly verifiable, ensuring complete transparency and trust."
        },
        {
          icon: <FaUsers className="text-2xl text-blue-500" />,
          title: "Community Verification",
          description: "Enable community-driven verification and validation of attestations."
        },
        {
          icon: <FaCheckCircle className="text-2xl text-blue-500" />,
          title: "Universal Access",
          description: "Anyone can verify and validate attestations without special permissions or access."
        }
      ],
      useCases: [
        "Academic credentials and certificates",
        "Open source contributions",
        "Public achievement recognition",
        "Community-driven certifications",
      ],
      benefits: [
        "Maximum transparency",
        "Global accessibility",
        "Open verification",
        "Decentralized validation"
      ]
    }
  };

  const service = serviceData[type];

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Service Not Found</h1>
          <NavLink to="/" className="text-violet-600 hover:text-violet-800">
            Return to Services
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-100 via-white to-blue-100 opacity-50"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <NavLink
            to="/services"
            className="inline-flex mt-4 items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <FaArrowLeft />
            <span>Back to Services</span>
          </NavLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            {service.icon}
          </div>
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
            {service.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {service.description}
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {service.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Use Cases
            </h2>
            <ul className="space-y-3">
              {service.useCases.map((useCase, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{useCase}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Benefits */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Benefits
            </h2>
            <ul className="space-y-3">
              {service.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center bg-gradient-to-r from-violet-600 to-blue-500 rounded-3xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Begin your attestation journey with {service.title.toLowerCase()}.
          </p>
          <NavLink
            to="/portal"
            className="bg-white text-violet-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
          >
            Start Attestation
          </NavLink>
        </motion.section>
      </div>
    </div>
  );
};

export default LearnMore;
