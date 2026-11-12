import React, { useEffect, useState } from 'react';
import { CoffeeProvider } from './context/CoffeeContext';
import { AppRole, detectAppRoleFromUrl } from './utils/appUrl';
import { GuestApp } from './apps/GuestApp';
import { OwnerApp } from './apps/OwnerApp';
import { ManagerApp } from './apps/ManagerApp';
import { BaristaApp } from './apps/BaristaApp';

function RoleRouter() {
  const [role, setRole] = useState<AppRole>(() => detectAppRoleFromUrl());

  useEffect(() => {
    const syncRoleFromUrl = () => {
      setRole(detectAppRoleFromUrl());
    };
    window.addEventListener('popstate', syncRoleFromUrl);
    return () => window.removeEventListener('popstate', syncRoleFromUrl);
  }, []);

  useEffect(() => {
    const titles: Record<AppRole, string> = {
      guest: 'MIX MART · Guest Ordering Menu',
      owner: 'MIX MART · Owner Control App',
      manager: 'MIX MART · Branch Manager App',
      barista: 'MIX MART · Barista Counter App',
    };
    document.title = titles[role];
  }, [role]);

  if (role === 'owner') return <OwnerApp />;
  if (role === 'manager') return <ManagerApp />;
  if (role === 'barista') return <BaristaApp />;
  return <GuestApp />;
}

export function App() {
  return (
    <CoffeeProvider>
      <RoleRouter />
    </CoffeeProvider>
  );
}

export default App;
