import React, { useEffect, useState } from "react";
import axios from "axios";
import UserService from "../../Services/UserService";
import { BASE_URL } from "../../constants";
import state from "../../Utils/Store";

const CommentCard = ({ comment }) => {
  const [userData, setUserData] = useState();

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const result = await UserService.getProfileById(comment.userId);
      const result2 = await axios.get(
        `${BASE_URL}/users/${result.userId}`,
        config
      );
      setUserData({ ...result2.data, ...result });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [comment.id]);

  return (
    <div className="flex py-3">
      {userData && (
        <>
          <img
            className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
            onClick={() => {
              state.selectedUserProfile = userData;
              state.friendProfileModalOpened = true;
            }}
            src={userData.image || "/placeholder-avatar.png"}
            alt={`${userData.username || "User"}'s avatar`}
          />
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-medium text-sm">{userData.username || "User"}</p>
              <p className="text-gray-700">{comment.commentText}</p>
            </div>
            {comment.createdAt && (
              <div className="mt-1 text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </>
      )}
      {!userData && (
        <div className="flex items-center justify-center w-full py-2">
          <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-500">Loading comment...</span>
        </div>
      )}
    </div>
  );
};

export default CommentCard;