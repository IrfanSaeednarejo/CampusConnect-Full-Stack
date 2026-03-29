import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSocieties,
  joinSociety,
  leaveSociety,
  selectMySocieties,
  selectDiscoverSocieties,
  selectSocietyActionLoading,
} from "../../redux/slices/societiesSlice";
import { useModal, MODAL_TYPES } from "../../contexts/ModalContext";
import Avatar from "../../components/common/Avatar";

// --- SUBCOMPONENTS ---

function SocietyActionBlock({ society, tab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const isLoading = useSelector((state) => selectSocietyActionLoading(state, society._id));

  return (
    <div className="flex gap-2 w-full mt-4">
      {tab === "my" ? (
        <>
          <button
            onClick={() => navigate(`/student/societies/${society._id}`)}
            disabled={isLoading}
            className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            View Details
          </button>
          <button
            onClick={() => openModal(MODAL_TYPES.LEAVE_SOCIETY, {
              societyId: society._id,
              societyName: society.name,
              onConfirm: () => dispatch(leaveSociety(society._id))
            })}
            disabled={isLoading}
            className="flex-1 border border-[#f85149] text-[#f85149] hover:bg-[#f85149]/10 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">logout</span>
            )}
            Leave
          </button>
        </>
      ) : (
        <button
          onClick={() => openModal(MODAL_TYPES.JOIN_SOCIETY, {
            societyId: society._id,
            societyName: society.name,
            onConfirm: () => dispatch(joinSociety(society._id))
          })}
          disabled={isLoading}
          className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">group_add</span>
          )}
          Join Now
        </button>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function StudentSocieties() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState("all");

  // Get user profile and auth state
  const userProfile = useSelector((state) => state.user?.profile);
  const authUser = useSelector((state) => state.auth?.user);
  const campusId = authUser?.campusId || userProfile?.campusId;

  const status = useSelector((state) => state.societiesLegacy?.status);
  const allSocieties = useSelector((state) => state.societiesLegacy?.items || []);
  const mySocieties = useSelector(selectMySocieties);
  const discoverSocieties = useSelector(selectDiscoverSocieties);

  useEffect(() => {
    const filters = campusId ? { campusId } : {};
    dispatch(fetchSocieties(filters));
  }, [dispatch, campusId]);

  let displaySocieties = [];
  if (activeTab === "all") displaySocieties = allSocieties;
  else if (activeTab === "my") displaySocieties = mySocieties;
  else if (activeTab === "discover") displaySocieties = discoverSocieties;

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen pb-12">

      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 py-5 md:py-10 max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-white">Societies & Clubs</h1>
          <p className="text-[#8b949e]">Join communities and make meaningful connections in your campus.</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2 mb-8 inline-flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "all" ? "bg-[#238636] text-white" : "text-[#c9d1d9] hover:bg-[#30363d]"
            }`}
          >
            All Societies ({allSocieties.length})
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "my" ? "bg-[#238636] text-white" : "text-[#c9d1d9] hover:bg-[#30363d]"
            }`}
          >
            My Societies ({mySocieties.length})
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "discover" ? "bg-[#238636] text-white" : "text-[#c9d1d9] hover:bg-[#30363d]"
            }`}
          >
            Discover ({discoverSocieties.length})
          </button>
        </div>

        {/* Loading Skeletons */}
        {status === 'loading' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-[#161b22] h-64 rounded-lg border border-[#30363d]"></div>
            ))}
          </div>
        )}

        {/* Societies Grid */}
        {status === 'succeeded' && displaySocieties.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-[#8b949e] mb-4">search_off</span>
            <h3 className="text-xl font-bold text-white mb-2">No societies found</h3>
            <p className="text-[#8b949e]">There are no societies in this category for your campus.</p>
          </div>
        ) : status === 'succeeded' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySocieties.map((society) => {
              const imgUrl = society.media?.logo || society.logo;
              return (
              <div
                key={society._id}
                className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col hover:border-[#238636]/50 transition-colors relative"
              >
                {/* Category Badge */}
                <span className="absolute top-5 right-5 bg-[#30363d] text-[#c9d1d9] text-xs px-2 py-1 rounded font-medium">
                  {society.category}
                </span>

                {/* Society Header */}
                <div className="flex items-center gap-4 mb-4">
                  {imgUrl?.length < 5 ? (
                    <div className="w-14 h-14 rounded-full bg-[#0d1117] flex flex-shrink-0 items-center justify-center text-3xl border border-[#30363d]">
                      {imgUrl}
                    </div>
                  ) : (
                    <div 
                      className="w-14 h-14 rounded-full bg-cover bg-center flex flex-shrink-0 border border-[#30363d]"
                      style={{ backgroundImage: `url("${imgUrl || '/placeholder-society.png'}")` }}
                    />
                  )}
                  <div className="flex flex-col pr-12">
                    <h3 className="text-white font-bold text-lg leading-tight">{society.name}</h3>
                    {society.userRole && (
                      <span className="text-[#238636] text-xs font-bold mt-1 uppercase tracking-wider">
                        Role: {society.userRole}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[#8b949e] text-sm mb-6 flex-1">
                  {society.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-auto">
                  <div className="flex items-center gap-1.5 text-[#c9d1d9] text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px] text-[#8b949e]">groups</span>
                    {society.memberCount}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#c9d1d9] text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px] text-[#8b949e]">event</span>
                    {society.eventCount}
                  </div>
                </div>

                {/* Buttons Component */}
                <SocietyActionBlock 
                  society={society} 
                  tab={society.isMember || society.isCreator ? "my" : "discover"} 
                />
              </div>
            )})}
          </div>
        ) : null}
      </main>
    </div>
  );
}
