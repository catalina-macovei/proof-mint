import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center text-center">
      <div className="max-w-3xl mx-auto p-6 flex flex-col items-center">
      <video
        src="/images/lottie.webm"
        autoPlay
        loop
        muted
        className="w-1/4 max-w-md rounded-lg shadow-lg"
      />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Licence Manager
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Streamline your licensing tasks with ease. Issue, verify, and revoke licenses effortlessly, all in one place.
        </p>
        <div className="flex space-x-4">
          <a
            href="/"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-500"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;