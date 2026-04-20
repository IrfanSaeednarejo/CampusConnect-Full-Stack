import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, selectViewedProfile, selectUserViewLoading, selectUserViewError, clearViewedProfile } from "../../redux/slices/userSlice";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";
import Card from "../../components/common/Card";
import ConnectionButton from "../../components/network/ConnectionButton";

export default function PublicUserProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector(selectViewedProfile);
  const loading = useSelector(selectUserViewLoading);
  const error = useSelector(selectUserViewError);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserProfile(id));
    }
    return () => {
      dispatch(clearViewedProfile());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="w-full bg-[#0d1117] min-h-screen text-[#c9d1d9] flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full bg-[#0d1117] min-h-screen text-[#c9d1d9]">
        <ProfilePageHeader title="User Not Found" onBack={() => navigate(-1)} />
        <div className="flex justify-center p-8 text-[#da3633]">
          {error || "User could not be found."}
        </div>
      </div>
    );
  }

  const firstName = profile.profile?.firstName || "";
  const lastName = profile.profile?.lastName || "";
  const fullName = firstName ? `${firstName} ${lastName}`.trim() : "User";
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      <ProfilePageHeader
        title={`${fullName}'s Profile`}
        onBack={() => navigate(-1)}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card padding="p-6">
          <div className="flex items-start gap-6">
            {profile.profile?.avatar ? (
               <img 
                 src={profile.profile.avatar} 
                 alt={fullName} 
                 className="w-24 h-24 rounded-full object-cover border-2 border-[#30363d]" 
               />
             ) : (
               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#238636] to-[#1f6feb] flex items-center justify-center text-white text-3xl font-bold">
                 {initials}
               </div>
             )}

             <div className="flex-1">
               <h2 className="text-2xl font-bold text-white mb-1">
                 {fullName}
               </h2>
               {profile.profile?.displayName && (
                 <p className="text-[#8b949e] text-sm mb-1">@{profile.profile.displayName}</p>
               )}
               <div className="flex flex-wrap items-center gap-3 mt-3">
                 {profile.roles && profile.roles.map(r => (
                   <span key={r} className="px-3 py-1 bg-[#1f6feb]/20 text-[#58a6ff] rounded-full text-xs font-medium uppercase tracking-wider">
                     {r.replace('_', ' ')}
                   </span>
                 ))}
                 {profile.academic?.department && (
                   <span className="px-3 py-1 bg-[#238636]/20 text-[#3fb950] rounded-full text-xs font-medium">
                     {profile.academic.department}
                   </span>
                 )}
               </div>
               <div className="mt-4">
                 <ConnectionButton targetUserId={id} />
               </div>
             </div>
          </div>
          {profile.profile?.bio && (
            <div className="mt-6 pt-6 border-t border-[#30363d]">
              <h3 className="text-sm font-semibold text-[#8b949e] mb-2">Bio</h3>
              <p className="text-[#c9d1d9]">{profile.profile.bio}</p>
            </div>
          )}
        </Card>

        {profile.academic?.degree && (
          <Card padding="p-6">
             <h3 className="text-lg font-semibold text-white mb-4">Academics</h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-[#8b949e] mb-1">Degree</p>
                 <p>{profile.academic.degree}</p>
               </div>
               <div>
                 <p className="text-[#8b949e] mb-1">Department</p>
                 <p>{profile.academic.department}</p>
               </div>
               {profile.academic.enrollmentYear && (
                 <div>
                   <p className="text-[#8b949e] mb-1">Enrollment</p>
                   <p>{profile.academic.enrollmentYear}</p>
                 </div>
               )}
               {profile.academic.expectedGraduation && (
                 <div>
                   <p className="text-[#8b949e] mb-1">Graduation</p>
                   <p>{profile.academic.expectedGraduation}</p>
                 </div>
               )}
             </div>
          </Card>
        )}
      </div>
    </div>
  );
}
