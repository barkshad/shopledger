
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  // Route protection
  if (user && !authLoading) {
    return <Navigate to="/" replace />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('Identifier and credential required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Authorization successful.', 'success');
      } else {
        await register(email, password);
        addToast('Environment provisioned.', 'success');
      }
      navigate('/');
    } catch (error: any) {
      console.error("[AuthError]", error);
      const code = error.code;
      let msg = 'Authentication failure.';
      if (code === 'auth/invalid-credential') msg = 'Invalid identifiers provided.';
      else if (code === 'auth/user-not-found') msg = 'Account not recognized.';
      else if (code === 'auth/wrong-password') msg = 'Incorrect credential.';
      else if (code === 'auth/email-already-in-use') msg = 'Identifier already provisioned.';
      
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      addToast('Identity verified via Google.', 'success');
      navigate('/');
    } catch (error: any) {
      console.error("[GoogleAuthError]", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        addToast('External identity provider failed.', 'error');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const systemsSummary = [
    "Atomic transaction logging",
    "Encrypted financial persistence",
    "Real-time inventory synchronization",
    "Automated performance reporting"
  ];

  return (
    <div className="min-h-screen w-full flex bg-background dark:bg-dark-background overflow-hidden font-sans">
      {/* Informational Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-50 dark:bg-zinc-900 border-r border-border-color dark:border-dark-border-color items-center justify-center p-24">
        <div className="max-w-md space-y-16">
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-black dark:bg-white p-2.5 rounded-xl">
                <ShoppingCartIcon className="h-6 w-6 text-white dark:text-black" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight uppercase">ShopLedger</span>
            </div>
            
            <h1 className="text-5xl font-semibold leading-[1.1] mb-8 text-on-surface dark:text-white tracking-tight">
              A deliberate platform for business operations.
            </h1>
            <p className="text-subtle-text dark:text-dark-subtle-text text-lg leading-relaxed">
              Consolidate sales, stock management, and financial reporting into a single, high-performance environment.
            </p>
          </MotionDiv>

          <div className="space-y-6">
            {systemsSummary.map((item, i) => (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex items-start gap-4 text-zinc-600 dark:text-zinc-400"
              >
                <CheckCircleIcon className="h-5 w-5 text-black dark:text-white mt-1 flex-shrink-0" />
                <span className="text-base font-medium">{item}</span>
              </MotionDiv>
            ))}
          </div>

          <div className="pt-12 border-t border-border-color dark:border-dark-border-color">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Deployment Tier: Enterprise</p>
            <p className="text-[11px] text-zinc-500 mt-2">Data localized and synced with 256-bit encryption standards.</p>
          </div>
        </div>
      </div>

      {/* Transactional Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20">
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-12"
        >
          <div className="lg:hidden flex items-center gap-3 mb-16">
            <div className="bg-black dark:bg-white p-2 rounded-lg">
              <ShoppingCartIcon className="h-5 w-5 text-white dark:text-black" />
            </div>
            <h2 className="text-lg font-bold tracking-tight uppercase">ShopLedger</h2>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight">
              {isLogin ? 'Access Account' : 'Provision Account'}
            </h2>
            <p className="text-base text-subtle-text dark:text-dark-subtle-text">
              {isLogin ? 'Enter valid credentials to continue.' : 'Initialize your business workspace.'}
            </p>
          </div>

          <div className="space-y-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white dark:bg-zinc-800 border border-border-color dark:border-dark-border-color rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-soft disabled:opacity-50"
            >
              {isGoogleSubmitting ? (
                <div className="h-4 w-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  <span>Continue with Google Identity</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-color dark:border-dark-border-color"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
                <span className="px-6 bg-background dark:bg-dark-background text-zinc-400">Standard Protocols</span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block ml-1">Account Identifier</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white dark:bg-zinc-900 border border-border-color dark:border-dark-border-color rounded-xl focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm outline-none placeholder:text-zinc-400"
                  placeholder="name@organization.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Security Credential</label>
                  {isLogin && <button type="button" className="text-[10px] font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">Reset</button>}
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white dark:bg-zinc-900 border border-border-color dark:border-dark-border-color rounded-xl focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm outline-none placeholder:text-zinc-400"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-sm shadow-premium active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : (
                  <span>{isLogin ? 'Establish Session' : 'Provision Account'}</span>
                )}
              </button>
            </form>
          </div>

          <div className="text-center pt-8 border-t border-border-color dark:border-dark-border-color">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-[0.1em]"
            >
              {isLogin ? "Requirement: New account access" : "Requirement: Existing account access"}
            </button>
          </div>
          
          <div className="text-[10px] text-center text-zinc-400 space-y-2 leading-relaxed">
            <p>Authorized access only. Verified by ShopLedger Systems Protocol.</p>
            <p>© {new Date().getFullYear()} ShopLedger Platform.</p>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default AuthPage;
