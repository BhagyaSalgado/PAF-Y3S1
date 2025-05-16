import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSnapshot } from "valtio";
import { FiUpload, FiX, FiImage, FiCalendar, FiEdit2 } from "react-icons/fi";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import StoryService from "../../Services/StoryService";

const uploader = new UploadFileService();

const CreateStoryModal = () => {
  const snap = useSnapshot(state);
  const [imageUploading, setImageUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const handleCreateStory = async () => {
    try {
      if (!title.trim() || !description.trim()) {
        throw new Error("Please fill all required fields");
      }
      
      if (!image) {
        throw new Error("Please upload an image");
      }
      
      setLoading(true);
      const body = {
        title,
        description,
        timestamp: date || new Date().toISOString(),
        image,
        userId: snap.currentUser?.id,
      };
      
      await StoryService.createStory(body);
      state.storyCards = await StoryService.getAllStories();
      
      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setImage(null);
      state.createStatusModalOpened = false;
    } catch (error) {
      console.error("Error creating story:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploading(true);
      try {
        const url = await uploader.uploadFile(file, "Stories");
        setImage(url);
      } catch (error) {
        console.error("Failed to upload image:", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setImage(null);
    state.createStatusModalOpened = false;
  };

  if (!snap.createStatusModalOpened) return null;

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Create New Story</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter story title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your story"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FiCalendar size={16} />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            {imageUploading ? (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full mb-2"></div>
                  <p className="text-gray-600">Uploading image...</p>
                </div>
              </div>
            ) : image ? (
              <div className="relative group">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full max-h-[300px] object-cover rounded-lg border"
                />
                <label className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors cursor-pointer">
                  <span className="flex items-center gap-1">
                    <FiEdit2 size={14} />
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </span>
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 p-8 rounded-lg border border-dashed border-gray-300 transition-colors">
                <FiImage size={32} className="text-gray-400" />
                <span className="text-gray-600">Click to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateStory}
            disabled={!title.trim() || !description.trim() || !image || loading}
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              (!title.trim() || !description.trim() || !image || loading) ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Story"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateStoryModal;