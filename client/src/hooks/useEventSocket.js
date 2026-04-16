import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '../socket/socket';
import { 
  socketAddAnnouncement, 
  socketUpdateEventStatus 
} from '../redux/slices/eventSlice';

export default function useEventSocket(eventId) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    
    // Safety check - connection implies user is authed in main layout
    if (!socket || !eventId) return;

    // Join the specific Event room natively tracked by backend
    socket.emit("event:join", { eventId }, (response) => {
        if (response?.error) {
           console.error("[Event Socket Join Error]", response.error);
        } else {
           console.log("[Event Socket] Joined Room:", response.room);
        }
    });

    // Event Handlers
    const handleAnnouncement = (payload) => {
      // payload: { eventId, announcement }
      if (payload.eventId === eventId) {
        dispatch(socketAddAnnouncement(payload.announcement));
      }
    };

    const handleStatusChange = (payload) => {
      // payload: { eventId, status }
      if (payload.eventId === eventId) {
        dispatch(socketUpdateEventStatus({ eventId, status: payload.status }));
      }
    };

    const handleLeaderboardUpdate = (payload) => {
      // payload: { eventId, data }
      // Could trigger a soft reload event if you use query invalidation or just standard alert depending on UX patterns.
      if (payload.eventId === eventId) {
         console.log("Live leaderboard update detected:", payload);
      }
    };

    // Attach native Listeners
    socket.on('event:announcement', handleAnnouncement);
    socket.on('event:status_changed', handleStatusChange);
    socket.on('event:leaderboard_update', handleLeaderboardUpdate);

    return () => {
      // Cleanup / Leave Room on Unmount
      socket.emit("event:leave", { eventId });
      socket.off('event:announcement', handleAnnouncement);
      socket.off('event:status_changed', handleStatusChange);
      socket.off('event:leaderboard_update', handleLeaderboardUpdate);
    };
  }, [dispatch, eventId]);
}
