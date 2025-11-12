import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import SalesHistory from './components/SalesHistory';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import AnimatedPage from './components/AnimatedPage';
import SplashScreen from './components/SplashScreen';

function App() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Display splash for 3 seconds

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);


  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <motion.div
          key="main-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background text-on-surface flex flex-col"
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
