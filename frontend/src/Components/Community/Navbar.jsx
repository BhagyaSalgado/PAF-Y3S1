import React, { useState, useEffect } from 'react';
import { useSnapshot } from "valtio";
import { motion } from "framer-motion";
import { FiBell, FiUser, FiSearch, FiMessageSquare, FiLogOut, FiSettings, FiEdit, FiTrash, FiChevronDown, FiMenu } from "react-icons/fi";
import state from "../../Utils/Store";
import NotificationService from "../../Services/NotificationService";
import { useNavigate } from "react-router-dom";
import { FaReact } from 'react-icons/fa';

const Navbar = () => {
  const snap = useSnapshot(state);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const initialValues = snap.currentUser;
  const userName = initialValues?.name || "User";
  const userImage = initialValues?.image || "./assets/default-user.png";
  
  const handleClick = (index) => {
    state.activeIndex = index;
    if (index === 5) navigate("/notifications");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await NotificationService.getAllNotifications();
      const userNotifications = res.filter(
        notification => initialValues?.uid === notification.userId
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const markNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        for (const notification of unreadNotifications) {
          await NotificationService.markAsRead(notification.id);
        }
        setNotifications(notifications.map(n => ({...n, read: true})));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/logo section */}
          <motion.div 
            className="flex-shrink-0 flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
          >
             <FaReact className="h-8 w-8 text-blue-500" />
            <h3 className="text-xl font-bold text-white">
              CodeMentor
            </h3>
          </motion.div>

          {/* Navigation items - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {["Posts", "Skill Plans", "Learning Tracking", "Friends"].map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleClick(index + 1)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    snap.activeIndex === index + 1 
                      ? "bg-blue-700/30 text-white"
                      : "text-blue-100 hover:text-white hover:bg-blue-700/20"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right side - User profile and notifications */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Button */}
            <motion.button
             onClick={() => state.activeIndex = 5}
              className="relative p-1 rounded-full text-blue-100 hover:text-white focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiBell className="h-6 w-6" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-blue-600"></span>
              )}
            </motion.button>
            
            {/* Profile Dropdown */}
            <div className="ml-3 relative group">
              <motion.button
                onClick={() => { state.profileModalOpend = true; }}
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-100 group-hover:text-white mr-2">{userName}</span>
                <img
                  alt="User profile"
                  src={userImage}
                  className="h-8 w-8 rounded-full border-2 border-blue-400 hover:border-white"
                />
                <FiChevronDown className="ml-1 text-blue-200 group-hover:text-white" />
              </motion.button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <motion.button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700/30 focus:outline-none"
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">Open main menu</span>
              <FiMenu className="h-6 w-6" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-blue-600"></span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden bg-blue-700/90 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {["Posts", "Skill Plans", "Learning Tracking", "Friends"].map((item, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  handleClick(index + 1);
                  toggleMobileMenu();
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  snap.activeIndex === index + 1
                    ? "bg-blue-600/30 text-white"
                    : "text-blue-100 hover:text-white hover:bg-blue-600/20"
                }`}
                whileHover={{ x: 5 }}
              >
                {item}
              </motion.button>
            ))}
            <motion.button
              onClick={() => {
                markNotificationsAsRead();
                navigate("/notifications");
                toggleMobileMenu();
              }}
              className="flex w-full items-center justify-between px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/20"
              whileHover={{ x: 5 }}
            >
              <span>Notifications</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </motion.button>
          </div>
          <div className="pt-4 pb-3 border-t border-blue-600">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src={userImage} alt="User profile" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{userName}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <motion.button 
                onClick={() => { 
                  state.profileModalOpend = true;
                  toggleMobileMenu();
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/20"
                whileHover={{ x: 5 }}
              >
                <FiUser className="h-5 w-5 mr-2" />
                Your Profile
              </motion.button>
              <motion.button
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/20"
                whileHover={{ x: 5 }}
              >
                <FiSettings className="h-5 w-5 mr-2" />
                Settings
              </motion.button>
              <motion.button
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/20"
                whileHover={{ x: 5 }}
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
              >
                <FiLogOut className="h-5 w-5 mr-2" />
                Sign out
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;