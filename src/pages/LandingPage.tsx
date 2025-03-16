import React, { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Github, Twitter, Wifi, Activity, Sparkles, BarChart2, Cpu } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import { useState } from 'react';

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-beige-100 text-coffee-900 overflow-hidden" ref={containerRef}>
      {/* Background elements with enhanced animations */}
      <div className="fixed inset-0 bg-noise-pattern opacity-30 pointer-events-none z-0"></div>
      <motion.div 
        className="fixed top-40 left-1/4 w-64 h-64 bg-sand-300 rounded-full filter blur-[120px] opacity-30 pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      ></motion.div>
      <motion.div 
        className="fixed top-80 right-1/4 w-80 h-80 bg-coffee-300 rounded-full filter blur-[150px] opacity-20 pointer-events-none"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      ></motion.div>

      {/* Header with ThinkV branding */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-coffee-600 to-sand-500 rounded-lg blur-sm opacity-70"
                animate={{ 
                  opacity: [0.5, 0.7, 0.5],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.h1 
                className="relative text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-coffee-900 to-sand-600 bg-clip-text text-transparent px-4 py-1 border border-coffee-200 rounded-lg shadow-sm backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Think<span className="text-coffee-600">V</span>
                <motion.span 
                  className="absolute -top-1 -right-1 text-xs" 
                  animate={{ 
                    opacity: [0, 1, 0],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 4
                  }}
                >
                  <Sparkles size={14} className="text-sand-500" />
                </motion.span>
              </motion.h1>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="hidden md:flex items-center space-x-8">
              <motion.a 
                href="#features" 
                className="text-coffee-800 hover:text-coffee-900 transition-colors relative group"
                whileHover={{ scale: 1.05 }}
              >
                Features
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-sand-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                ></motion.span>
              </motion.a>
              <motion.a 
                href="#docs" 
                className="text-coffee-800 hover:text-coffee-900 transition-colors relative group"
                whileHover={{ scale: 1.05 }}
              >
                Docs
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-sand-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                ></motion.span>
              </motion.a>
              <motion.a 
                href="#blog" 
                className="text-coffee-800 hover:text-coffee-900 transition-colors relative group"
                whileHover={{ scale: 1.05 }}
              >
                Blog
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-sand-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                ></motion.span>
              </motion.a>
            </nav>
            <div className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  id="login-section"
                  className="text-coffee-800 hover:text-coffee-900 transition-colors px-4 py-2"
                >
                  Log in
                </button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(101, 78, 60, 0.1), 0 4px 6px -2px rgba(101, 78, 60, 0.05)" }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <motion.span
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-coffee-600 to-sand-600 opacity-80 blur-sm"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                ></motion.span>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  id="signup-section"
                  className="relative bg-coffee-600 hover:bg-coffee-700 text-beige-50 px-4 py-2 rounded-lg transition-colors shadow-warm group-hover:shadow-warm-lg"
                >
                  Sign up free
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-32 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          style={{ opacity: heroOpacity }}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 text-coffee-900 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="relative inline-block">
              Connect 
              <motion.span 
                className="absolute -bottom-1 left-0 w-full h-2 bg-sand-300 -z-10 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.9, duration: 0.6 }}
              ></motion.span>
            </span> your devices, <br />
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
            className="text-xl text-coffee-700 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Whatever you measure, whatever you track. Share it, analyze it, 
            get insights about it, all from your ThinkV dashboard.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-block"
          >
            <motion.span
              className="absolute -inset-2 rounded-xl bg-gradient-to-r from-coffee-400 to-sand-500 opacity-40 blur-md"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.span>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="relative group inline-flex items-center px-8 py-4 bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-beige-50 text-lg font-medium rounded-xl transition-all duration-300 shadow-warm hover:shadow-warm-lg"
            >
              <span>Get started for free</span>
              <motion.span 
                className="ml-2"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight />
              </motion.span>
            </button>
          </motion.div>
        </motion.div>

        {/* Enhanced Cards Layout */}
        <div className="relative max-w-6xl mx-auto px-4 pb-10">
          {/* Animated gradient overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-radial from-sand-300/30 to-transparent pointer-events-none"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
          
          {/* Cards in a responsive grid layout with enhanced animations */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            
            {/* Temperature Monitor Card - Enhanced */}
            <motion.div 
              className="h-[400px] rounded-2xl overflow-hidden shadow-xl relative group"
              initial={{ opacity: 0, scale: 0.8, rotateY: -5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: -5, 
                transition: { duration: 0.3 } 
              }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.1}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-coffee-600/40 to-coffee-800/40 blur-md z-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                  rotate: [0, 1, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.div 
                className="h-full bg-gradient-to-br from-coffee-800 to-coffee-950 p-5 flex flex-col relative z-10"
                initial={{ backgroundPosition: '0% 0%' }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              >
                <motion.div 
                  className="text-beige-50 font-bold text-xl mb-3 flex items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span 
                    className="mr-2 inline-block"
                    animate={{ 
                      rotate: [0, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    <BarChart2 size={22} className="text-sand-300" />
                  </motion.span>
                  Temperature Monitor
                </motion.div>
                <div className="mt-auto">
                  <motion.div 
                    className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-inner"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.3)"
                    }}
                  >
                    <BarChart2 className="text-beige-50 mb-2" />
                    <div className="text-sm text-beige-50/90">Last 24 hours</div>
                    <motion.div 
                      className="text-3xl font-bold bg-gradient-to-r from-beige-100 to-sand-300 bg-clip-text text-transparent"
                      animate={{ 
                        scale: [1, 1.03, 1],
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      23.4°C
                    </motion.div>
                    <div className="text-sm text-beige-50/90">Average</div>
                  </motion.div>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="flex space-x-2">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1], 
                        opacity: [0.7, 1, 0.7],
                        color: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)']
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2, 
                        repeatDelay: 0.5 
                      }}
                    >
                      <Wifi size={16} className="text-beige-50" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        rotate: [0, 15, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 4,
                        repeatDelay: 2
                      }}
                    >
                      <Activity size={16} className="text-beige-50/80" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Smart Home Dashboard Card - Enhanced */}
            <motion.div 
              className="h-[400px] rounded-2xl overflow-hidden shadow-xl md:transform md:-translate-y-6 relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ 
                scale: 1.05, 
                translateY: -10,
                transition: { duration: 0.3 } 
              }}
              drag="y"
              dragConstraints={{ top: -10, bottom: 10 }}
              dragElastic={0.1}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-sand-500/40 to-coffee-700/40 blur-md z-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                  rotate: [0, -1, 0]
                }}
                transition={{ 
                  duration: 7,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.div 
                className="h-full bg-gradient-to-br from-coffee-700 to-coffee-900 p-5 flex flex-col relative z-10"
                initial={{ backgroundPosition: '0% 0%' }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
              >
                <motion.div 
                  className="text-beige-50 font-bold text-xl mb-3 flex items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.span 
                    className="mr-2 inline-block"
                    animate={{ 
                      rotate: [0, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 4
                    }}
                  >
                    <Cpu size={22} className="text-sand-300" />
                  </motion.span>
                  Smart Home Dashboard
                </motion.div>
                <div className="grid grid-cols-2 gap-3 my-3">
                  <motion.div 
                    className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10"
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-xs text-beige-50/90">Temp</div>
                    <motion.div 
                      className="text-base font-bold text-beige-50"
                      animate={{ 
                        color: ['rgba(242, 232, 223, 0.9)', 'rgba(242, 232, 223, 1)', 'rgba(242, 232, 223, 0.9)']
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      22°C
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10"
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-xs text-beige-50/90">Humidity</div>
                    <motion.div 
                      className="text-base font-bold text-beige-50"
                      animate={{ 
                        color: ['rgba(242, 232, 223, 0.9)', 'rgba(242, 232, 223, 1)', 'rgba(242, 232, 223, 0.9)']
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                      45%
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10"
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-xs text-beige-50/90">Energy</div>
                    <motion.div 
                      className="text-base font-bold text-beige-50 flex items-center"
                      animate={{ 
                        color: ['rgba(242, 232, 223, 0.9)', 'rgba(242, 232, 223, 1)', 'rgba(242, 232, 223, 0.9)']
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      3.8kW
                      <motion.span 
                        className="ml-1" 
                        animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Zap size={12} className="text-sand-300" />
                      </motion.span>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col items-center border border-white/10"
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-xs text-beige-50/90">Air</div>
                    <motion.div 
                      className="text-base font-bold text-beige-50"
                      animate={{ 
                        color: ['rgba(242, 232, 223, 0.9)', 'rgba(242, 232, 223, 1)', 'rgba(242, 232, 223, 0.9)']
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    >
                      Good
                    </motion.div>
                  </motion.div>
                </div>
                <motion.div 
                  className="bg-white/10 backdrop-blur-md p-3 rounded-xl mt-2 border border-white/10 shadow-inner"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs text-beige-50/90">Energy Usage</div>
                    <div className="text-xs text-beige-50/70">Last 7 days</div>
                  </div>
                  <div className="h-16 flex items-end space-x-1">
                    {[40, 65, 45, 70, 85, 60, 55].map((value, i) => (
                      <motion.div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-sand-500/50 to-sand-300/70 rounded-t"
                        style={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ 
                          duration: 1, 
                          delay: 1 + (i * 0.1),
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          scale: 1.1,
                          y: -2
                        }}
                      ></motion.div>
                    ))}
                  </div>
                </motion.div>
                <div className="mt-auto pt-2 flex justify-between">
                  <div className="text-xs text-beige-50/90">Connected</div>
                  <div className="flex space-x-2">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.3, 1], 
                        opacity: [0.7, 1, 0.7],
                        color: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)']
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3 
                      }}
                    >
                      <Wifi size={14} className="text-beige-50" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        rotate: [0, 20, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        repeatDelay: 1
                      }}
                    >
                      <Zap size={14} className="text-beige-50/90" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Solar Output Card - Enhanced */}
            <motion.div 
              className="h-[400px] rounded-2xl overflow-hidden shadow-xl relative group"
              initial={{ opacity: 0, scale: 0.8, rotateY: 5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5, 
                transition: { duration: 0.3 } 
              }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.1}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-sand-600/40 to-sand-800/40 blur-md z-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                  rotate: [0, 1, 0]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.div 
                className="h-full bg-gradient-to-br from-sand-700 to-coffee-800 p-5 flex flex-col relative z-10"
                initial={{ backgroundPosition: '0% 0%' }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
              >
                <motion.div 
                  className="text-beige-50 font-bold text-xl mb-3 flex items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.span 
                    className="mr-2 inline-block"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, repeatDelay: 1 }
                    }}
                  >
                    <Zap size={22} className="text-sand-300" />
                  </motion.span>
                  Solar Output
                </motion.div>
                <motion.div 
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl mt-2 border border-white/10 shadow-inner"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <motion.div 
                      className="text-lg font-semibold bg-gradient-to-r from-beige-100 to-sand-300 bg-clip-text text-transparent"
                      animate={{ 
                        scale: [1, 1.03, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      4.8 kWh
                    </motion.div>
                    <div className="text-xs text-beige-50/90 px-2 py-1 bg-white/10 rounded-full">Today</div>
                  </div>
                  <div className="mt-3 h-28 flex items-end space-x-0.5">
                    {[10, 25, 45, 75, 95, 85, 65, 30, 15, 5].map((value, i) => (
                      <motion.div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-sand-500/60 to-sand-300/80 rounded-t relative group"
                        style={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ 
                          duration: 1.2, 
                          delay: 1.2 + (i * 0.08),
                          type: "spring",
                          stiffness: 50
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.5)',
                          scale: 1.1
                        }}
                      >
                        {/* Peak value indicator */}
                        {value === 95 && (
                          <motion.div 
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-coffee-600 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: [0, 1, 0], y: [10, 0, -5] }}
                            transition={{ 
                              duration: 2, 
                              delay: 2.5,
                              repeat: Infinity,
                              repeatDelay: 8
                            }}
                          >
                            1.2kW
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-beige-50/90">
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                  </div>
                </motion.div>
                <div className="mt-auto">
                  <motion.div 
                    className="text-xs text-beige-50/90 mt-2 flex items-center"
                    animate={{ 
                      x: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <motion.span
                      animate={{ 
                        rotate: [0, 15, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 5
                      }}
                      className="mr-1"
                    >
                      <Sparkles size={12} className="text-sand-300" />
                    </motion.span>
                    Peak: 1.2kW at 12:45pm
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-beige-100 border-t border-beige-200 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center space-x-2 mb-4 md:mb-0"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-coffee-600 to-sand-500 rounded-lg blur-sm opacity-70"
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                ></motion.div>
                <div className="relative px-3 py-1 bg-beige-50/80 backdrop-blur-sm rounded-md border border-beige-200 shadow-sm">
                  <span className="text-lg font-bold bg-gradient-to-r from-coffee-900 to-sand-600 bg-clip-text text-transparent">Think<span className="text-coffee-600">V</span></span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-8 mb-4 md:mb-0"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <motion.a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
                whileHover={{ x: 2 }}
              >
                About
              </motion.a>
              <motion.a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
                whileHover={{ x: 2 }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
                whileHover={{ x: 2 }}
              >
                Documentation
              </motion.a>
              <motion.a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors"
                whileHover={{ x: 2 }}
              >
                Contact
              </motion.a>
            </motion.div>
            
            <motion.div 
              className="flex space-x-4"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors p-2 rounded-full hover:bg-beige-200"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-coffee-600 hover:text-coffee-800 transition-colors p-2 rounded-full hover:bg-beige-200"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Github size={20} />
              </motion.a>
            </motion.div>
          </div>
          <motion.div 
            className="mt-8 pt-8 border-t border-beige-200 text-center text-coffee-500 text-sm"
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