import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendConnectionRequest, respondToConnectionRequest, cancelConnectionRequest, removeConnection } from '../../api/networkApi';
import { fetchNetworkState } from '../../redux/slices/networkSlice';
import { createOrGetDMThunk } from '../../redux/slices/chatSlice';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ConnectionButton({ targetUserId, fullWidth = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { connected, pendingSent, pendingReceived } = useSelector((state) => state.network);

  const isConnected = connected.find((c) => c.user._id === targetUserId);
  const isPendingSent = pendingSent.find((c) => c.user._id === targetUserId);
  const isPendingReceived = pendingReceived.find((c) => c.user._id === targetUserId);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await sendConnectionRequest(targetUserId);
      dispatch(fetchNetworkState());
      toast.success('Connection request sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!isPendingSent) return;
    setLoading(true);
    try {
      await cancelConnectionRequest(isPendingSent.connectionId);
      dispatch(fetchNetworkState());
      toast.success('Request cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isPendingReceived) return;
    setLoading(true);
    try {
      await respondToConnectionRequest(isPendingReceived.connectionId, 'accept');
      dispatch(fetchNetworkState());
      toast.success('Connection accepted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!isPendingReceived) return;
    setLoading(true);
    try {
      await respondToConnectionRequest(isPendingReceived.connectionId, 'reject');
      dispatch(fetchNetworkState());
      toast.success('Connection rejected');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    setLoading(true);
    try {
      const result = await dispatch(createOrGetDMThunk(targetUserId)).unwrap();
      navigate(`/messages/${result._id}`);
    } catch (err) {
      toast.error('Could not open chat. You must be connected first.');
    } finally {
      setLoading(false);
    }
  };

  const btnClass = fullWidth ? 'w-full justify-center' : '';

  if (isConnected) {
    return (
      <Button variant="secondary" onClick={handleMessage} disabled={loading} className={btnClass}>
        {loading ? 'Opening...' : '💬 Message'}
      </Button>
    );
  }

  if (isPendingSent) {
    return (
      <Button variant="secondary" disabled={loading} onClick={handleCancel} className={btnClass}>
        {loading ? 'Cancelling...' : 'Cancel Request'}
      </Button>
    );
  }

  if (isPendingReceived) {
    return (
      <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
        <Button variant="primary" disabled={loading} onClick={handleAccept} className="flex-1 justify-center">
          Accept
        </Button>
        <Button variant="secondary" disabled={loading} onClick={handleReject} className="flex-1 justify-center">
          Reject
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" disabled={loading} onClick={handleConnect} className={btnClass}>
      {loading ? 'Connecting...' : '+ Connect'}
    </Button>
  );
}
