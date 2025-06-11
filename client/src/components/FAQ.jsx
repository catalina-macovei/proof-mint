import React, { useState } from 'react';

const FAQItem = ({ id, question, answer, isOpen, toggleItem }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
      <button
        type="button"
        onClick={() => toggleItem(id)}
        className="flex items-center justify-between w-full p-4 font-medium text-gray-900 dark:text-white focus:outline-none"
      >
        <span>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 text-gray-500 dark:text-gray-400">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  const faqs = [
    {
      id: 1,
      question: "What is Attestation Services?",
      answer: "Attestation Services is a comprehensive platform that allows you to manage, issue, verify, and revoke licenses with ease."
    },
    {
      id: 2,
      question: "How do I issue a license?",
      answer: "To issue a license, navigate to the 'Issue Attestation' section, fill out the necessary details, and submit the form."
    },
    {
      id: 3,
      question: "How can I verify a license?",
      answer: "Verify a license by going to the 'Verify Attestation' section and entering the license key. The system will validate its authenticity."
    },
    {
      id: 4,
      question: "What should I do if an attestation needs to be revoked?",
      answer: "If an attestation needs to be revoked, go to the 'Revoke Attestation' section and follow the instructions provided."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
        Frequently Asked Questions
      </h2>
      <div className="max-w-2xl mx-auto text-lg">
        {faqs.map((item) => (
          <FAQItem
            key={item.id}
            id={item.id}
            question={item.question}
            answer={item.answer}
            isOpen={openItem === item.id}
            toggleItem={toggleItem}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
