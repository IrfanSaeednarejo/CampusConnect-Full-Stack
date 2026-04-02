import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProfiles,
  sendConnectionRequest,
  setFilter,
  setPage,
  clearFilters,
  selectPaginatedProfiles,
  selectTotalPages,
  selectFilters,
  selectCurrentPage,
  selectActionLoading
} from '../../redux/slices/academicNetworkSlice';
import { selectUnreadCount } from '../../redux/slices/notificationsSlice';
import { getInitials } from '../../utils/helpers';


export default function AcademicNetwork() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const status = useSelector((state) => state.academicNetwork.status);
  const profiles = useSelector(selectPaginatedProfiles);
  const totalPages = useSelector(selectTotalPages);
  const filters = useSelector(selectFilters);
  const currentPage = useSelector(selectCurrentPage);
  const actionLoading = useSelector(selectActionLoading);
  const unreadCount = useSelector(selectUnreadCount);

  const searchTimeoutRef = useRef(null);
  const gridTopRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProfiles());
  }, [dispatch]);

  // Handle anchor navigation (#events, #mentoring, #societies)
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash, status]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setFilter({ field: 'search', value: val }));
    }, 300);
  };

  const [searchTerm, setSearchTerm] = React.useState(filters.search);
  // The onSearchType function is now redundant as handleSearchChange handles the debounce and state update.
  // It can be removed or refactored if needed elsewhere.
  const onSearchType = (e) => {
    setSearchTerm(e.target.value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setFilter({ field: 'search', value: e.target.value }));
    }, 300);
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilter({ field, value }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setPage(page));
      if (gridTopRef.current) {
        gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isFilterActive = 
    filters.search !== '' ||
    filters.department !== 'All' ||
    filters.interests !== 'All' ||
    filters.society !== 'All' ||
    filters.role !== 'All';

  const roleColors = {
    'Faculty': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Student': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Alumni': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Mentor': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">


      <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
          
          {/* FIX [Bug 5]: Removed floating bell icon — sidebar already has Notifications link with badge */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Academic Network</h1>
              <p className="text-text-secondary mt-1">Connect with students, faculty, alumni, and mentors.</p>
            </div>
          </header>

          {/* FIX [Bug 4]: Converted anchor links to navigate() calls with pill outline styling */}
          <nav className="flex flex-wrap gap-2 text-sm font-medium">
            <button onClick={() => navigate('/student/events')} className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 rounded-full text-sm font-medium transition-colors duration-200">Career Events</button>
            <button onClick={() => navigate('/student/book-mentor')} className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 rounded-full text-sm font-medium transition-colors duration-200">Find a Mentor</button>
            <button onClick={() => navigate('/student/societies')} className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 rounded-full text-sm font-medium transition-colors duration-200">Explore Societies</button>
          </nav>

          <section id="directory" className="pt-4" ref={gridTopRef}>
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-8">
              
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/3">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={onSearchType}
                    placeholder="Search by name, dept, or bio..."
                    className="w-full bg-background border border-border text-white pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        dispatch(setFilter({ field: 'search', value: '' }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                {/* Clear Filters */}
                {isFilterActive && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      dispatch(clearFilters());
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <select 
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="bg-background border border-border text-white py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  {['All', 'Computer Science', 'Software Engineering', 'Business Administration', 'Electrical Engineering', 'Social Sciences', 'Fine Arts'].map(opt => (
                    <option key={opt} value={opt}>{opt === 'All' ? 'All Departments' : opt}</option>
                  ))}
                </select>

                <select 
                  value={filters.interests}
                  onChange={(e) => handleFilterChange('interests', e.target.value)}
                  className="bg-background border border-border text-white py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  {['All', 'AI', 'Machine Learning', 'Web Development', 'Cloud Computing', 'Data Science', 'Cybersecurity', 'Mobile Development', 'UI/UX Design', 'Research'].map(opt => (
                    <option key={opt} value={opt}>{opt === 'All' ? 'All Interests' : opt}</option>
                  ))}
                </select>

                <select 
                  value={filters.society}
                  onChange={(e) => handleFilterChange('society', e.target.value)}
                  className="bg-background border border-border text-white py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="All">All Societies</option>
                  <option value="soc_1">Tech Society</option>
                  <option value="soc_2">Debating Club</option>
                  <option value="soc_3">Photography Society</option>
                  <option value="soc_4">Robotics Club</option>
                  <option value="soc_5">Entrepreneurship Society</option>
                </select>

                <select 
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="bg-background border border-border text-white py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  {['All', 'Student', 'Faculty', 'Alumni', 'Mentor'].map(opt => (
                    <option key={opt} value={opt}>{opt === 'All' ? 'All Roles' : opt}</option>
                  ))}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="mt-6 flex justify-start items-center gap-3">
                <span className="text-sm font-medium text-text-secondary shrink-0">Sort By:</span>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="bg-background border border-border text-white py-1.5 px-3 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="name">Name A-Z</option>
                  <option value="role">Role</option>
                  <option value="department">Department</option>
                </select>
              </div>
            </div>

            {/* Profile Grid */}
            {status === 'loading' ? (
              <div className="flex justify-center items-center py-20">
                <span className="material-symbols-outlined text-4xl text-text-secondary animate-spin">refresh</span>
              </div>
            ) : profiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {profiles.map(profile => (
                    <div key={profile.id} className="bg-surface border border-border rounded-xl p-6 flex flex-col hover:border-blue-500/30 transition-all shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 ${
                            profile.role === 'Faculty' ? 'bg-blue-900 border-blue-500 text-blue-200' :
                            profile.role === 'Student' ? 'bg-green-900 border-green-500 text-green-200' :
                            profile.role === 'Alumni' ? 'bg-orange-900 border-orange-500 text-orange-200' :
                            'bg-purple-900 border-purple-500 text-purple-200'
                          }`}>
                            {getInitials(profile.name)}
                          </div>
                          <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#161b22] ${profile.isOnline ? 'bg-green-500' : 'bg-[#8b949e]'}`}></span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white leading-tight">{profile.name}</h3>
                          <p className="text-sm text-text-secondary mt-1">{profile.department}</p>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold border ${roleColors[profile.role] || 'bg-gray-800 border-gray-600 text-gray-300'}`}>
                            {profile.role} {profile.year ? `· ${profile.year}` : ''}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-text-primary mb-4 line-clamp-2 min-h-[40px]">
                        {profile.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                        {profile.academicInterests?.slice(0, 2).map((interest, idx) => (
                          <span key={idx} className="bg-surface-hover border border-border px-2 py-1 rounded text-xs text-text-secondary">
                            {interest}
                          </span>
                        ))}
                        {profile.academicInterests?.length > 2 && (
                          <span className="bg-surface-hover border border-border px-2 py-1 rounded text-xs text-text-secondary">
                            +{profile.academicInterests.length - 2} more
                          </span>
                        )}
                        {profile.societies?.slice(0, 1).map((soc, idx) => {
                          const nameMap = { soc_1: 'Tech Soc', soc_2: 'Debating', soc_3: 'Photography', soc_4: 'Robotics', soc_5: 'Business' };
                          return (
                            <span key={idx} className="bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded text-xs text-purple-400">
                              {nameMap[soc] || soc}
                            </span>
                          );
                        })}
                      </div>

                      {/* Connection Buttons */}
                      <div className="mt-auto">
                        {profile.connectionStatus === 'none' && (
                          <button
                            onClick={() => dispatch(sendConnectionRequest(profile.id))}
                            disabled={actionLoading[profile.id]}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center h-10 transition-colors disabled:opacity-70"
                          >
                            {actionLoading[profile.id] ? (
                              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                            ) : (
                              'Connect'
                            )}
                          </button>
                        )}
                        
                        {profile.connectionStatus === 'pending' && (
                          <button
                            disabled
                            className="w-full bg-surface-hover text-text-secondary border border-border font-bold py-2 px-4 rounded-lg flex justify-center items-center h-10 cursor-not-allowed"
                          >
                            Pending
                          </button>
                        )}

                        {profile.connectionStatus === 'connected' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/student/academic-network/${profile.id}`)}
                              className="flex-1 bg-surface-hover hover:bg-[#30363d] text-text-primary border border-border font-bold py-2 rounded-lg flex justify-center items-center h-10 transition-colors text-sm"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => navigate('/student/messages', { state: { openChatWith: profile.id } })}
                              className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-lg flex justify-center items-center h-10 transition-colors text-sm gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[18px]">chat</span>
                              Message
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg border font-medium flex items-center justify-center transition-colors ${
                          currentPage === page
                            ? 'bg-primary border-[#2ea043] text-white'
                            : 'bg-background border-border text-text-secondary hover:text-white hover:bg-surface-hover'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-border rounded-xl bg-surface">
                <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">search_off</span>
                <h3 className="text-xl font-bold text-white mb-2">No matching profiles found</h3>
                <p className="text-text-secondary max-w-md">
                  Try adjusting your filters or search terms to see more results from the Campus Connect network.
                </p>
                <button
                  onClick={() => { setSearchTerm(''); dispatch(clearFilters()); }}
                  className="mt-6 px-6 py-2 bg-surface-hover border border-border rounded-lg text-white hover:bg-[#30363d] transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>

          {/* FIX [Bug 4]: Removed dummy anchor sections — navigation is now via navigate() */}

        </div>
      </main>
    </div>
  );
}
