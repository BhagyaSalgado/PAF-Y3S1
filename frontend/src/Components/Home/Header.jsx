import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaUtensils, FaSearch, FaBell, FaComments, FaReact } from "react-icons/fa";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import AuthModal from "../Modals/AuthModal";
import AuthService from "../../Services/AuthService";
import Footer from "./Footer";

const Header = () => {
  const navigate = useNavigate();
  const [isAuthModalOpened, setIsAuthModalOpened] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkLoginStatus = () => {
      const isAuthenticated = AuthService.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
    };
    
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('focus', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, []);

  const authButtonClicked = () => {
    if (isLoggedIn) {
      navigate("/community");
    } else {
      setIsAuthModalOpened(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpened(false);
    setIsLoggedIn(true);
    navigate("/");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-xl">
      {/* Floating particles/animation elements */}
      <motion.div 
        className="absolute top-20 left-1/4 w-3 h-3 rounded-full bg-white opacity-20"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-white opacity-20"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      />
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
        >
           {/* <FaReact className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            CodeMentor
          </span> */}
        </motion.div>
        
        <div className="hidden md:flex items-center space-x-6">
          <motion.button 
            className="flex items-center space-x-1 hover:text-blue-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/explore")}
          >
            <FaSearch />
            <span>Explore</span>
          </motion.button>
          
          {isLoggedIn && (
            <>
              <motion.button 
                className="flex items-center space-x-1 hover:text-blue-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/notifications")}
              >
                <FaBell />
                <span>Notifications</span>
              </motion.button>
              <motion.button 
                className="flex items-center space-x-1 hover:text-blue-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/messages")}
              >
                <FaComments />
                <span>Messages</span>
              </motion.button>
            </>
          )}
        </div>
        
        <motion.button
          className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isLoggedIn ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'} shadow-lg hover:shadow-xl transition-all`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={authButtonClicked}
        >
          {isLoggedIn ? (
            <>
              <FaUser />
              <span>My Profile</span>
            </>
          ) : (
            <>
              <FiLogIn />
              <span>Join Now</span>
            </>
          )}
        </motion.button>
      </nav>

      {/* Hero Section */}
      <motion.div 
        className="container mx-auto px-6 py-20 md:py-32 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
          variants={itemVariants}
        >
          Connect. Learn. Grow.
        </motion.h1>
        
        <motion.h2 
          className="text-xl md:text-2xl mb-6 text-blue-100"
          variants={itemVariants}
        >
          Join our community of mentors and learners
        </motion.h2>
        
        <motion.p 
          className="max-w-2xl mx-auto mb-8 text-blue-50"
          variants={itemVariants}
        >
          CodeMentor is where knowledge meets passion. Whether you're looking to 
          share your expertise or learn from others, you'll find your place here.
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <motion.button
            className={`px-8 py-3 rounded-full text-lg font-semibold ${isLoggedIn ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'} shadow-lg hover:shadow-xl transition-all`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={authButtonClicked}
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started - It's Free"}
          </motion.button>
        </motion.div>
      </motion.div>

      <AuthModal
        onClose={() => setIsAuthModalOpened(false)}
        onSuccess={handleAuthSuccess}
        isOpen={isAuthModalOpened}
      /> <Footer />
    </header>
   
  );
};

export default Header;