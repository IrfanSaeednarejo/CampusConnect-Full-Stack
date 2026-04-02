import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction, clearOnboarding } from "../../redux/slices/authSlice";
import { resetUserState } from "../../redux/slices/userSlice";
// FIX: Migrated from deleted notificationSlice.js to consolidated notificationsSlice.js
import { clearAllNotifications } from "../../redux/slices/notificationsSlice";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function Logout() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { logout } = useAuth();

	useEffect(() => {
		logout();
		dispatch(logoutAction());
		dispatch(clearOnboarding());
		dispatch(resetUserState());
		dispatch(clearAllNotifications());
		navigate("/login", { replace: true });
	}, [dispatch, logout, navigate]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center text-text-primary">
			<p className="text-sm">Signing you out...</p>
		</div>
	);
}
