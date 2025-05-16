import React, { useEffect, useState } from "react";
import { Avatar, Empty, Spin, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import PostService from "../../Services/PostService";
import SkillPlanService from "../../Services/SkillPlanService";
import { motion } from "framer-motion";

// Components
import MyPost from "./MyPost";
import FriendsPost from "./FriendsPost";
import CreateSkillPlanBox from "./CreateSkillPlanBox";
import SkillPlanCard from "./SkillPlanCard";
import FriendsSection from "./FriendsSection";
import Notifications from "./Notifications";
import LearningDashboard from "./LearningDashboard";
import MyLearning from "./MyLearning";
import TopBox from "./TobBox";
import Footer from "../Home/Footer";

const CenterSection = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Handle scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load posts for the feed
  useEffect(() => {
    PostService.getPosts()
      .then((result) => {
        const uniquePosts = [];
        const seenIds = new Set();

        result.forEach((post) => {
          if (!seenIds.has(post.id)) {
            seenIds.add(post.id);
            uniquePosts.push(post);
          }
        });

        state.posts = uniquePosts;
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
      });
  }, []);

  // Load user-specific skill plans
  useEffect(() => {
    const loadUserSkillPlans = async () => {
      if (snap.activeIndex !== 2 || !snap.currentUser?.uid) return;

      try {
        setLoading(true);
        const userSkillPlans = await SkillPlanService.getUserSkillPlans(
          snap.currentUser.uid
        );
        state.skillPlans = userSkillPlans;
      } catch (err) {
        console.error("Failed to fetch skill plans:", err);
        message.error("Failed to load your skill plans");
      } finally {
        setLoading(false);
      }
    };

    loadUserSkillPlans();
  }, [snap.activeIndex, snap.currentUser?.uid]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="transition-all duration-300 justify-center mx-auto"
    >
      {/* Main Content Area */}
      <motion.div 
        className={`max-w-5xl bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-200 mx-auto px-4 sm:px-6 lg:px-8 p-8 md:p-12 ${
          isScrolled ? "shadow-lg" : "shadow-sm"
        }`}
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stories Section - Fixed at top */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8"
        >
          <TopBox />
        </motion.div>

        {/* Active Content Section */}
        {snap.activeIndex === 1 && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <MyPost />
            </motion.div>

            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {snap.posts.map((post, index) => (
                <motion.div
                  key={post.id || index}
                  variants={item}
                  whileHover={{ y: -5 }}
                  className="transform transition-all duration-300"
                >
                  <FriendsPost post={post} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {snap.activeIndex === 2 && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <CreateSkillPlanBox />
            </motion.div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : snap.skillPlans?.length > 0 ? (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {snap.skillPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    variants={item}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300"
                  >
                    <SkillPlanCard plan={plan} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white rounded-xl shadow-md p-8 text-center"
              >
                <Empty description="You haven't created any skill plans yet" />
              </motion.div>
            )}
          </div>
        )}

        {snap.activeIndex === 3 && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <LearningDashboard />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <MyLearning />
            </motion.div>
          </div>
        )}

        {snap.activeIndex === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <FriendsSection />
          </motion.div>
        )}

        {snap.activeIndex === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <Notifications />
          </motion.div>
        )}
      </motion.div>
      
      {/* Animated background elements similar to CoursePage - only visible on larger screens */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-300 bg-opacity-10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              transition: {
                duration: Math.random() * 30 + 20,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CenterSection;