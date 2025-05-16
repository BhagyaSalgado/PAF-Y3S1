import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSnapshot } from "valtio";
import { FiX, FiCalendar, FiBook, FiAward } from "react-icons/fi";
import state from "../../Utils/Store";
import SkillPlanService from "../../Services/SkillPlanService";

const CreateSkillPlanModal = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [skillDetails, setSkillDetails] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [resources, setResources] = useState("");
  const [date, setDate] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!skillDetails.trim() || !resources.trim() || !date) {
        throw new Error("Please fill all required fields");
      }

      const newSkillPlan = {
        skillDetails,
        skillLevel,
        resources,
        userId: snap.currentUser?.uid,
        date: new Date(date).toISOString().split('T')[0],
        isFinished,
        finished: isFinished
      };

      await SkillPlanService.createSkillPlan(newSkillPlan);
      const refreshedPlans = await SkillPlanService.getUserSkillPlans(snap.currentUser?.uid);
      state.skillPlans = refreshedPlans;
      
      // Reset form
      setSkillDetails("");
      setSkillLevel("beginner");
      setResources("");
      setDate("");
      setIsFinished(false);
      
      state.createSkillPlanOpened = false;
    } catch (error) {
      console.error("Error creating skill plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!snap.createSkillPlanOpened) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Create New Skill Plan</h2>
          <button
            onClick={() => state.createSkillPlanOpened = false}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FiBook size={16} />
              <span>Skill Details</span>
            </label>
            <textarea
              value={skillDetails}
              onChange={(e) => setSkillDetails(e.target.value)}
              className="w-full border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What skill do you want to develop?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FiAward size={16} />
              <span>Skill Level</span>
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resources (Books, courses, websites)
            </label>
            <textarea
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              className="w-full border rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List your learning resources..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FiCalendar size={16} />
              <span>Scheduled Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFinished"
              checked={isFinished}
              onChange={(e) => setIsFinished(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFinished" className="ml-2 block text-sm text-gray-700">
              Mark as completed
            </label>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={() => state.createSkillPlanOpened = false}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!skillDetails.trim() || !resources.trim() || !date || loading}
            className={`px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors ${
              (!skillDetails.trim() || !resources.trim() || !date || loading) ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateSkillPlanModal;