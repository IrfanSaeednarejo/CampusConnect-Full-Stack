import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCampuses,
  selectCampuses,
  selectCampusLoading,
} from '../../redux/slices/campusSlice';
import Button from '../../components/common/Button';
import CircularProgress from '../../components/common/CircularProgress';
import StatCard from '../../components/common/StatCard';
import { format } from 'date-fns';

export default function CampusList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const campuses = useSelector(selectCampuses);
  const loading = useSelector(selectCampusLoading);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCampuses());
  }, [dispatch]);

  const filteredCampuses = campuses.filter(campus =>
    campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Campus Management</h1>
            <p className="text-gray-400 mt-1">Manage institutional nodes and campus-specific configurations.</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => navigate('/admin/campuses/create')}
            className="bg-[#238636] hover:bg-[#2eaa42] text-white flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create New Campus
          </Button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Campuses" value={campuses.length} icon="apartment" color="blue" />
          <StatCard title="Active Nodes" value={campuses.filter(c => c.status === 'active').length} icon="check_circle" color="green" />
          <StatCard title="Regional Zones" value={new Set(campuses.map(c => c.region)).size} icon="map" color="purple" />
          <StatCard title="Total Students" value={campuses.reduce((acc, c) => acc + (c.userCount || 0), 0)} icon="group" color="orange" />
        </div>

        {/* Search & Filters */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search campuses by name, slug or region..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-2 pl-10 pr-4 text-white focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Campus Grid */}
        {loading && campuses.length === 0 ? (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCampuses.map((campus) => (
              <div 
                key={campus._id} 
                className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#444c56] transition-all group cursor-pointer"
                onClick={() => navigate(`/admin/campuses/${campus.slug}`)}
              >
                <div className="h-32 bg-gradient-to-r from-[#1f6feb] to-[#238636] relative">
                  {campus.coverImage && (
                    <img src={campus.coverImage} alt="" className="w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-60" />
                  )}
                  <div className="absolute -bottom-6 left-6 w-16 h-16 bg-[#0d1117] border-2 border-[#30363d] rounded-lg p-1">
                    <div className="w-full h-full bg-[#161b22] rounded flex items-center justify-center">
                      {campus.logo ? (
                        <img src={campus.logo} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-gray-500">apartment</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 pt-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#58a6ff] transition-colors">{campus.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      campus.status === 'active' ? 'bg-[#238636]/20 text-[#238636]' : 'bg-red-900/20 text-red-400'
                    }`}>
                      {campus.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{campus.description || 'No description provided.'}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-[#30363d]">
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="material-symbols-outlined text-xs mr-2 text-gray-500">location_on</span>
                      {campus.location || 'Not Specified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="material-symbols-outlined text-xs mr-2 text-gray-500">link</span>
                      <span className="font-mono text-gray-400">{campus.slug}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-[#0d1117]/50 border-t border-[#30363d] flex justify-between items-center text-xs text-gray-500">
                  <span>Registered: {campus.createdAt ? format(new Date(campus.createdAt), 'MMM yyyy') : 'N/A'}</span>
                  <div className="flex -space-x-2">
                    {/* Placeholder for small member icons if available */}
                    <div className="w-6 h-6 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[8px]">+{campus.userCount || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
