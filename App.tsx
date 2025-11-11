
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import SalesHistory from './components/SalesHistory';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-sale" element={<AddSale />} />
          <Route path="/history" element={<SalesHistory />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
