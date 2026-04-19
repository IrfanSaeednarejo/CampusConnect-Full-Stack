import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

// Import Action Thunks here to execute
import { joinGroup } from '../../redux/slices/studyGroupSlice';

export default function AuthActionExecutor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, pendingAction, clearPending } = useAuth();
  const { showSuccess, showError } = useNotification();
  const executingRef = useRef(false); 

  useEffect(() => {
    if (isAuthenticated && pendingAction && !executingRef.current) {
      const action = { ...pendingAction }; // Capture current action
      executingRef.current = true; // Lock execution
      clearPending(); // Clear from state immediately to prevent re-triggering

      const executeAction = async () => {
        try {
          switch (action.type) {
            case 'JOIN_STUDY_GROUP':
              await dispatch(joinGroup(action.payload)).unwrap();
              showSuccess("Successfully joined study group after login!");
              if (action.returnPath) navigate(action.returnPath, { replace: true });
              break;
            case 'REGISTER_EVENT':
              // For events, usually we go to the registration form
              navigate(`/events/${action.payload}/register`, { replace: true });
              break;
            case 'VIEW_CONVERSATION':
              navigate(`/messages/${action.payload}`, { replace: true });
              break;
            default:
              if (action.returnPath) navigate(action.returnPath, { replace: true });
              break;
          }
        } catch (error) {
          showError(error || "Action execution failed");
        } finally {
          executingRef.current = false; // Reset lock (optional, as pendingAction is cleared)
        }
      };

      executeAction();
    }
  }, [isAuthenticated, pendingAction, dispatch, navigate, clearPending, showSuccess, showError]);

  return null;
}
