import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingSocietiesThunk,
  updateSocietyStatusThunk,
  selectPendingSocieties,
  selectAdminLoading,
} from '../../redux/slices/adminSlice';
import Button from '../../components/common/Button';
import CircularProgress from '../../components/common/CircularProgress';

export default function SocietyApproval() {
  const dispatch = useDispatch();
  const societies = useSelector(selectPendingSocieties);
  const loading = useSelector(selectAdminLoading);

  useEffect(() => {
    dispatch(fetchPendingSocietiesThunk());
  }, [dispatch]);

  const handleApprove = async (societyId) => {
    if (window.confirm("Approve this society registration?")) {
      await dispatch(updateSocietyStatusThunk({ societyId, status: 'approved' })).unwrap();
      dispatch(fetchPendingSocietiesThunk());
    }
  };

  const handleReject = async (societyId) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason) {
      await dispatch(updateSocietyStatusThunk({ societyId, status: 'rejected', reason })).unwrap();
      dispatch(fetchPendingSocietiesThunk());
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0d1117] text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Society Approvals</h1>
          <p className="text-gray-400 mt-1">Review new society applications and verify the legitimacy of student leadership.</p>
        </header>

        {loading && societies.length === 0 ? (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {societies.map((society) => (
              <div key={society._id} className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-64 h-48 md:h-auto bg-[#0d1117] flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#30363d]">
                   {society.logo ? (
                     <img src={society.logo} className="max-w-full max-h-full object-contain" alt="" />
                   ) : (
                     <span className="material-symbols-outlined text-6xl text-gray-700">groups</span>
                   )}
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <h2 className="text-2xl font-bold text-white">{society.name}</h2>
                       <span className="text-xs font-mono text-gray-500 uppercase">Pending Review</span>
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-3">{society.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                       <div className="flex items-center gap-2 text-gray-300">
                          <span className="material-symbols-outlined text-xs text-blue-400">person</span>
                          <span>Creator: <span className="text-white">{society.createdBy?.name || 'Unknown'}</span></span>
                       </div>
                       <div className="flex items-center gap-2 text-gray-300">
                          <span className="material-symbols-outlined text-xs text-indigo-400">category</span>
                          <span>Category: <span className="text-white">{society.category}</span></span>
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-[#30363d]">
                     <Button 
                       variant="primary" 
                       className="flex-1 bg-[#238636] hover:bg-[#2eaa42] text-white"
                       onClick={() => handleApprove(society._id)}
                     >
                       Approve Society
                     </Button>
                     <Button 
                       variant="outline" 
                       className="flex-1 border-red-900/50 text-red-500 hover:bg-red-900/10"
                       onClick={() => handleReject(society._id)}
                     >
                       Reject Request
                     </Button>
                  </div>
                </div>
              </div>
            ))}

            {societies.length === 0 && (
              <div className="bg-[#161b22] border border-[#30363d] border-dashed rounded-2xl py-20 text-center text-gray-500">
                <span className="material-symbols-outlined text-5xl mb-4">task_alt</span>
                <p className="text-xl font-medium text-white mb-2">Clear Queue!</p>
                <p>There are no pending society registration requests at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
