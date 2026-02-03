import React from "react";
import Avatar from "../common/Avatar";

export default function UserTable({ users, getStatusBadge }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="bg-gray-50 dark:bg-[#161b22]">
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-t border-gray-100 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-[#21262d]"
            >
              <td className="px-4 py-2 flex items-center gap-2">
                <Avatar src={user.avatar} alt={user.name} size="sm" />
                <span>{user.name}</span>
              </td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">
                {getStatusBadge ? getStatusBadge(user.status) : user.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
