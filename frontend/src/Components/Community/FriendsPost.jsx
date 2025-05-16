import React, { useState, useEffect } from "react";
import UserService from "../../Services/UserService";
import LikeService from "../../Services/LikeService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import CommentService from "../../Services/CommentService";
import PostService from "../../Services/PostService";
import CommentCard from "./CommentCard";
import { 
  FiSend, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical, 
  FiMessageCircle,
} from "react-icons/fi";
import { 
  FiHeart,
  FiShare2
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const FriendsPost = ({ post }) => {
  const snap = useSnapshot(state);
  const [userData, setUserData] = useState();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentAdding, setCommentAdding] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [updatingCommentText, setUpdatingCommentText] = useState();
  const [updatingCommentId, setUpdatingCommentId] = useState();
  const [commentUploading, setCommentUploading] = useState(false);
  const [commentDeleting, setCommentDeleting] = useState(false);
  const [editFocused, setEditFocused] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState();
  const [isLiked, setIsLiked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userLiked = likes.some((like) => like.userId === snap.currentUser?.uid);
    setIsLiked(userLiked);
  }, [likes, snap.currentUser]);

  // Add this check near the top of the component
  useEffect(() => {
    if (!post.id) {
      console.warn("Post without ID detected:", post);
    }
  }, [post]);

  const updatePost = () => {
    state.selectedPost = post;
    state.updatePostModalOpened = true;
    setShowDropdown(false);
  };

  const deletePost = async () => {
    try {
      await PostService.deletePost(post.id);
      state.posts = await PostService.getPosts();
      // Use browser's native alert instead of Ant Design message
      alert("Post deleted successfully");
      setShowDropdown(false);
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  const updateComment = async (id) => {
    try {
      setCommentUploading(true);
      await CommentService.updateComment(id, {
        commentText: updatingCommentText,
      });
      await getCommentsRelatedToPost();
      setUpdatingCommentText("");
      setEditFocused(false);
    } catch (error) {
      alert("Failed to update comment");
    } finally {
      setCommentUploading(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      setCommentDeleting(true);
      await CommentService.deleteComment(id);
      await getCommentsRelatedToPost();
      alert("Comment deleted");
    } catch (error) {
      alert("Failed to delete comment");
    } finally {
      setCommentDeleting(false);
    }
  };

  useEffect(() => {
    UserService.getProfileById(post.userId)
      .then((value) => {
        setUserData(value);
      })
      .catch((err) => {
        console.log(`error getting user data ${err}`);
      });
    getLikesRelatedToPost();
    getCommentsRelatedToPost();
  }, [post]);

  const getLikesRelatedToPost = async () => {
    try {
      const result = await LikeService.getLikesByPostId(post.id);
      setLikes(result);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const getCommentsRelatedToPost = async () => {
    try {
      const result = await CommentService.getCommentsByPostId(post.id);
      setComments(result);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    try {
      await LikeService.createLike(
        {
          postId: post.id,
          userId: snap.currentUser?.uid,
        },
        snap.currentUser?.username,
        post.userId
      );
      // Refresh likes after successful like
      getLikesRelatedToPost();
    } catch (error) {
      alert("Error liking post");
    }
  };

  const handleUnlike = async () => {
    try {
      // Find the like associated with the current user and remove it
      const likeToRemove = likes.find(
        (like) => like.userId === snap.currentUser?.uid
      );
      if (likeToRemove) {
        await LikeService.deleteLike(likeToRemove.id);
        // Refresh likes after successful unlike
        getLikesRelatedToPost();
      }
    } catch (error) {
      alert("Error unliking post");
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      handleUnlike();
    } else {
      handleLike();
    }
  };

  const createComment = async () => {
    if (comment) {
      try {
        setCommentAdding(true);
        const body = {
          postId: post.id,
          userId: snap.currentUser?.uid,
          commentText: comment,
        };
        await CommentService.createComment(
          body,
          snap.currentUser?.username,
          snap.currentUser?.uid
        );
        setComment("");
        await getCommentsRelatedToPost();
      } catch (error) {
        alert("Failed to add comment");
      } finally {
        setCommentAdding(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
      {/* Post Header */}
      <div className="px-6 pt-4 pb-2 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img
            src={userData?.image || "/placeholder-avatar.png"}
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
            onClick={() => {
              if (userData?.profileVisibility) {
                state.selectedUserProfile = userData;
                state.friendProfileModalOpened = true;
              } else {
                alert("Profile is locked");
              }
            }}
            alt="User avatar"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{userData?.username}</h3>
            <span className="text-xs text-gray-500">Posted recently</span>
          </div>
        </div>
        
        {post.userId === snap.currentUser?.uid && (
          <div className="relative">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FiMoreVertical size={20} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                <button 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={updatePost}
                >
                  <FiEdit2 className="mr-2" />
                  Edit
                </button>
                <button 
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  onClick={deletePost}
                >
                  <FiTrash2 className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {post.contentDescription && (
        <div className="px-6 py-2">
          <p className="text-gray-700">{post.contentDescription}</p>
        </div>
      )}

      {/* Post Media */}
      {post.mediaType === "image" && (
        <div className="px-6 py-2">
          <img 
            src={post?.mediaLink} 
            alt="Post content" 
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      )}

      {post.mediaType === "video" && (
        <div className="px-6 py-2">
          <video 
            controls 
            src={post?.mediaLink}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-6 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="bg-blue-100 text-blue-600 p-1 rounded-full">
            {isLiked ? <FaHeart size={14} /> : <FiHeart size={14} />}
          </span>
          <span className="text-sm text-gray-600">{likes.length}</span>
        </div>
        
        <div 
          className="text-sm text-gray-600 cursor-pointer"
          onClick={() => setShowCommentModal(true)}
        >
          {comments.length} comments
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mx-6"></div>

      {/* Post Actions */}
      <div className="px-6 py-2">
        <div className="flex justify-around">
          <button 
            className={`flex items-center justify-center py-2 px-4 rounded-md transition ${isLiked ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={toggleLike}
          >
            {isLiked ? <FaHeart size={18} className="mr-2" /> : <FiHeart size={18} className="mr-2" />}
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          
          <button 
            className="flex items-center justify-center py-2 px-4 text-gray-600 rounded-md hover:bg-gray-100 transition"
            onClick={() => setShowCommentModal(true)}
          >
            <FiMessageCircle size={18} className="mr-2" />
            <span>Comment</span>
          </button>

          <button 
            className="flex items-center justify-center py-2 px-4 text-gray-600 rounded-md hover:bg-gray-100 transition"
          >
            <FiShare2 size={18} className="mr-2" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mx-6"></div>

      {/* Comment Input */}
      <div className="px-6 py-3 flex items-center space-x-3">
        <img 
          src={snap.currentUser?.image || "/placeholder-avatar.png"} 
          className="w-8 h-8 rounded-full object-cover"
          alt="Current user avatar"
        />
        <div className="flex-1 relative">
          <input
            className="w-full py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createComment()}
          />
          <button
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${comment ? 'text-blue-500 hover:bg-blue-100' : 'text-gray-400'}`}
            onClick={createComment}
            disabled={!comment}
          >
            {commentAdding ? (
              <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
            ) : (
              <FiSend size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Comments</h3>
              <button 
                onClick={() => {
                  setShowCommentModal(false);
                  setEditFocused(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            {/* Comments List */}
            <div className="overflow-y-auto flex-1 px-6 py-2">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No comments yet</div>
              ) : (
                comments.map((comment) => {
                  if (comment.userId !== snap.currentUser.uid) {
                    return <CommentCard comment={comment} key={comment.id} />;
                  }
                  
                  return (
                    <div key={comment.id} className="py-3">
                      {editFocused && selectedCommentId === comment.id ? (
                        <div className="flex flex-col space-y-2">
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            defaultValue={comment.commentText}
                            onChange={(e) => {
                              setUpdatingCommentId(comment.id);
                              setUpdatingCommentText(e.target.value);
                            }}
                            autoFocus
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              className="px-4 py-1 text-gray-600 rounded hover:bg-gray-100"
                              onClick={() => setEditFocused(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                              onClick={() => updateComment(comment.id)}
                              disabled={commentUploading}
                            >
                              {commentUploading ? (
                                <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                              ) : (
                                <FiEdit2 size={14} className="mr-1" />
                              )}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex">
                          <img 
                            src={snap.currentUser?.image || "/placeholder-avatar.png"} 
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            alt="User avatar"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="font-medium text-sm">{snap.currentUser?.username}</p>
                              <p className="text-gray-700">{comment.commentText}</p>
                            </div>
                            <div className="flex mt-1 text-xs text-gray-500 space-x-2">
                              {comment.createdAt && (
                                <span>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              )}
                              <button 
                                className="hover:text-gray-700"
                                onClick={() => {
                                  setSelectedCommentId(comment.id);
                                  setEditFocused(true);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="hover:text-red-600"
                                onClick={() => deleteComment(comment.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPost;