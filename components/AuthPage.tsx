
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShoppingCartIcon, SparklesIcon, CheckCircleIcon, ArrowUpRightIcon } from './icons';

const MotionDiv = motion.div as any;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  if (user && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Welcome back to ShopLedger!', 'success');
      } else {
        await register(email, password);
        addToast('Account created successfully!', 'success');
      }
      navigate('/');
    } catch (error: any) {
      console.error(error);
      const msg = error.code === 'auth/user-not-found' 
        ? 'No account found with this email.' 
        : error.code === 'auth/wrong-password' 
        ? 'Incorrect password.' 
        : error.message;
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    "Smart Sales & Expense Tracking",
    "Cloud Backup & Multi-device Sync",
    "Gemini AI Business Insights",
    "Professional PDF/CSV Reports"
  ];

  return (
    <div className="min-h-screen w-full flex bg-background dark:bg-dark-background overflow-hidden">
      {/* Left Column: Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 relative items-center justify-center p-12 text-white">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_70%)]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
            <MotionDiv
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white p-3 rounded-2xl">
                        <ShoppingCartIcon className="h-8 w-8 text-zinc-900" />
                    </div>
                    <span className="text-3xl font-bold tracking-tight">ShopLedger</span>
                </div>
                <h1 className="text-5xl font-extrabold leading-tight mb-4">
                    The Smart Way to Manage Your <span className="text-zinc-400">Retail Business.</span>
                </h1>
                <p className="text-zinc-400 text-lg leading-relaxed">
                    Designed for modern shop owners. Record sales, manage inventory, and grow your profit with AI-driven analytics.
                </p>
            </MotionDiv>

            <div className="space-y-4">
                {features.map((f, i) => (
                    <MotionDiv 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1) }}
                        className="flex items-center gap-3 text-zinc-300 font-medium"
                    >
                        <CheckCircleIcon className="h-5 w-5 text-primary bg-white rounded-full" />
                        {f}
                    </MotionDiv>
                ))}
            </div>

            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="pt-12"
            >
                <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 backdrop-blur-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-xs">AI</div>
                    <p className="text-sm text-zinc-400">"ShopLedger helped me increase my monthly profit by 24% using its trend analysis features."</p>
                </div>
            </MotionDiv>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex flex-col items-center mb-8">
             <div className="bg-zinc-900 dark:bg-zinc-100 p-4 rounded-3xl mb-4 shadow-xl">
                 <ShoppingCartIcon className="h-10 w-10 text-white dark:text-zinc-900" />
             </div>
             <h2 className="text-3xl font-bold tracking-tight">ShopLedger</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-on-surface dark:text-white">
                {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-subtle-text dark:text-zinc-400 mt-2">
                {isLogin ? 'Enter your credentials to access your dashboard' : 'Start managing your shop smarter today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-subtle-text ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-primary dark:focus:ring-white transition-all text-on-surface dark:text-white placeholder:text-zinc-400"
                placeholder="you@business.com"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold uppercase tracking-wider text-subtle-text">Password</label>
                {isLogin && <button type="button" className="text-xs font-bold text-primary dark:text-white hover:underline">Forgot password?</button>}
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-primary dark:focus:ring-white transition-all text-on-surface dark:text-white placeholder:text-zinc-400"
                placeholder="••••••••"
              />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-zinc-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
                {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                    <>
                        {isLogin ? 'Sign In' : 'Join ShopLedger'}
                        <ArrowUpRightIcon className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                )}
            </button>
          </form>

          <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div></div>
              <div className="relative flex justify-center text-sm uppercase"><span className="px-4 bg-background dark:bg-dark-background text-subtle-text font-medium">Or</span></div>
          </div>

          <div className="text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-on-surface dark:text-white font-semibold hover:underline"
            >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          <p className="text-[10px] text-center text-subtle-text px-8 leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and backed up securely.
          </p>
        </MotionDiv>
      </div>
    </div>
  );
};

export default AuthPage;
