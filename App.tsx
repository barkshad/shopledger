import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import SalesHistory from './components/SalesHistory';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import AnimatedPage from './components/AnimatedPage';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
            <Route path="/add-sale" element={<AnimatedPage><AddSale /></AnimatedPage>} />
            <Route path="/history" element={<AnimatedPage><SalesHistory /></AnimatedPage>} />
            <Route path="/admin" element={<AnimatedPage><AdminPanel /></AnimatedPage>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;