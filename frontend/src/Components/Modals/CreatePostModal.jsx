import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSnapshot } from "valtio";
import { FiUpload, FiX, FiImage, FiVideo } from "react-icons/fi";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import PostService from "../../Services/PostService";

const uploader = new UploadFileService();

const CreatePostModal = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileType, setFileType] = useState("image");
  const [image, setImage] = useState("");
  const [contentDescription, setContentDescription] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!contentDescription.trim()) {
        throw new Error("Content description is required");
      }
      if (!image) {
        throw new Error("Media is required");
      }

      const body = {
        contentDescription,
        mediaLink: image,
        userId: snap.currentUser?.uid,
        mediaType: fileType,
      };

      const tempId = `temp-${Date.now()}`;
      const tempPost = {
        ...body,
        id: tempId,
        createdAt: new Date().toISOString(),
      };

      state.posts = [tempPost, ...state.posts];
      const newPost = await PostService.createPost(body);
      state.posts = state.posts.map((post) => (post.id === tempId ? newPost : post));

      // Reset and close
      setContentDescription("");
      setImage("");
      setFileType("image");
      state.createPostModalOpened = false;
    } catch (error) {
      state.posts = state.posts.filter((post) => !post.id.startsWith("temp-"));
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploading(true);
      const type = file.type.split("/")[0];
      setFileType(type);
      const url = await uploader.uploadFile(file, "posts");
      setImage(url);
      setImageUploading(false);
    }
  };

  if (!snap.createPostModalOpened) return null;

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
          <h2 className="text-xl font-bold text-gray-800">Create New Post</h2>
          <button
            onClick={() => {
              setContentDescription("");
              setImage("");
              setFileType("image");
              state.createPostModalOpened = false;
            }}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What's on your mind?
            </label>
            <textarea
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
              className="w-full border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your thoughts..."
            />
          </div>

          {imageUploading && (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-blue-500 rounded-full mb-2"></div>
                <p className="text-gray-600">Uploading media...</p>
              </div>
            </div>
          )}

          {!imageUploading && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Media
              </label>
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-3 rounded-lg border border-dashed border-blue-200 transition-colors">
                <FiUpload size={18} />
                <span>Upload Image/Video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {fileType === "image" && image && (
            <div className="relative group">
              <img
                src={image}
                alt="Preview"
                className="w-full max-h-[400px] object-contain rounded-lg border"
              />
              <button
                onClick={() => setImage("")}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
          )}

          {fileType === "video" && image && (
            <div className="relative group">
              <video
                controls
                src={image}
                className="w-full max-h-[400px] rounded-lg border"
              />
              <button
                onClick={() => setImage("")}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={() => {
              setContentDescription("");
              setImage("");
              setFileType("image");
              state.createPostModalOpened = false;
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!contentDescription.trim() || !image || loading}
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              (!contentDescription.trim() || !image || loading) ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;