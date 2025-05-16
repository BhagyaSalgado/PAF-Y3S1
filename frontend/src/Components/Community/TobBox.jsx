import React, { useEffect } from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import StoryCard from "./StoryCard";
import { PlusOutlined } from "@ant-design/icons";
import StoryService from "../../Services/StoryService";
import { motion } from "framer-motion";

const TopBox = () => {
  const snap = useSnapshot(state);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const stories = await StoryService.getAllStories();
        state.storyCards = stories;
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  if (snap.activeIndex !== 1) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl max-w-5xl shadow-sm border border-gray-200 p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Stories</h2>
        <button 
          className="text-xs text-blue-600 hover:text-blue-800"
          onClick={() => {
            state.createStatusModalOpened = true;
          }}
        >
          View All
        </button>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
        {/* Create Story Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            state.createStatusModalOpened = true;
          }}
          className="flex-shrink-0 w-24 h-40 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-600">
            <PlusOutlined />
          </div>
          <span className="text-xs text-center text-blue-600 font-medium px-2">Create Story</span>
        </motion.div>

        {/* Story Cards */}
        {snap.storyCards?.map((card) => (
          <motion.div 
            key={card?.id}
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0"
          >
            <StoryCard card={card} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopBox;