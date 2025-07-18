import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useMyContext } from "../../../store/ContextApi";
import { useTheme } from "../../../store/ThemeProvider";

const Navbar = () => {
  const [headerToggle, setHeaderToggle] = useState(false);
  const pathName = useLocation().pathname;
  const navigate = useNavigate();
  const { token, setToken, currentUser, setCurrentUser, isAdmin, setIsAdmin } = useMyContext();
  const { darkMode, toggleDarkMode } = useTheme();

  // Generate random color for profile circle
  const getRandomColor = () => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0].slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USER");
    localStorage.removeItem("CSRF_TOKEN");
    localStorage.removeItem("IS_ADMIN");
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="h-20 z-50 sticky top-0 flex items-center shadow-lg bg-headerColor dark:bg-gray-800 text-textColor dark:text-gray-200">
      <nav className="sm:px-12 px-6 flex w-full h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/collabspace_logo.png" alt="CollabSpace Logo" className="w-14 h-14 rounded-full" />
          <Link to="/">
            <h3 className="font-dancingScript text-logoText text-3xl">CollabSpace</h3>
          </Link>
        </div>

        <ul
          className={`lg:static absolute left-0 top-20 w-full lg:w-fit lg:px-0 sm:px-12 px-6 lg:bg-transparent bg-headerColor dark:bg-gray-800 ${
            headerToggle
              ? "min-h-fit max-h-[400px] lg:py-0 py-6 shadow-lg shadow-slate-700 lg:shadow-none"
              : "h-0 overflow-hidden"
          } lg:h-auto transition-all duration-200 font-montserrat text-lg flex lg:flex-row flex-col lg:items-center lg:gap-12 gap-4`}
        >
          <Link to="/">
            <li
              className={`py-3 px-4 cursor-pointer hover:text-blue-400 dark:hover:text-blue-300 rounded-md transition-colors ${
                pathName === "/" ? "font-semibold text-blue-500 dark:text-blue-400" : ""
              }`}
            >
              Home
            </li>
          </Link>

          <Link to="/contact">
            <li
              className={`py-3 px-4 cursor-pointer hover:text-blue-400 dark:hover:text-blue-300 rounded-md transition-colors ${
                pathName === "/contact" ? "font-semibold text-blue-500 dark:text-blue-400" : ""
              }`}
            >
              Contact
            </li>
          </Link>

          <Link to="/resource">
            <li
              className={`py-3 px-4 cursor-pointer hover:text-blue-400 dark:hover:text-blue-300 rounded-md transition-colors ${
                pathName === "/resource" ? "font-semibold text-blue-500 dark:text-blue-400" : ""
              }`}
            >
              Resources
            </li>
          </Link>

          <Link to="/about">
            <li
              className={`py-3 px-4 cursor-pointer hover:text-blue-400 dark:hover:text-blue-300 rounded-md transition-colors ${
                pathName === "/about" ? "font-semibold text-blue-500 dark:text-blue-400" : ""
              }`}
            >
              About
            </li>
          </Link>

          {token ? (
            <>
              <li className="py-3 cursor-pointer">
                <div
                  onClick={handleProfileClick}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold ${getRandomColor()} hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-300 transition-all`}
                >
                  {getInitials(currentUser?.username)}
                </div>
              </li>
              {isAdmin && (
                <Link to="/admin/users">
                  <li
                    className={`py-3 px-4 cursor-pointer uppercase hover:text-blue-400 dark:hover:text-blue-300 rounded-md transition-colors ${
                      pathName.startsWith("/admin") ? "font-semibold text-blue-500 dark:text-blue-400" : ""
                    }`}
                  >
                    Admin
                  </li>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-28 text-center bg-gradient-to-r from-customRed to-red-700 text-white font-semibold px-5 py-3 rounded-md cursor-pointer hover:from-red-700 hover:to-customRed shadow-lg hover:shadow-xl transition-all duration-200"
              >
                LogOut
              </button>
            </>
          ) : (
            <Link to="/signup">
              <li className="w-28 text-center bg-btnColor text-white font-semibold px-5 py-3 rounded-md cursor-pointer hover:bg-opacity-90 transition-colors">
                SignUp
              </li>
            </Link>
          )}

          <li className="py-3 cursor-pointer">
            <button
              onClick={toggleDarkMode}
              className="text-3xl hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {darkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>
          </li>
        </ul>

        <span
          onClick={() => setHeaderToggle(!headerToggle)}
          className="lg:hidden block cursor-pointer text-3xl shadow-md hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {headerToggle ? <RxCross2 /> : <IoMenu />}
        </span>
      </nav>
    </header>
  );
};

export default Navbar;