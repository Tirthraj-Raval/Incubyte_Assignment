import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '@/contexts/AuthContext';

const Layout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {!isAuthPage && <Navbar />}
        <main className={!isAuthPage ? 'pt-16' : ''}>
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
};

export default Layout;