import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import Passwords from './Passwords';
import Settings from './Settings';

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <Navigation />
      <Routes>
        <Route path="/" element={<Passwords />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}
