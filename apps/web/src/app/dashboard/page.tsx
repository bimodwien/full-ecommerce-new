import React from 'react';
import LogoutButton from '@/components/logout-button';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-4">
      <div>Dashboard</div>
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
