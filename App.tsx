import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import SalesHistory from './components/SalesHistory';
import AdminPanel from './components/AdminPanel';
import AnimatedPage from './components/AnimatedPage';
import SplashScreen from './components/SplashScreen';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/Toast';
import AddExpense from './components/AddExpense';
import ExpensesHistory from './components/ExpensesHistory';
import BottomNav from './components/BottomNav';
import FAB from './components/FAB';

function App() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Splash screen duration

    return () => clearTimeout(timer);
  }, []);

  const fabPaths = ['/', '/history', '/expenses'];
  const showFab = fabPaths.includes(location.pathname);

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface flex flex-col"
          >
            <ToastContainer />
            <Header />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 md:pb-8">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
                  <Route path="/add-sale" element={<AnimatedPage><AddSale /></AnimatedPage>} />
                  <Route path="/add-expense" element={<AnimatedPage><AddExpense /></AnimatedPage>} />
                  <Route path="/history" element={<AnimatedPage><SalesHistory /></AnimatedPage>} />
                  <Route path="/expenses" element={<AnimatedPage><ExpensesHistory /></AnimatedPage>} />
                  <Route path="/admin" element={<AnimatedPage><AdminPanel /></AnimatedPage>} />
                </Routes>
              </AnimatePresence>
            </main>
            {showFab && <FAB />}
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </ToastProvider>
  );
}

export default App;
