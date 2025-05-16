import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";

const MyLearning = () => {
  const snap = useSnapshot(state);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden">
      <div className="h-2 bg-blue-500"></div>
      <div className="flex items-center px-6 py-4 space-x-4">
        <div className="text-blue-600 text-3xl">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <div>
          <p className="text-gray-800 font-semibold text-sm md:text-base font-body">
            Track a new learning achievement or progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
