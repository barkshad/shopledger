
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddSale from './components/AddSale';
import SalesHistory from './components/SalesHistory';
import AdminPanel from './components/AdminPanel';
import AnimatedPage from './components/AnimatedPage';
import SplashScreen from './components/SplashScreen';
import AuthPage from './components/AuthPage';
import { ToastProvider, useToast } from './hooks/useToast';
import { useAuth } from './hooks/useAuth';
import ToastContainer from './components/Toast';
import AddExpense from './components/AddExpense';
import ExpensesHistory from './components/ExpensesHistory';
import BottomNav from './components/BottomNav';
import FAB from './components/FAB';
import Statistics from './components/Statistics';
import SearchResults from './components/SearchResults';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import WeeklySales from './components/WeeklySales';
import Spinner from './components/Spinner';

const MotionDiv = motion.div as any;

// Private Route Wrapper
// Fixed: Made children optional to resolve TS error: Property 'children' is missing in type '{}' but required in type '{ children: React.ReactNode; }'
const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background dark:bg-dark-background"><Spinner /></div>;
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const fabPaths = ['/', '/history', '/expenses', '/products', '/customers', '/weekly'];
  const isAuthPage = location.pathname === '/auth';
  const showFab = !isAuthPage && fabPaths.includes(location.pathname) && !!user;

  if (showSplash) return <SplashScreen />;

  return (
    <MotionDiv
      key="main-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface flex flex-col"
    >
      <ToastContainer />
      {!isAuthPage && user && <Header />}
      <main className={`flex-grow ${!isAuthPage ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 md:pb-8' : 'w-full'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/auth" element={<AnimatedPage><AuthPage /></AnimatedPage>} />
            
            <Route path="/" element={<PrivateRoute><AnimatedPage><Dashboard /></AnimatedPage></PrivateRoute>} />
            <Route path="/add-sale" element={<PrivateRoute><AnimatedPage><AddSale /></AnimatedPage></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><AnimatedPage><ProductManagement /></AnimatedPage></PrivateRoute>} />
            <Route path="/customers" element={<PrivateRoute><AnimatedPage><CustomerManagement /></AnimatedPage></PrivateRoute>} />
            <Route path="/add-expense" element={<PrivateRoute><AnimatedPage><AddExpense /></AnimatedPage></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><AnimatedPage><SalesHistory /></AnimatedPage></PrivateRoute>} />
            <Route path="/weekly" element={<PrivateRoute><AnimatedPage><WeeklySales /></AnimatedPage></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute><AnimatedPage><ExpensesHistory /></AnimatedPage></PrivateRoute>} />
            <Route path="/statistics" element={<PrivateRoute><AnimatedPage><Statistics /></AnimatedPage></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AnimatedPage><AdminPanel /></AnimatedPage></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><AnimatedPage><SearchResults /></AnimatedPage></PrivateRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      {showFab && <FAB />}
      {!isAuthPage && user && <BottomNav />}
    </MotionDiv>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
