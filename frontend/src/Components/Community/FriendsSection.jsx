import React, { useEffect, useState } from "react";
import UserConnectionService from "../../Services/UserConnectionService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import axios from "axios";
import { Button, Avatar, Tooltip, Badge } from "antd";
import {
  UserDeleteOutlined,
  MessageOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";

const FriendsSection = () => {
  const snap = useSnapshot(state);
  const [friends, setFriends] = useState([]);
  const [friendsUserNameData, setFriendsUserNameData] = useState([]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    UserConnectionService.getUserConnections(snap.currentUser?.uid)
      .then(async (res) => {
        let friends = [];
        for (var friendId of res.friendIds) {
          const user = snap.users.find((user) => user.id === friendId);
          const users = await axios.get(
            "http://localhost:8080/api/users",
            config
          );

          setFriendsUserNameData(users.data);
          if (user) {
            const u = users.data.find((friend) => friend.id === user.userId);
            if (u) {
              friends.push({
                ...u,
                ...user,
                lastActive: Math.floor(Math.random() * 24),
                mutualFriends: Math.floor(Math.random() * 10),
                isFavorite: Math.random() > 0.7,
              });
            }
          }
        }
        setFriends(friends);
      })
      .catch((err) => {
        console.error("Error loading friends:", err);
      });
  }, [snap.currentUser, snap.users]);

  const unfriend = async (friendId) => {
    try {
      await UserConnectionService.deleteUserConnection(
        snap.currentUser.uid,
        friendId
      );
      const updatedFriends = friends.filter((friend) => friend.id !== friendId);
      setFriends(updatedFriends);
    } catch (error) {
      console.error("Error unfriending:", error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-blue-600 text-xl font-semibold">
          <TeamOutlined />
          <h2>My Friends</h2>
        </div>
        <span className="text-sm text-gray-500">{friends.length} connections</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className={`relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border ${
              friend.isFavorite ? "border-yellow-400" : "border-gray-200"
            }`}
          >
            {friend.isFavorite && (
              <div className="absolute top-2 right-2 text-yellow-400 text-lg">
                <StarFilled />
              </div>
            )}

            <div className="flex justify-center">
              <Badge
                dot
                status={Math.random() > 0.5 ? "success" : "default"}
                offset={[-5, 5]}
              >
                <Avatar
                  src={friend.image}
                  size={80}
                  className="border border-gray-200"
                  icon={!friend.image && <UserOutlined />}
                />
              </Badge>
            </div>

            <div className="text-center mt-2">
              <h3 className="text-gray-800 font-bold">{friend.username}</h3>
              <div className="flex justify-center gap-4 text-sm text-gray-500 mt-1">
                <Tooltip title="Last active">
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined /> {friend.lastActive}h
                  </span>
                </Tooltip>
                <Tooltip title="Mutual friends">
                  <span className="flex items-center gap-1">
                    <TeamOutlined /> {friend.mutualFriends}
                  </span>
                </Tooltip>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                {friend.biography || "No bio available"}
              </p>
            </div>

            <div className="flex justify-center gap-3 mt-3">
              <Tooltip title="Message">
                <Button
                  type="text"
                  icon={<MessageOutlined />}
                  className="text-blue-600 hover:text-blue-800"
                />
              </Tooltip>
              <Tooltip title="Add to favorites">
                <Button
                  type="text"
                  icon={<HeartOutlined />}
                  className="text-pink-500 hover:text-pink-700"
                />
              </Tooltip>
              <Tooltip title="Unfriend">
                <Button
                  type="text"
                  danger
                  icon={<UserDeleteOutlined />}
                  onClick={() => unfriend(friend.id)}
                  className="hover:text-red-600"
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsSection;
