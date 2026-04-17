import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import { clearSearch, clearViewedProfile } from "../../redux/slices/userSlice";
import { clearAllNotifications } from "../../redux/slices/notificationSlice";
import { useAuth } from "../../hooks/useAuth.js";

export default function Logout() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { logout } = useAuth();

	useEffect(() => {
		logout();
		dispatch(logoutAction());
		dispatch(clearSearch());
		dispatch(clearViewedProfile());
		dispatch(clearAllNotifications());
		navigate("/login", { replace: true });
	}, [dispatch, logout, navigate]);

	return (
		<div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[#c9d1d9]">
			<p className="text-sm">Signing you out...</p>
		</div>
	);
}
