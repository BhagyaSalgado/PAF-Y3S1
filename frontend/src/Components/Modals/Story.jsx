import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSnapshot } from "valtio";
import { FiX, FiUpload, FiTrash2, FiUser, FiCalendar } from "react-icons/fi";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import StoryService from "../../Services/StoryService";

const uploadService = new UploadFileService();

const Story= () => {
  const snap = useSnapshot(state);
  const userId = snap.currentUser?.id;
  const story = snap.selectedStory;
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [author, setAuthor] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setDescription(story.description);
      setUploadedImage(null);
      
      // Find the author of the story
      if (snap.users && story.userId) {
        const storyAuthor = snap.users.find(user => user.id === story.userId);
        setAuthor(storyAuthor);
      }
    }
  }, [story, snap.users]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updatedData = {
        title,
        description,
        image: uploadedImage || story.image,
      };
      
      await StoryService.updateStory(story.id, updatedData);
      state.storyCards = await StoryService.getAllStories();
      state.StoryOpen = false;
    } catch (error) {
      console.error("Error updating story:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await StoryService.deleteStory(story.id);
      state.storyCards = await StoryService.getAllStories();
      state.StoryOpen = false;
    } catch (error) {
      console.error("Failed to delete story:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancel = () => {
    state.StoryOpen = false;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploading(true);
      try {
        const url = await uploadService.uploadFile(file, "Stories");
        setUploadedImage(url);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  if (!story || !snap.StoryOpen) return null;

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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {author?.image ? (
                <img src={author.image} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-gray-500" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{story.title}</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        {userId !== story.userId ? (
          <div className="p-4 space-y-4">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={story.image} 
                alt={story.title} 
                className="w-full max-h-[400px] object-contain"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-800">{story.title}</h3>
              <p className="text-gray-600">{story.description}</p>
              {story.timestamp && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiCalendar size={14} />
                  <span>{new Date(story.timestamp).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="relative">
              {imageUploading ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-blue-500 rounded-full mb-2"></div>
                    <p className="text-gray-600">Uploading image...</p>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={uploadedImage || story.image}
                    alt="Story"
                    className="w-full max-h-[300px] object-contain rounded-lg border"
                  />
                  <label className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors cursor-pointer">
                    <span className="flex items-center gap-1">
                      <FiUpload size={14} />
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </span>
                  </label>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          {userId === story.userId ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 ${
                  deleteLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {deleteLoading ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <FiTrash2 size={16} />
                )}
                <span>Delete</span>
              </button>
              <button
                onClick={handleUpdate}
                disabled={!title.trim() || !description.trim() || loading}
                className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
                  (!title.trim() || !description.trim() || loading) ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </>
          ) : (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Story;