import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AppShell from './layout/AppShell';
import Layout from './Layout';
import AuthModal from './common/AuthModal';
import AuthActionExecutor from './common/AuthActionExecutor';

/**
 * ModularLayout — Hybrid layout that selects between AppShell (authenticated)
 * and PublicLayout (unauthenticated) based on user state.
 * It also mounts the global AuthModal.
 */
export default function ModularLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? <AppShell /> : <Layout />}
      <AuthActionExecutor />
      <AuthModal />
    </>
  );
}
