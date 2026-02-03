import React from "react";
import Avatar from "../../common/Avatar";
import Badge from "../../common/Badge";

export default function UserProfileCard({ user }) {
  if (!user) return null;
  return (
    <div className="bg-[#1c2620] border border-[#30363d] rounded-lg p-6 flex flex-col items-center gap-3 shadow-sm">
      <Avatar src={user.avatar} alt={user.name} size="xl" className="mb-2" />
      <h2 className="text-lg font-bold text-white">{user.name}</h2>
      <p className="text-sm text-[#8b949e]">@{user.username}</p>
      <Badge color="primary" className="capitalize mt-2">
        {user.role}
      </Badge>
      <p className="text-xs text-[#8b949e] mt-2">User ID: {user.id}</p>
      <p className="text-xs text-[#8b949e]">Joined: {user.joined}</p>
      <p className="text-xs text-[#8b949e]">Last Login: {user.lastLogin}</p>
      <p className="text-xs text-[#8b949e]">Email: {user.email}</p>
    </div>
  );
}
