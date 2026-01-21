
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShoppingCartIcon, CheckCircleIcon, GoogleIcon } from './icons';

const MotionDiv = motion.div as any;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  
  const { login, register, loginWithGoogle, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (user && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Valid email and password are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Session established.', 'success');
      } else {
        await register(email, password);
        addToast('Account provisioned successfully.', 'success');
      }
      navigate('/');
    } catch (error: any) {
      console.error(error);
      const msg = error.code === 'auth/user-not-found' 
        ? 'Account not identified.' 
        : error.code === 'auth/wrong-password' 
        ? 'Invalid credentials.' 
        : 'System authentication error.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
        await loginWithGoogle();
        addToast('Authenticated via Google.', 'success');
        navigate('/');
    } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
            addToast('Third-party authentication failed.', 'error');
        }
    } finally {
        setIsGoogleSubmitting(false);
    }
  };

  const productAttributes = [
    "Atomic sales recording with local-first sync",
    "Cloud-based secure financial reconciliation",
    "Automated inventory health assessment",
    "Professional reporting for stakeholders"
  ];

  return (
    <div className="min-h-screen w-full flex bg-background dark:bg-dark-background overflow-hidden font-sans">
      {/* Visual Context Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-50 dark:bg-zinc-900 border-r border-border-color dark:border-dark-border-color items-center justify-center p-24">
        <div className="max-w-md space-y-12">
            <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-black dark:bg-white p-2.5 rounded-xl">
                        <ShoppingCartIcon className="h-6 w-6 text-white dark:text-black" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold tracking-tight uppercase">ShopLedger</span>
                </div>
                <h1 className="text-4xl font-semibold leading-tight mb-6 text-on-surface dark:text-white">
                    Deliberate tools for retail operations.
                </h1>
                <p className="text-subtle-text dark:text-dark-subtle-text text-lg leading-relaxed">
                    A unified platform for tracking performance, managing stock, and securing your business data.
                </p>
            </MotionDiv>

            <div className="space-y-6">
                {productAttributes.map((attr, i) => (
                    <MotionDiv 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex items-start gap-4 text-zinc-600 dark:text-zinc-400"
                    >
                        <CheckCircleIcon className="h-5 w-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium">{attr}</span>
                    </MotionDiv>
                ))}
            </div>

            <div className="pt-8 border-t border-border-color dark:border-dark-border-color">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Enterprise Ready</p>
                <p className="text-xs text-zinc-500 mt-2">End-to-end encryption for all transaction data.</p>
            </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16">
        <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-sm space-y-10"
        >
          <div className="lg:hidden flex items-center gap-3 mb-12">
             <div className="bg-black dark:bg-white p-2 rounded-lg">
                 <ShoppingCartIcon className="h-5 w-5 text-white dark:text-black" />
             </div>
             <h2 className="text-lg font-bold tracking-tight uppercase">ShopLedger</h2>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-on-surface dark:text-white tracking-tight">
                {isLogin ? 'Sign in to your account' : 'Provision a new account'}
            </h2>
            <p className="text-sm text-subtle-text dark:text-dark-subtle-text">
                {isLogin ? 'Provide your credentials to access the ledger.' : 'Enter details to initialize your business environment.'}
            </p>
          </div>

          <div className="space-y-6">
            <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-soft disabled:opacity-50"
            >
                {isGoogleSubmitting ? (
                    <div className="h-4 w-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                    <>
                        <GoogleIcon className="h-5 w-5" />
                        <span>Continue with Google</span>
                    </>
                )}
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-color dark:border-dark-border-color"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="px-4 bg-background dark:bg-dark-background text-zinc-400">Or use email</span></div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-border-color dark:border-dark-border-color rounded-xl focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm outline-none"
                        placeholder="name@company.com"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password</label>
                        {isLogin && <button type="button" className="text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">Reset password</button>}
                    </div>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-border-color dark:border-dark-border-color rounded-xl focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm outline-none"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-bold text-sm shadow-premium active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                    ) : (
                        <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                    )}
                </button>
            </form>
          </div>

          <div className="text-center pt-4">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest"
            >
                {isLogin ? "No account? Provision one here" : "Return to account sign-in"}
            </button>
          </div>
          
          <div className="text-[10px] text-center text-zinc-400 space-y-1 leading-relaxed">
            <p>Protected by platform security standards.</p>
            <p>© {new Date().getFullYear()} ShopLedger Retail Systems.</p>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default AuthPage;
