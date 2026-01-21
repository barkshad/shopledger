
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShoppingCartIcon, CheckCircleIcon } from './icons';

const MotionDiv = motion.div as any;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (user && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      addToast('Please enter both your email and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(trimmedEmail, trimmedPassword);
        addToast('Signed in successfully.', 'success');
      } else {
        await register(trimmedEmail, trimmedPassword);
        addToast('Account created successfully.', 'success');
      }
      navigate('/');
    } catch (error: any) {
      console.error("[AuthError]", error);
      const code = error.code;
      let msg = 'Authentication failed. Please try again.';
      
      if (code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      else if (code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (code === 'auth/wrong-password') msg = 'Incorrect password.';
      else if (code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      else if (code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const appFeatures = [
    "Record sales and transactions instantly",
    "Track business expenses and outflows",
    "Manage products and inventory stock",
    "Secure cloud backup and sync"
  ];

  return (
    <div className="min-h-screen w-full flex bg-background dark:bg-dark-background overflow-hidden font-sans">
      {/* Branding Panel (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-50 dark:bg-zinc-900 border-r border-border-color dark:border-dark-border-color items-center justify-center p-24">
        <div className="max-w-md space-y-12">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-black dark:bg-white p-2 rounded-xl shadow-soft">
                <ShoppingCartIcon className="h-6 w-6 text-white dark:text-black" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight uppercase">ShopLedger</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-[1.1] mb-6 text-on-surface dark:text-white tracking-tight">
              Manage your shop with confidence.
            </h1>
            <p className="text-subtle-text dark:text-dark-subtle-text text-lg leading-relaxed">
              ShopLedger provides simple, powerful tools to track your sales, expenses, and growth in real-time.
            </p>
          </MotionDiv>

          <div className="space-y-5">
            {appFeatures.map((feature, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400"
              >
                <CheckCircleIcon className="h-5 w-5 text-black dark:text-white flex-shrink-0" />
                <span className="text-base font-medium">{feature}</span>
              </MotionDiv>
            ))}
          </div>

          <div className="pt-10 border-t border-border-color dark:border-dark-border-color">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Trusted by small businesses</p>
            <p className="text-xs text-zinc-500 mt-2">All data is encrypted and backed up daily.</p>
          </div>
        </div>
      </div>

      {/* Auth Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20">
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-10"
        >
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="bg-black dark:bg-white p-2 rounded-lg">
              <ShoppingCartIcon className="h-5 w-5 text-white dark:text-black" />
            </div>
            <h2 className="text-lg font-bold tracking-tight uppercase">ShopLedger</h2>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-base text-subtle-text dark:text-dark-subtle-text">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Join ShopLedger and start managing your business.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block ml-1">Email Address</label>
              <input 
                type="email" 
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-border-color dark:border-dark-border-color rounded-xl focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm outline-none placeholder:text-zinc-400 shadow-sm"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
                {isLogin && <button type="button" className="text-xs font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-colors">Forgot?</button>}
              </div>
              <input 
                type="password" 
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-border-color dark:border-dark-border-color rounded-xl focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm outline-none placeholder:text-zinc-400 shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-sm shadow-premium active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <span>{isLogin ? 'Login to Dashboard' : 'Create My Account'}</span>
              )}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-border-color dark:border-dark-border-color">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          <div className="text-[10px] text-center text-zinc-400 space-y-2 leading-relaxed">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
            <p>© {new Date().getFullYear()} ShopLedger. All rights reserved.</p>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default AuthPage;
