import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* About Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              About <span className="text-customRed">SecureNote</span>
            </h1>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Welcome to SecureNote, your trusted companion for secure and private
              note-taking. We believe in providing a safe space where your thoughts
              and ideas are protected with the highest level of security.
            </p>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Our mission is to ensure that your notes are always accessible to you and
              only you. With state-of-the-art encryption and user-friendly features,
              SecureNote is designed to keep your information confidential and secure.
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="bg-customRed text-white p-1 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700 dark:text-gray-300">Add an extra layer of security with two-factor authentication</span>
              </li>
              <li className="flex items-center">
                <span className="bg-customRed text-white p-1 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700 dark:text-gray-300">Your notes are encrypted from the moment you create them</span>
              </li>
              <li className="flex items-center">
                <span className="bg-customRed text-white p-1 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700 dark:text-gray-300">Access your notes from anywhere with the assurance that they are stored securely</span>
              </li>
              <li className="flex items-center">
                <span className="bg-customRed text-white p-1 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700 dark:text-gray-300">Our app is designed to be intuitive and easy to use</span>
              </li>
            </ul>

            <div className="flex space-x-4">
              <Link className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors" to="/">
                <FaFacebookF size={20} />
              </Link>
              <Link className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors" to="/">
                <FaTwitter size={20} />
              </Link>
              <Link className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors" to="/">
                <FaLinkedinIn size={20} />
              </Link>
              <Link className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors" to="/">
                <FaInstagram size={20} />
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <div className="bg-gradient-to-r from-customRed to-red-600 rounded-2xl p-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="SecureNote App" 
                  className="rounded-xl w-full h-auto object-cover shadow-lg"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Our Vision</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    To create a world where privacy is the default, not an option. SecureNote is committed to making security accessible to everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Meet Our Team</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The passionate people behind SecureNote who work tirelessly to bring you the best secure note-taking experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              name: "Alex Johnson",
              role: "CEO & Founder",
              image: "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
              name: "Sarah Williams",
              role: "Security Lead",
              image: "https://randomuser.me/api/portraits/women/44.jpg"
            },
            {
              name: "Michael Chen",
              role: "Lead Developer",
              image: "https://randomuser.me/api/portraits/men/22.jpg"
            },
            {
              name: "Emma Davis",
              role: "UX Designer",
              image: "https://randomuser.me/api/portraits/women/63.jpg"
            }
          ].map((member, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                <p className="text-customRed mt-1">{member.role}</p>
                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;