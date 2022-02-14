import React from 'react';
import NearLogin from '../../components/NearLogin';
import { useAccountId } from '../../store/wallet';
import Dashboard from '../../components/Dashboard';

export default function Home() {
  const accountId = useAccountId();
  return accountId ? <Dashboard /> : <NearLogin />;
}
