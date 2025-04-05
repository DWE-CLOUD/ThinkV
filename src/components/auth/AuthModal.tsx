import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [persistSession, setPersistSession] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (view === 'login') {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            // Set session persistence based on user preference
            // Default to true for better UX
            persistSession: persistSession
          }
        });

        if (error) throw error;
        
        // Save session to localStorage for persistence
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        
        // Redirect to dashboard after successful login
        navigate('/dashboard');

      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              // Add default user metadata
              full_name: email.split('@')[0]
            }
          }
        });

        if (error) throw error;
        
        setSuccessMessage('Success! Check your email to confirm your account.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setSuccessMessage('Check your email for the password reset link');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20, 
      transition: { 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />
          
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <motion.div
              className="bg-beige-50 rounded-xl shadow-warm-lg w-full max-w-md relative z-10 border border-beige-200 overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-beige-200 flex justify-between items-center">
                <motion.h2 variants={itemVariants} className="text-xl font-semibold text-coffee-800">
                  {view === 'login' ? 'Welcome back' : 'Create your account'}
                </motion.h2>
                <motion.button
                  variants={itemVariants}
                  className="text-coffee-500 hover:text-coffee-700 focus:outline-none p-1 rounded-full hover:bg-beige-200"
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              
              {/* Body */}
              <div className="p-6">
                {/* Toggle between login and signup */}
                <motion.div variants={itemVariants} className="flex mb-6 bg-beige-200 p-1 rounded-lg">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      view === 'login' ? 'bg-coffee-600 text-beige-50' : 'text-coffee-600'
                    }`}
                    onClick={() => setView('login')}
                  >
                    Sign In
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      view === 'signup' ? 'bg-coffee-600 text-beige-50' : 'text-coffee-600'
                    }`}
                    onClick={() => setView('signup')}
                  >
                    Sign Up
                  </button>
                </motion.div>

                {/* Error message if auth fails */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-start"
                    >
                      <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">{error}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success message */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start"
                    >
                      <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">{successMessage}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Login Form */}
                <motion.form variants={itemVariants} className="space-y-4" onSubmit={handleAuth}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-coffee-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="block text-sm font-medium text-coffee-700">
                        Password
                      </label>
                      {view === 'login' && (
                        <button 
                          type="button"
                          className="text-sm text-coffee-600 hover:text-coffee-800"
                          onClick={handleReset}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-beige-100 border border-beige-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  {/* Session persistence option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="persistSession"
                      checked={persistSession}
                      onChange={(e) => setPersistSession(e.target.checked)}
                      className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 border-beige-300 rounded"
                    />
                    <label htmlFor="persistSession" className="ml-2 block text-sm text-coffee-700">
                      {view === 'login' ? 'Stay signed in' : 'Keep me signed in'}
                    </label>
                  </div>
                  
                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    className="w-full py-3 px-4 bg-coffee-600 text-beige-50 rounded-lg font-medium hover:bg-coffee-700 transition-colors relative overflow-hidden group flex items-center justify-center"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        <span>{view === 'login' ? 'Sign in with Email' : 'Create Account'}</span>
                      </>
                    )}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    />
                  </motion.button>
                </motion.form>
                
                {/* Terms Notice */}
                <motion.p variants={itemVariants} className="mt-4 text-xs text-coffee-500 text-center">
                  By continuing, you agree to ThinkV's 
                  <a href="#" className="text-coffee-700 hover:text-coffee-900"> Terms of Service</a> and 
                  <a href="#" className="text-coffee-700 hover:text-coffee-900"> Privacy Policy</a>.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;