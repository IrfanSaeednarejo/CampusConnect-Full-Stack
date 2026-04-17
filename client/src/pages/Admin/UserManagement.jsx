import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllUsersThunk,
  updateUserRoleThunk,
  toggleUserSuspensionThunk,
  selectAdminUsers,
  selectAdminPagination,
  selectAdminLoading,
  selectAdminError,
} from '../../redux/slices/adminSlice';
import Button from '../../components/common/Button';
import CircularProgress from '../../components/common/CircularProgress';
import UserManagementHeader from '../../components/admin/UserManagementHeader'; // Optional if we want a separate header or just keep it local
import SearchInput from '../../components/common/SearchInput';

export default function UserManagement() {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const pagination = useSelector(selectAdminPagination);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  
  const [params, setParams] = useState({ page: 1, limit: 10, search: '', role: '' });
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(p => ({ ...p, search: searchValue, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    dispatch(fetchAllUsersThunk(params));
  }, [dispatch, params]);

  const handleRoleChange = (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      dispatch(updateUserRoleThunk({ userId, role: newRole }));
    }
  };

  const handleToggleSuspension = (userId) => {
    dispatch(toggleUserSuspensionThunk(userId));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0d1117] text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-gray-400 mt-1">Audit permissions, adjust roles, and manage account statuses across the platform.</p>
        </header>

        {/* Filters and Search */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full max-w-md">
            <SearchInput 
              placeholder="Search by name, email or username..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="!max-w-none w-full"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-sm focus:ring-1 focus:ring-[#58a6ff]"
              value={params.role}
              onChange={(e) => setParams({...params, role: e.target.value, page: 1})}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="society_head">Society Head</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="flex justify-center py-20">
               <CircularProgress />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0d1117] border-b border-[#30363d]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            className="w-10 h-10 rounded-full border border-[#30363d]" 
                            alt="" 
                          />
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-[#58a6ff]"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="society_head">Society Head</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                          user.isSuspended ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'
                        }`}>
                          {user.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          variant="outline" 
                          className={`text-xs py-1 px-3 ${user.isSuspended ? 'border-green-900/50 text-green-500 hover:bg-green-900/10' : 'border-red-900/50 text-red-500 hover:bg-red-900/10'}`}
                          onClick={() => handleToggleSuspension(user._id)}
                        >
                          {user.isSuspended ? 'Activate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="py-20 text-center text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-4">person_search</span>
                  <p>No users found matching the criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between">
               <div className="text-xs text-gray-500">
                 Showing page {pagination.currentPage} of {pagination.pages}
               </div>
               <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-xs disabled:opacity-30" 
                    disabled={params.page === 1}
                    onClick={() => setParams({...params, page: params.page - 1})}
                  >Previous</Button>
                  <Button 
                    variant="outline" 
                    className="text-xs disabled:opacity-30" 
                    disabled={params.page === pagination.pages}
                    onClick={() => setParams({...params, page: params.page + 1})}
                  >Next</Button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
