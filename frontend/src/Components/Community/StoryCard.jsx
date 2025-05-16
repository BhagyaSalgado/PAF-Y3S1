import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import { motion } from "framer-motion";

const StoryCard = ({ card }) => {
  const snap = useSnapshot(state);

  const handleClick = () => {
    state.selectedStory = card;
    state.StoryOpen = true;
  };

  const userImage = snap.users?.find(user => user.id === card.userId)?.image;

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer w-28 h-40 rounded-xl overflow-hidden shadow-md"
    >
      {/* Story Image with Gradient Overlay */}
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* User Avatar */}
      <div className="absolute top-2 left-2 z-10">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden">
          <img
            src={userImage || '/default-avatar.png'}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Story Title */}
      <div className="absolute bottom-3 left-2 right-2">
        <p className="text-white text-sm font-medium line-clamp-2">
          {card.title}
        </p>
      </div>
      
      {/* Create Story Plus Icon (only shown if it's a create story card) */}
      {card.isCreateStory && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StoryCard;