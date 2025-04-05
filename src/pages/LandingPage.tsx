import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Github, Twitter, Wifi, Activity, Sparkles, BarChart2, Cpu } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';

const LandingPage: React.FC = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.7]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-beige-100 text-coffee-900 overflow-hidden" ref={containerRef}>
      {/* Simplified background elements */}
      <div className="fixed inset-0 bg-noise-pattern opacity-20 pointer-events-none z-0"></div>
      <div className="fixed top-40 left-1/4 w-64 h-64 bg-sand-300 rounded-full filter blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="fixed top-80 right-1/4 w-80 h-80 bg-coffee-300 rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>

      {/* Header with ThinkV branding */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-coffee-600 to-sand-500 rounded-lg blur-sm opacity-50"></div>
              <h1 className="relative text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-coffee-900 to-sand-600 bg-clip-text text-transparent px-4 py-1 border border-coffee-200 rounded-lg shadow-sm backdrop-blur-sm">
                Think<span className="text-coffee-600">V</span>
              </h1>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3 sm:space-x-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <nav className="hidden md:flex items-center space-x-4 sm:space-x-8">
              <a href="#features" className="text-coffee-800 hover:text-coffee-900 transition-colors">
                Features
              </a>
              <a href="#docs" className="text-coffee-800 hover:text-coffee-900 transition-colors">
                Docs
              </a>
              <a href="#blog" className="text-coffee-800 hover:text-coffee-900 transition-colors">
                Blog
              </a>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={() => setIsAuthModalOpen(true)} 
                id="login-section"
                className="text-coffee-800 hover:text-coffee-900 transition-colors px-3 sm:px-4 py-2 text-sm"
              >
                Log in
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                id="signup-section"
                className="bg-coffee-600 hover:bg-coffee-700 text-beige-50 px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-warm text-sm"
              >
                Sign up free
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-8 md:pt-16 pb-16 md:pb-32 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          style={{ opacity: heroOpacity }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 text-coffee-900 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="relative inline-block">
              Connect 
              <motion.span 
                className="absolute -bottom-1 left-0 w-full h-2 bg-sand-300 -z-10 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.9, duration: 0.6 }}
              ></motion.span>
            </span> your devices, <br className="hidden sm:block" />
            <span className="relative inline-block">
              visualize
              <motion.span 
                className="absolute -bottom-1 left-0 w-full h-2 bg-sand-300 -z-10 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.1, duration: 0.6 }}
              ></motion.span>
            </span> your world
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-coffee-700 mb-8 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Whatever you measure, whatever you track. Share it, analyze it, 
            get insights about it, all from your ThinkV dashboard.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative inline-block"
          >
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-coffee-400 to-sand-500 opacity-30 blur-md"></div>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="relative group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-beige-50 text-base sm:text-lg font-medium rounded-xl transition-colors duration-300 shadow-warm hover:shadow-warm-lg"
            >
              <span>Get started for free</span>
              <span className="ml-2">
                <ArrowRight />
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Cards Layout */}
        <div className="relative max-w-6xl mx-auto px-4 pb-10">
          {/* Cards in a responsive grid layout with simplified animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6">
            
            {/* Temperature Monitor Card */}
            <motion.div 
              className="h-[350px] sm:h-[400px] rounded-2xl overflow-hidden shadow-xl relative group"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-coffee-600/40 to-coffee-800/40 blur-md z-0"></div>
              <div className="h-full bg-gradient-to-br from-coffee-800 to-coffee-950 p-5 flex flex-col relative z-10">
                <div className="text-beige-50 font-bold text-xl mb-3 flex items-center">
                  <span className="mr-2 inline-block">
                    <BarChart2 size={22} className="text-sand-300" />
                  </span>
                  Temperature Monitor
                </div>
                <div className="mt-auto">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-inner">
                    <BarChart2 className="text-beige-50 mb-2" />
                    <div className="text-sm text-beige-50/90">Last 24 hours</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-beige-100 to-sand-300 bg-clip-text text-transparent">
                      23.4°C
                    </div>
                    <div className="text-sm text-beige-50/90">Average</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="flex space-x-2">
                    <div>
                      <Wifi size={16} className="text-beige-50/70" />
                    </div>
                    <div>
                      <Activity size={16} className="text-beige-50/70" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Smart Home Dashboard Card */}
            <motion.div 
              className="h-[350px] sm:h-[400px] rounded-2xl overflow-hidden shadow-xl md:transform md:-translate-y-6 relative group"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sand-500/40 to-coffee-700/40 blur-md z-0"></div>
              <div className="h-full bg-gradient-to-br from-coffee-700 to-coffee-900 p-5 flex flex-col relative z-10">
                <div className="text-beige-50 font-bold text-xl mb-3 flex items-center">
                  <span className="mr-2 inline-block">
                    <Cpu size={22} className="text-sand-300" />
                  </span>
                  Smart Home Dashboard
                </div>
                <div className="grid grid-cols-2 gap-3 my-3">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10">
                    <div className="text-xs text-beige-50/90">Temp</div>
                    <div className="text-base font-bold text-beige-50">22°C</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10">
                    <div className="text-xs text-beige-50/90">Humidity</div>
                    <div className="text-base font-bold text-beige-50">45%</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10">
                    <div className="text-xs text-beige-50/90">Energy</div>
                    <div className="text-base font-bold text-beige-50 flex items-center">
                      3.8kW
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10">
                    <div className="text-xs text-beige-50/90">Air</div>
                    <div className="text-base font-bold text-beige-50">Good</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl mt-2 border border-white/10 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs text-beige-50/90">Energy Usage</div>
                    <div className="text-xs text-beige-50/70">Last 7 days</div>
                  </div>
                  <div className="h-16 flex items-end space-x-1">
                    {[40, 65, 45, 70, 85, 60, 55].map((value, i) => (
                      <motion.div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-sand-500/50 to-sand-300/70 rounded-t"
                        style={{ height: `${value}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.05) }}
                      ></motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-2 flex justify-between">
                  <div className="text-xs text-beige-50/90">Connected</div>
                  <div className="flex space-x-2">
                    <Wifi size={14} className="text-beige-50/70" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Solar Output Card */}
            <motion.div 
              className="h-[350px] sm:h-[400px] rounded-2xl overflow-hidden shadow-xl relative group"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sand-600/40 to-sand-800/40 blur-md z-0"></div>
              <div className="h-full bg-gradient-to-br from-sand-700 to-coffee-800 p-5 flex flex-col relative z-10">
                <div className="text-beige-50 font-bold text-xl mb-3 flex items-center">
                  <span className="mr-2 inline-block">
                    <Sparkles size={22} className="text-sand-300" />
                  </span>
                  Solar Output
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl mt-2 border border-white/10 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-lg font-semibold bg-gradient-to-r from-beige-100 to-sand-300 bg-clip-text text-transparent">
                      4.8 kWh
                    </div>
                    <div className="text-xs text-beige-50/90 px-2 py-1 bg-white/10 rounded-full">Today</div>
                  </div>
                  <div className="mt-3 h-28 flex items-end space-x-0.5">
                    {[10, 25, 45, 75, 95, 85, 65, 30, 15, 5].map((value, i) => (
                      <motion.div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-sand-500/60 to-sand-300/80 rounded-t"
                        style={{ height: 0 }}
                        initial={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.05) }}
                      ></motion.div>
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-beige-50/90">
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="text-xs text-beige-50/90 mt-2 flex items-center">
                    <span className="mr-1">
                      <Sparkles size={12} className="text-sand-300" />
                    </span>
                    Peak: 1.2kW at 12:45pm
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-beige-100 border-t border-beige-200 py-8 sm:py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center space-x-2 mb-4 md:mb-0"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="relative px-3 py-1 bg-beige-50/80 backdrop-blur-sm rounded-md border border-beige-200 shadow-sm">
                  <span className="text-lg font-bold bg-gradient-to-r from-coffee-900 to-sand-600 bg-clip-text text-transparent">Think<span className="text-coffee-600">V</span></span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4 md:mb-0"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
              >
                About
              </a>
              <a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
              >
                Features
              </a>
              <a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
              >
                Documentation
              </a>
              <a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
              >
                Contact
              </a>
            </motion.div>
            
            <motion.div 
              className="flex space-x-4"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors p-2 rounded-full hover:bg-beige-200"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors p-2 rounded-full hover:bg-beige-200"
              >
                <Github size={20} />
              </a>
            </motion.div>
          </div>
          <motion.div 
            className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-beige-200 text-center text-coffee-500 text-sm"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            &copy; {new Date().getFullYear()} ThinkV. All rights reserved.
          </motion.div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;