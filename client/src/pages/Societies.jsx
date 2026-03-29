import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
  fetchSocieties,
  joinSociety,
  leaveSociety
} from "../redux/slices/societiesSlice";
import { getAllSocieties } from "../api/societyApi";
import SectionHeader from "../components/common/SectionHeader";
import SocietyCardSimple from "../components/common/SocietyCardSimple";
import CTACard from "../components/common/CTACard";
import LoginPromptModal from "../components/modals/LoginPromptModal";
import { useNotification } from "../contexts/NotificationContext";

export default function Societies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { addNotification: showToast } = useNotification();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // FIX: Map state directly from legacy plural slices where membership data thrives natively
  const authSocieties = useSelector((state) => state.societiesLegacy?.items || []);
  const actionLoadingMap = useSelector((state) => state.societiesLegacy?.actionLoading || {});

  const [unauthSocieties, setUnauthSocieties] = useState([]);

  // FIX: On mount if authenticated: dispatch(fetchSocieties()) to load membership status.
  // If not authenticated, load societies without membership status.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSocieties());
    } else {
      // Fetch societies from real backend API for unauthenticated users
      getAllSocieties().then((res) => {
        const items = res.data?.docs || res.data || [];
        setUnauthSocieties(Array.isArray(items) ? items : []);
      }).catch(() => setUnauthSocieties([]));
    }
  }, [dispatch, isAuthenticated]);

  // FIX: Post-login intent resolution via sessionStorage
  useEffect(() => {
    if (isAuthenticated) {
      const postLoginAction = sessionStorage.getItem('postLoginAction');
      const postLoginSocietyId = sessionStorage.getItem('postLoginSocietyId');

      if (postLoginAction === 'join' && postLoginSocietyId) {
        dispatch(joinSociety(postLoginSocietyId)).then((res) => {
          if (!res.error) {
            showToast({
              type: 'success',
              message: 'You have joined the society!'
            });
          }
        });
        sessionStorage.removeItem('postLoginAction');
        sessionStorage.removeItem('postLoginSocietyId');
      }
    }
  }, [isAuthenticated, dispatch, showToast]);

  const societiesToDisplay = isAuthenticated && authSocieties.length > 0 ? authSocieties : unauthSocieties;

  // FIX: "Learn More" button -> navigate without auth check
  const handleLearnMore = (societyId) => {
    navigate(`/student/societies/${societyId}`);
  };

  // FIX: State A / State B / State C implementations locally bound context-free
  const handleJoinClick = (society) => {
    const societyId = society.id || society._id;

    if (!isAuthenticated) {
      sessionStorage.setItem('postLoginAction', 'join');
      sessionStorage.setItem('postLoginSocietyId', societyId);
      setShowLoginModal(true);
      return;
    }

    if (society.isMember) {
      if (window.confirm(`Leave ${society.name}?`)) {
        dispatch(leaveSociety(societyId));
      }
    } else {
      dispatch(joinSociety(societyId)).then((res) => {
        if (!res.error) {
          showToast({
            type: 'success',
            message: `You have joined ${society.name}!`
          });
        }
      });
    }
  };

  const handleCreateSociety = () => {
    // FIX: Fallback guest block locally to standard modal popup
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // FIX: Block invalid roles strictly preventing /error/access-denied loops
    if (role !== 'society_head') {
      showToast({
        type: 'info',
        title: 'Society Head Access Required',
        message: 'Only registered Society Heads can create a new society. Contact the admin to upgrade your account.',
      });
      return;
    }

    // Navigates strictly if role is guaranteed perfectly
    navigate("/society/create");
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <SectionHeader
            title="Campus Societies"
            subtitle="Join societies that match your interests and expand your network."
            align="left"
          />
        </div>

        {/* Societies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {societiesToDisplay.map((society) => {
            const societyId = society.id || society._id;
            const isLoading = actionLoadingMap[societyId];

            let joinLabel = "Join";
            let joinOutlined = false;
            let joinDisabled = isLoading;

            // Handle membership status locally for the button UI
            if (isAuthenticated && society.isMember) {
              joinLabel = "Joined ✓";
              joinOutlined = true;
            } else if (isAuthenticated && (society.isPending || society.membershipStatus === 'pending')) {
              joinLabel = "Pending Approval";
              joinOutlined = true;
              joinDisabled = true;
            }

            return (
              <div key={societyId} className="block">
                <SocietyCardSimple
                  name={society.name}
                  category={society.category}
                  members={society.memberCount || 0}
                  description={society.description}
                  head={society.createdBy?.profile?.displayName || "N/A"}
                  onJoin={() => handleJoinClick(society)}
                  onLearnMore={() => handleLearnMore(societyId)}
                  joinLabel={joinLabel}
                  joinLoading={isLoading}
                  joinDisabled={joinDisabled}
                  joinOutlined={joinOutlined}
                />
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <CTACard
          title="Start a New Society"
          description="Have an idea for a society? We'd love to help you launch it!"
          buttonText="Create Society"
          onButtonClick={handleCreateSociety}
        />
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in or create an account to join societies."
      />
    </div>
  );
}
