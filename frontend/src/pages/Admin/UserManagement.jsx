//frontend\src\pages\Admin\UserManagement.jsx
import React, { useState, useEffect } from "react";
import UserList from "./Users/UserList";
import UserDetails from "./Users/UserDetails";
import { getAllUsers } from "@/app/services/userService"; // your existing service

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-6 space-y-6">
      {!selectedUser ? (
        <UserList users={users} onViewDetails={handleViewDetails} />
      ) : (
        <UserDetails user={selectedUser} onBack={handleBack} />
      )}
    </div>
  );
}
