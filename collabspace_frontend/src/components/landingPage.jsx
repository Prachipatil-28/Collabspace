import React from "react";
import { Link } from "react-router-dom";
import Buttons from "../utils/Buttons";
import { motion } from "framer-motion";
import Brands from "./LandingPageCom/Brands/Brands";
import State from "./LandingPageCom/State";
import Testimonial from "./LandingPageCom/Testimonial/Testimonial";
import { useMyContext } from "../store/ContextApi";
import { useTheme } from "../store/ThemeProvider";

const fadeInFromTop = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const fadeInFromBottom = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const LandingPage = () => {
  const { token, currentUser, loading } = useMyContext();
  const { darkMode } = useTheme();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-74px)] flex justify-center items-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-74px)] flex justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${darkMode ? 'dark' : ''}`}>
      <div className="lg:w-[80%] w-full py-16 space-y-4">
        {/* Welcome Username Section */}
        {token && (
          <motion.h1
            className="font-pacifico text-3xl sm:text-4xl text-headerColor dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-300 xl:text-headerText mx-auto font-bold text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInFromTop}
          >
            Hello, {currentUser?.username || 'Guest'}
          </motion.h1>
        )}

        {/* Main Heading */}
        <motion.h1
          className="font-montserrat uppercase text-headerColor dark:text-white xl:text-headerText md:text-4xl text-2xl mx-auto text-center font-bold sm:w-[95%] w-full"
          initial="hidden"
          animate="visible"
          variants={fadeInFromTop}
        >
          Turn your ideas into notes, canvas, awesome content easily and effectively.
        </motion.h1>

        {/* Subheading */}
        <h3 className="text-logoText dark:text-gray-300 md:text-2xl text-xl font-semibold text-slate-800 text-center">
          AI-powered Virtual Collaboration Platform.
        </h3>

        {/* Description */}
        <p className="text-slate-700 dark:text-gray-300 text-center sm:w-[80%] w-[90%] mx-auto">
          Create your content, collaborate with members, and upskill yourself. Just create, save, and access them from anywhere with robust encryption and seamless synchronization and real-time updates.
        </p>

        {/* Action Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInFromBottom}
          className="flex items-center justify-center gap-3 py-10"
        >
          {token ? (
            <>
              <Link to="/dashboard">
                <Buttons className="sm:w-52 w-44 bg-customRed hover:shadow-lg hover:shadow-red-200 dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 dark:hover:shadow-purple-900/30 font-semibold hover:scale-105 transition-all duration-200 cursor-pointer text-white px-10 py-3 rounded-sm">
                  Get Started
                </Buttons>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Buttons className="sm:w-52 w-44 bg-customRed hover:shadow-lg hover:shadow-red-200 dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 dark:hover:shadow-purple-900/30 font-semibold hover:scale-105 transition-all duration-200 cursor-pointer text-white px-10 py-3 rounded-sm">
                  SignIn
                </Buttons>
              </Link>
              <Link to="/signup">
                <Buttons className="sm:w-52 w-44 bg-btnColor hover:shadow-lg hover:shadow-blue-200 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 dark:hover:shadow-blue-900/30 font-semibold hover:scale-105 transition-all duration-200 cursor-pointer text-white px-10 py-3 rounded-sm">
                  SignUp
                </Buttons>
              </Link>
            </>
          )}
        </motion.div>

        {/* Features Section */}
        <div className="sm:pt-14 pt-0 xl:px-16 md:px-10 space-y-10">
          <h1 className="font-montserrat uppercase text-headerColor dark:text-white xl:text-headerText md:text-4xl text-2xl mx-auto text-center font-bold w-full">
            Explore Our Features
          </h1>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Code Editor */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              variants={fadeInFromBottom}
            >
              <h2 className="text-xl font-semibold text-headerColor dark:text-white">Code Editor</h2>
              <p className="text-slate-700 dark:text-gray-300 mt-2">
                Write and test code snippets in real-time with syntax highlighting.
              </p>
            </motion.div>

            {/* Whiteboard */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              variants={fadeInFromBottom}
            >
              <h2 className="text-xl font-semibold text-headerColor dark:text-white">Whiteboard</h2>
              <p className="text-slate-700 dark:text-gray-300 mt-2">
                Collaborate visually with an interactive whiteboard.
              </p>
            </motion.div>

            {/* Session Creation */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              variants={fadeInFromBottom}
            >
              <h2 className="text-xl font-semibold text-headerColor dark:text-white">Session Creation</h2>
              <p className="text-slate-700 dark:text-gray-300 mt-2">
                Create collaborative sessions for brainstorming and planning.
              </p>
            </motion.div>

            {/* Video Calling */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              variants={fadeInFromBottom}
            >
              <h2 className="text-xl font-semibold text-headerColor dark:text-white">Video Calling</h2>
              <p className="text-slate-700 dark:text-gray-300 mt-2">
                Connect with team members through video calls.
              </p>
            </motion.div>
          </div>

          {/* Brands and State Sections */}
          <Brands />
          <State />

          {/* Testimonials Section */}
          <div className="pb-10">
            <h1 className="font-montserrat uppercase text-headerColor dark:text-white pb-16 xl:text-headerText md:text-4xl text-2xl mx-auto text-center font-bold sm:w-[95%] w-full">
              Testimonials
            </h1>
            <Testimonial />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;