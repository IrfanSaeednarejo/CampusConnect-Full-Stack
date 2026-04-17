import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCampusBySlug,
  updateCampusThunk,
  selectSelectedCampus,
  selectCampusLoading,
} from '../../redux/slices/campusSlice';
import Button from '../../components/common/Button';
import CircularProgress from '../../components/common/CircularProgress';
import FormField from '../../components/common/FormField';
import Tabs from '../../components/common/Tabs';

export default function CampusDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const campus = useSelector(selectSelectedCampus);
  const loading = useSelector(selectCampusLoading);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (slug) {
      dispatch(fetchCampusBySlug(slug));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (campus) {
      setFormData({
        name: campus.name,
        description: campus.description,
        location: campus.location,
        status: campus.status,
      });
    }
  }, [campus]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateCampusThunk({ slug, data: formData })).unwrap();
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !campus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <CircularProgress />
      </div>
    );
  }

  if (!campus) return <div className="p-8 text-white">Campus not found.</div>;

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/admin/campuses')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Campuses
        </button>

        {/* Hero Banner */}
        <div className="relative h-64 rounded-2xl overflow-hidden mb-8 group">
          <img 
            src={campus.coverImage || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop'} 
            className="w-full h-full object-cover" 
            alt="" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent opacity-80" />
          
          <div className="absolute bottom-6 left-6 flex items-end gap-6">
            <div className="w-24 h-24 bg-[#161b22] border-4 border-[#30363d] rounded-2xl p-2">
              <div className="w-full h-full bg-[#0d1117] rounded-lg flex items-center justify-center">
                {campus.logo ? (
                  <img src={campus.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-500">apartment</span>
                )}
              </div>
            </div>
            <div className="mb-2">
              <h1 className="text-4xl font-bold text-white mb-1">{campus.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 flex items-center gap-1">
                   <span className="material-symbols-outlined text-sm">location_on</span>
                   {campus.location}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                  campus.status === 'active' ? 'bg-[#238636] text-white' : 'bg-red-900 text-red-100'
                }`}>
                  {campus.status}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6">
            <Button 
               variant="outline" 
               className="bg-[#161b22]/50 border-[#30363d] text-white hover:bg-[#161b22]"
               onClick={() => setEditMode(!editMode)}
            >
              <span className="material-symbols-outlined mr-2">edit</span>
              {editMode ? 'Cancel Editing' : 'Edit Configuration'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
               <Tabs 
                 activeTab={activeTab} 
                 onChange={setActiveTab}
                 tabs={[
                   { id: 'overview', label: 'Overview', icon: 'info' },
                   { id: 'users', label: 'Enrolled Users', icon: 'group' },
                   { id: 'societies', label: 'Campus Societies', icon: 'diversity_3' },
                   { id: 'settings', label: 'Advanced Settings', icon: 'settings' }
                 ]} 
               />
               
               <div className="p-6">
                 {activeTab === 'overview' && (
                   <div className="space-y-6">
                     {editMode ? (
                       <form onSubmit={handleUpdate} className="space-y-4">
                         <FormField 
                           label="Campus Name" 
                           value={formData.name} 
                           onChange={(e) => setFormData({...formData, name: e.target.value})} 
                         />
                         <FormField 
                           label="Location" 
                           value={formData.location} 
                           onChange={(e) => setFormData({...formData, location: e.target.value})} 
                         />
                         <div className="space-y-1">
                           <label className="text-sm font-medium text-gray-400">Description</label>
                           <textarea 
                             className="w-full bg-[#0d1117] border border-[#30363d] rounded-md p-3 text-white focus:ring-1 focus:ring-[#58a6ff]"
                             rows="4"
                             value={formData.description}
                             onChange={(e) => setFormData({...formData, description: e.target.value})}
                           />
                         </div>
                         <Button type="submit" variant="primary" className="bg-[#238636] hover:bg-[#2eaa42]">Save Changes</Button>
                       </form>
                     ) : (
                       <>
                         <div>
                           <h3 className="text-lg font-semibold text-white mb-2">About this Node</h3>
                           <p className="text-gray-400 leading-relaxed">{campus.description || 'No description provided for this campus.'}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d]">
                               <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Users</p>
                               <p className="text-2xl font-bold text-white">{campus.userCount || 0}</p>
                            </div>
                            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d]">
                               <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Societies</p>
                               <p className="text-2xl font-bold text-white">{campus.societyCount || 0}</p>
                            </div>
                         </div>
                       </>
                     )}
                   </div>
                 )}
                 
                 {activeTab === 'users' && (
                   <div className="text-center py-12 text-gray-500">
                     <span className="material-symbols-outlined text-4xl mb-4">group</span>
                     <p>User list for this campus is currently unavailable.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-6">
             <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Node Health</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Network Link</span>
                      <span className="text-[#238636] flex items-center gap-1">
                         <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse"></span>
                         Operational
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Created At</span>
                      <span className="text-white">{campus.createdAt ? new Date(campus.createdAt).toLocaleDateString() : 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Last Update</span>
                      <span className="text-white">{campus.updatedAt ? new Date(campus.updatedAt).toLocaleDateString() : 'N/A'}</span>
                   </div>
                </div>
             </div>

             <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6">
                <h3 className="text-red-400 font-semibold mb-2">Danger Zone</h3>
                <p className="text-xs text-red-900/70 mb-4">Archiving or deleting a campus node will affect all associated users and societies.</p>
                <Button variant="outline" className="w-full border-red-900/50 text-red-500 hover:bg-red-900/20 text-xs">
                   Decommission Node
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
