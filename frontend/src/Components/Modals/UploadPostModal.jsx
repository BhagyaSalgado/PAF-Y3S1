import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSnapshot } from "valtio";
import { FiUpload, FiX } from "react-icons/fi";
import state from "../../Utils/Store";
import PostService from "../../Services/PostService";
import UploadFileService from "../../Services/UploadFileService";

const uploader = new UploadFileService();

const UpdatePostModal = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [contentDescription, setContentDescription] = useState("");
  const [fileType, setFileType] = useState("image");
  const [image, setImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (snap.selectedPost) {
      setImage(snap.selectedPost.mediaLink);
      setFileType(snap.selectedPost.mediaType);
      setContentDescription(snap.selectedPost.contentDescription);
    }
  }, [snap.selectedPost]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const body = {
        contentDescription,
        mediaLink: image,
        mediaType: fileType,
      };
      await PostService.updatePost(snap.selectedPost.id, body);
      state.posts = (await PostService.getPosts()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      state.updatePostModalOpened = false;
    } catch (error) {
      console.error("Failed to update post:", error);
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

  if (!snap.updatePostModalOpened) return null;

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
          <h2 className="text-xl font-bold text-gray-800">Update Post</h2>
          <button
            onClick={() => (state.updatePostModalOpened = false)}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Description
            </label>
            <textarea
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
              className="w-full border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Update your post content..."
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
                Update Media
              </label>
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-3 rounded-lg border border-dashed border-blue-200 transition-colors">
                <FiUpload size={18} />
                <span>Upload New Media</span>
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
            onClick={() => (state.updatePostModalOpened = false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={!contentDescription.trim() || imageUploading || loading}
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              (!contentDescription.trim() || imageUploading || loading) ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UpdatePostModal;