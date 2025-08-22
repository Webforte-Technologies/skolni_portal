import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import SEOHead from '../components/seo/SEOHead';
import LeadCaptureForm from '../components/landing/LeadCaptureForm';
import { useResponsive } from '../hooks/useViewport';
import { 
  Brain, 
  Calculator, 
  Users, 
  BookOpen, 
  Shield, 
  Star, 
  Check, 
  ArrowRight,
  Play,
  Zap,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Sparkles,
  Rocket,
  Target,
  Lightbulb,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  CheckCircle2,
  Headphones
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  // State kept for future selection UX; unused at build to avoid errors
  // const [selectedPlan, setSelectedPlan] = useState('basic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Responsive viewport detection
  const { isMobile, isTablet, touchDevice } = useResponsive();
  
  // Animation hooks
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  
  // Parallax effects
  // Parallax values reserved for future effects; avoid unused warnings
  // const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  // const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  // Intersection observers
  const isHeroInView = useInView(heroRef, { once: true });
  // const isFeaturesInView = useInView(featuresRef, { once: true });
  // const isTestimonialsInView = useInView(testimonialsRef, { once: true });
  // const isPricingInView = useInView(pricingRef, { once: true });
  
  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Auto-rotate testimonials (skip when reduced motion)
  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reduceMotion]);
  
  // Theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const features = [
    {
      icon: Brain,
      title: 'AI Matematický Asistent',
      description: 'Inteligentní pomocník pro řešení matematických problémů s podrobným vysvětlením kroků',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      delay: 0.1
    },
    {
      icon: Calculator,
      title: 'Generování Cvičení',
      description: 'Automatické vytváření cvičení a testů podle obtížnosti a tématu',
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      delay: 0.2
    },
    {
      icon: Users,
      title: 'Spolupráce Učitelů',
      description: 'Sdílení materiálů a zkušeností mezi učiteli napříč školami',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      delay: 0.3
    },
    {
      icon: BookOpen,
      title: 'Knihovna Materiálů',
      description: 'Rozsáhlá databáze vzdělávacích materiálů a šablon',
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      delay: 0.4
    },
    {
      icon: Shield,
      title: 'Bezpečnost & Soukromí',
      description: 'Ochrana dat studentů a dodržování GDPR standardů',
      color: 'text-red-600',
      gradient: 'from-red-500 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
      delay: 0.5
    },
    {
      icon: BarChart3,
      title: 'Analýza Pokroku',
      description: 'Sledování pokroku studentů a detailní reporty',
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-blue-500',
      bgGradient: 'from-indigo-50 to-blue-50',
      delay: 0.6
    }
  ];

  const testimonials = [
    {
      name: 'Mgr. Jana Nováková',
      role: 'Učitelka matematiky',
      school: 'Gymnázium Brno',
      content: 'EduAI-Asistent nám pomohl zlepšit výsledky studentů o 25%. AI vysvětlení jsou jasná a srozumitelná.',
      rating: 5,
      avatar: '👩‍🏫',
      improvement: '+25%',
      delay: 0.1
    },
    {
      name: 'Ing. Petr Svoboda',
      role: 'Ředitel školy',
      school: 'ZŠ Praha 5',
      content: 'Implementace byla jednoduchá a rychlá. Učitelé jsou nadšení z možností spolupráce a sdílení materiálů.',
      rating: 5,
      avatar: '👨‍💼',
      improvement: '+40%',
      delay: 0.2
    },
    {
      name: 'Mgr. Eva Dvořáková',
      role: 'Učitelka fyziky',
      school: 'Gymnázium Ostrava',
      content: 'Generování cvičení ušetří hodiny příprav. Studenti si mohou procvičovat doma s okamžitou zpětnou vazbou.',
      rating: 5,
      avatar: '👩‍🔬',
      improvement: '+30%',
      delay: 0.3
    }
  ];

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Základní',
      price: '0',
      period: 'měsíc',
      description: 'Pro jednotlivé učitele a malé školy',
      features: [
        '5 AI konverzací denně',
        'Základní generování cvičení',
        'Přístup ke knihovně materiálů',
        'Emailová podpora',
        'Základní analýzy'
      ],
      cta: 'Začít zdarma',
      popular: false,
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100',
      delay: 0.1
    },
    {
      id: 'pro',
      name: 'Profesionální',
      price: '299',
      period: 'měsíc',
      description: 'Pro střední školy a větší týmy',
      features: [
        'Neomezené AI konverzace',
        'Pokročilé generování cvičení',
        'Spolupráce mezi učiteli',
        'Prioritní podpora',
        'Detailní analýzy a reporty',
        'Integrace s LMS systémy',
        'Vlastní šablony a materiály'
      ],
      cta: 'Začít zkušební verzi',
      popular: true,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      delay: 0.2
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Kontaktujte nás',
      period: '',
      description: 'Pro velké školy a vzdělávací instituce',
      features: [
        'Všechny funkce z Pro plánu',
        'Vlastní AI model',
        'API přístup',
        'Dedikovaný manažer',
        'Školení a implementace',
        'White-label řešení',
        'SLA garantie'
      ],
      cta: 'Kontaktovat',
      popular: false,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      delay: 0.3
    }
  ];

  // Statistics for social proof
  const stats = [
    { number: '100+', label: 'Škol', icon: GraduationCap, delay: 0.1 },
    { number: '5000+', label: 'Učitelů', icon: Users, delay: 0.2 },
    { number: '50K+', label: 'Studentů', icon: Target, delay: 0.3 },
    { number: '95%', label: 'Spokojenost', icon: Star, delay: 0.4 }
  ];

  return (
    <div className={`min-h-screen bg-surface-bg text-surface-text transition-colors duration-500 relative ${isDarkMode ? 'dark' : ''}`}>
      <SEOHead
        title="EduAI-Asistent - Moderní AI asistent pro matematické vzdělávání"
        description="EduAI-Asistent je moderní AI asistent pro matematické vzdělávání, který pomáhá učitelům vytvářet lepší výukové materiály a studentům lépe pochopit matematiku."
        keywords="AI asistent, matematika, vzdělávání, cvičení, učitelé, školy"
      />
      {/* Global Animated Background (applies to entire page) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Base surface already applied on wrapper. Floating blobs for depth */}
        <motion.div
          className="absolute -top-24 -left-16 w-72 h-72 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.05, 1] }}
          transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-10 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, 25, 0], x: [0, -15, 0], scale: [1, 0.95, 1] }}
          transition={reduceMotion ? undefined : { duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute -bottom-24 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/15 to-emerald-400/15 rounded-full blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, -15, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={reduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Modern Glassmorphism Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-surface-card/80 border-b border-surface-border/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`flex justify-between items-center ${isMobile ? 'h-16' : 'h-20'}`}>
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center`}>
                    <Brain className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
              </div>
                  <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                    {isMobile ? 'EduAI' : 'EduAI-Asistent'}
                  </h1>
            </div>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.a 
                href="#features" 
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                  <Lightbulb className="h-4 w-4" /> Funkce
              </motion.a>
              <motion.a 
                href="#pricing" 
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Award className="h-4 w-4" /> Ceny
              </motion.a>
              <motion.a 
                href="#testimonials" 
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                  <Star className="h-4 w-4" /> Reference
              </motion.a>
              
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {isDarkMode ? <Sparkles className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </motion.button>
              
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  Přihlásit se
                  </Button>
                </motion.div>
                </Link>
              
                <Link to="/register-school">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    Registrovat školu
                  </Button>
                </motion.div>
                </Link>
              </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
            </div>
              </motion.button>
          </div>
        </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-surface-card/95 backdrop-blur-xl border-t border-surface-border/60"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 text-base font-medium">Funkce</a>
                <a href="#pricing" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 text-base font-medium">Ceny</a>
                <a href="#testimonials" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 text-base font-medium">Reference</a>
                <Link to="/login" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 text-base font-medium">Přihlásit se</Link>
                <Link to="/register-school">
                  <Button variant="primary" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Registrovat školu
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Modern Hero Section with Glassmorphism */}
      <section ref={heroRef} className={`relative ${isMobile ? 'min-h-screen' : 'min-h-screen'} flex items-center justify-center overflow-hidden ${isMobile ? 'pt-16' : 'pt-20'}`}>
        {/* Main Content */}
        <div className={`relative z-10 max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'} text-center`}>
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className={`${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}
          >
            {/* Badge */}
            <motion.div
              className={`inline-flex items-center gap-2 ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border/60 shadow-lg ${isMobile ? 'mb-6' : 'mb-8'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Sparkles className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-500`} />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-600 dark:text-gray-300`}>
                {isMobile ? 'AI Education' : 'AI‑Powered Education'}
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className={`${
              isMobile 
                ? 'text-3xl' 
                : isTablet 
                  ? 'text-4xl md:text-5xl' 
                  : 'text-5xl md:text-7xl'
            } font-bold text-gray-900 dark:text-white ${isMobile ? 'mb-4' : 'mb-6'} leading-tight`}>
              {isMobile ? (
                <>
                  Revoluce ve{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent block">
                    matematickém vzdělávání
                  </span>
                </>
              ) : (
                <>
                  Revoluce ve{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    matematickém vzdělávání
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className={`${
              isMobile 
                ? 'text-base' 
                : isTablet 
                  ? 'text-lg md:text-xl' 
                  : 'text-xl md:text-2xl'
            } text-gray-600 dark:text-gray-300 ${isMobile ? 'mb-6' : 'mb-8'} ${
              isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-3xl'
            } mx-auto leading-relaxed`}>
              AI asistent, který pomáhá učitelům vytvářet lepší výukové materiály a studentům lépe pochopit matematiku
            </p>

            {/* CTA Buttons */}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} ${isMobile ? 'gap-3' : 'gap-4'} justify-center ${isMobile ? 'mb-8' : 'mb-12'}`}>
              <Link to="/register-school">
                <motion.div
                  whileHover={touchDevice ? {} : { scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button 
                    variant="primary" 
                    size={isMobile ? "md" : "lg"}
                    className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl ${
                      isMobile 
                        ? 'text-base px-6 py-3 w-full min-h-[44px]' 
                        : 'text-lg px-8 py-4'
                    }`}
                  >
                    <Rocket className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                    Začít zdarma
                    <ArrowRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                </Button>
                </motion.div>
              </Link>
              
              <motion.div
                whileHover={touchDevice ? {} : { scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button 
                  variant="outline" 
                  size={isMobile ? "md" : "lg"}
                  className={`flex items-center gap-2 border-2 border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isMobile 
                      ? 'text-base px-6 py-3 w-full min-h-[44px]' 
                      : 'text-lg px-8 py-4'
                  }`}
                >
                  <Play className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  Zobrazit demo
              </Button>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div 
              className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} items-center justify-center ${isMobile ? 'gap-3' : 'gap-8'} ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} /> 
                Bezplatná zkušební verze
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-400`} /> 
                Nastavení za 5 minut
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Headphones className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-purple-400`} /> 
                24/7 podpora
              </div>
            </motion.div>
          </motion.div>
            </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
          transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"
              animate={reduceMotion ? undefined : { y: [0, 12, 0] }}
              transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
              </section>

      {/* Statistics Section */}
      <section className={`${isMobile ? 'py-12' : 'py-20'} bg-surface-bg relative overflow-hidden`}>
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'}`}>
          <motion.div 
            className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} ${isMobile ? 'gap-6' : 'gap-8'}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: stat.delay }}
                viewport={{ once: true }}
                whileHover={touchDevice ? {} : { y: -5 }}
              >
                <div className="relative">
                  <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} ${isMobile ? 'rounded-xl' : 'rounded-2xl'} flex items-center justify-center mx-auto ${isMobile ? 'mb-3' : 'mb-4'} group-hover:scale-110 transition-transform duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] bg-gradient-to-br ${
                    stat.icon === GraduationCap
                      ? 'from-blue-600 to-cyan-600'
                      : stat.icon === Users
                      ? 'from-emerald-600 to-green-600'
                      : stat.icon === Target
                      ? 'from-purple-600 to-pink-600'
                      : 'from-orange-500 to-amber-500'
                  }`}>
                    <stat.icon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]`} strokeWidth={2} />
                  </div>
                  <motion.div
                    className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent ${isMobile ? 'mb-1' : 'mb-2'}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: stat.delay + 0.2, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <p className={`text-gray-600 dark:text-gray-400 font-medium ${isMobile ? 'text-sm' : ''}`}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Optional subtle pattern removed to prioritize global gradient background */}
      </section>

      {/* Modern Features Section with Glassmorphism */}
      <section ref={featuresRef} id="features" className={`${isMobile ? 'py-12' : 'py-20'} bg-surface-bg relative overflow-hidden`}>
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'}`}>
          {/* Section Header */}
          <motion.div 
            className={`text-center ${isMobile ? 'mb-12' : 'mb-20'}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className={`inline-flex items-center gap-2 ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border/60 shadow-lg ${isMobile ? 'mb-4' : 'mb-6'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Lightbulb className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-500`} />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
                {isMobile ? 'Funkce' : 'Inovativní funkce'}
              </span>
            </motion.div>
            
            <h2 className={`${
              isMobile 
                ? 'text-2xl' 
                : isTablet 
                  ? 'text-3xl md:text-4xl' 
                  : 'text-4xl md:text-5xl'
            } font-bold text-surface-text ${isMobile ? 'mb-4' : 'mb-6'}`}>
              {isMobile ? (
                <>
                  Proč si vybrat{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    EduAI-Asistent?
                  </span>
                </>
              ) : (
                <>
                  Proč si vybrat{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EduAI-Asistent?
                  </span>
                </>
              )}
            </h2>
            <p className={`${
              isMobile 
                ? 'text-base' 
                : isTablet 
                  ? 'text-lg' 
                  : 'text-xl'
            } text-gray-600 dark:text-gray-300 ${
              isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-3xl'
            } mx-auto leading-relaxed`}>
              Kombinujeme nejmodernější AI technologie s osvědčenými pedagogickými principy
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className={`grid ${
            isMobile 
              ? 'grid-cols-1' 
              : isTablet 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          } ${isMobile ? 'gap-6' : 'gap-8'}`}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={touchDevice ? {} : { y: -10 }}
              >
                {/* Glassmorphism Card */}
                <div className={`relative h-full bg-surface-card/80 backdrop-blur-xl ${isMobile ? 'rounded-xl' : 'rounded-2xl'} ${isMobile ? 'p-6' : 'p-8'} border border-surface-border/60 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:bg-surface-card/90`}>
                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 ${isMobile ? 'rounded-xl' : 'rounded-2xl'} bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-cyan-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100`} />
                  
                  {/* Icon Container */}
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center ${isMobile ? 'mb-4' : 'mb-6'} group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`${isMobile ? 'h-12 w-12' : 'h-14 w-14'} ${isMobile ? 'rounded-xl' : 'rounded-2xl'} bg-white/12 border border-white/15 shadow-inner flex items-center justify-center`}>
                        <div className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} ${isMobile ? 'rounded-lg' : 'rounded-xl'} bg-white flex items-center justify-center shadow`}>
                          <feature.icon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-neutral-900`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-surface-text ${isMobile ? 'mb-3' : 'mb-4'} group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300`}>
                      {feature.title}
                    </h3>
                    <p className={`text-gray-600 dark:text-gray-300 leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                      {feature.description}
                    </p>
              </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: feature.delay
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <Link to="/register-school">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl text-lg px-8 py-4"
                >
                  <Rocket className="h-6 w-6 mr-2" />
                  Vyzkoušet všechny funkce
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Pattern removed to keep global background consistent */}
      </section>

      {/* Newsletter removed by request */}

      {/* Interactive Demo Section */}
      <section className="py-20 bg-surface-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-text mb-4 flex items-center justify-center gap-3">
              <Zap className="h-6 w-6 text-blue-400" /> Vyzkoušejte si AI asistenta
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Podívejte se, jak snadno může AI pomoci s matematickými problémy
            </p>
          </div>
          <div className="bg-surface-card/80 border border-surface-border/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="rounded-xl p-6 mb-6 bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <span className="text-neutral-800 dark:text-gray-300 font-medium">Matematický Asistent</span>
              </div>
              <p className="text-neutral-700 dark:text-gray-200 leading-relaxed">
                &quot;Ahoj! Jsem tu, abych ti pomohl s matematikou. Můžeš mi poslat jakýkoliv matematický problém - 
                ať už jde o rovnici, geometrii, nebo cokoliv jiného. Vysvětlím ti to krok za krokem a můžu ti 
                i vytvořit podobné příklady na procvičení. Co bys chtěl řešit?&quot;
              </p>
            </div>
            <div className="text-center">
              <Button variant="primary" size="lg" className="flex items-center gap-2 mx-auto">
                <Zap className="h-5 w-5" />
                Spustit živou ukázku
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Testimonials Section with Interactive Carousel */}
      <section ref={testimonialsRef} id="testimonials" className={`${isMobile ? 'py-12' : 'py-20'} bg-surface-bg relative overflow-hidden`}>
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'}`}>
          {/* Section Header */}
          <motion.div 
            className={`text-center ${isMobile ? 'mb-12' : 'mb-20'}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className={`inline-flex items-center gap-2 ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border/60 shadow-lg ${isMobile ? 'mb-4' : 'mb-6'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Star className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-600 fill-current`} />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
                {isMobile ? 'Reference' : 'Spokojené školy'}
              </span>
            </motion.div>
            
            <h2 className={`${
              isMobile 
                ? 'text-2xl' 
                : isTablet 
                  ? 'text-3xl md:text-4xl' 
                  : 'text-4xl md:text-5xl'
            } font-bold text-surface-text ${isMobile ? 'mb-4' : 'mb-6'} ${isMobile ? 'flex-col' : 'flex'} items-center justify-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <Star className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-yellow-500`} /> 
              {isMobile ? (
                <>
                  Co říkají{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">učitelé</span>
                </>
              ) : (
                <>
                  Co říkají{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">učitelé</span>
                </>
              )}
            </h2>
            <p className={`${
              isMobile 
                ? 'text-base' 
                : isTablet 
                  ? 'text-lg' 
                  : 'text-xl'
            } text-gray-600 dark:text-gray-300 ${
              isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-3xl'
            } mx-auto leading-relaxed`}>
              Připojte se k více než 100+ školám, které už používají EduAI-Asistent
            </p>
          </motion.div>

          {/* Testimonials Carousel */}
          <div className="relative">
            {/* Main Testimonial Display */}
            <div className={`relative ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}>
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: isMobile ? 50 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isMobile ? -50 : -100 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Glassmorphism Testimonial Card */}
                <div className={`bg-surface-card/80 backdrop-blur-xl ${isMobile ? 'rounded-2xl' : 'rounded-3xl'} ${isMobile ? 'p-6' : isTablet ? 'p-8' : 'p-12'} border border-surface-border/60 shadow-2xl relative overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
          </div>

                  {/* Quote Icon */}
                  {!isMobile && (
                    <div className={`absolute ${isMobile ? 'top-4 right-4 text-4xl' : 'top-8 right-8 text-6xl'} text-blue-200 dark:text-blue-800 opacity-30`}>
                      &quot;
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Rating */}
                    <div className={`flex items-center justify-center gap-1 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                          <Star className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-yellow-400 fill-current`} />
                        </motion.div>
                  ))}
                </div>

                    {/* Testimonial Text */}
                    <blockquote className={`${
                      isMobile 
                        ? 'text-base' 
                        : isTablet 
                          ? 'text-lg md:text-xl' 
                          : 'text-xl md:text-2xl'
                    } text-gray-700 dark:text-gray-300 ${isMobile ? 'mb-6' : 'mb-8'} leading-relaxed italic`}>
                      &quot;{testimonials[activeTestimonial].content}&quot;
                    </blockquote>

                    {/* Author Info */}
                    <div className={`flex items-center justify-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                      <div className={`${isMobile ? 'text-2xl' : 'text-4xl'}`}>{testimonials[activeTestimonial].avatar}</div>
                      <div className="text-left">
                        <p className={`font-bold ${isMobile ? 'text-base' : 'text-lg'} text-gray-900 dark:text-white`}>
                          {testimonials[activeTestimonial].name}
                        </p>
                        <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm' : ''}`}>
                          {testimonials[activeTestimonial].role}
                        </p>
                        <p className={`text-gray-500 dark:text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {testimonials[activeTestimonial].school}
                        </p>
                </div>
              </div>

                    {/* Improvement Badge */}
                    <motion.div
                      className={`inline-flex items-center gap-2 ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full ${isMobile ? 'text-xs' : 'text-sm'} font-medium ${isMobile ? 'mt-4' : 'mt-6'}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <TrendingUp className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      {testimonials[activeTestimonial].improvement} zlepšení
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Arrows */}
              {!isMobile && (
                <>
                  <motion.button
                    onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border/60 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>

                  <motion.button
                    onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border/60 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>
                </>
              )}
            </div>

            {/* Carousel Indicators */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
            ))}
          </div>
        </div>
        </div>

        {/* Pattern removed to keep global background consistent */}
      </section>

      {/* Modern Pricing Section with Glassmorphism */}
      <section ref={pricingRef} id="pricing" className={`${isMobile ? 'py-12' : 'py-20'} bg-surface-bg relative overflow-hidden`}>
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'}`}>
          {/* Section Header */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border/60 shadow-lg mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Award className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transparentní ceny</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-surface-text mb-6 flex items-center justify-center gap-3">
              <Award className="h-8 w-8 text-purple-400" /> Jednoduché a{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">transparentní ceny</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Vyberte si plán, který nejlépe vyhovuje potřebám vaší školy
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className={`grid ${
            isMobile 
              ? 'grid-cols-1' 
              : isTablet 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 md:grid-cols-3'
          } ${isMobile ? 'gap-6' : 'gap-8'}`}>
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.id}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: plan.delay }}
                viewport={{ once: true }}
                whileHover={touchDevice ? {} : { y: -10 }}
              >
                {/* Glassmorphism Pricing Card */}
                <div className={`relative h-full bg-surface-card/80 backdrop-blur-xl ${isMobile ? 'rounded-2xl' : 'rounded-3xl'} ${isMobile ? 'p-6' : 'p-8'} border border-surface-border/60 shadow-xl hover:shadow-2xl transition-all duration-500 ${
                  plan.popular ? 'ring-2 ring-purple-500/50' : ''
                }`}>
                  {/* Popular Badge */}
                {plan.popular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                      viewport={{ once: true }}
                    >
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        ⭐ Nejoblíbenější
                    </span>
                    </motion.div>
                  )}

                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${plan.popular ? 'from-purple-500/20 via-pink-500/20 to-cyan-500/20' : 'from-transparent via-transparent to-transparent'} group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-cyan-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100`} />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {plan.name}
                      </h3>
                  <div className="mb-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                    {plan.period && (
                          <span className="text-gray-600 dark:text-gray-400 text-lg">/{plan.period}</span>
                    )}
                  </div>
                      <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>

                     {/* Features List */}
                     <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                        <motion.li 
                          key={index} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: plan.delay + index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </motion.li>
                  ))}
                </ul>

                     {/* CTA Button */}
                     <div className="text-center mt-auto pt-6">
                  <Link to={plan.id === 'enterprise' ? '/contact' : '/register-school'}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                    <Button 
                      variant={plan.popular ? 'primary' : 'outline'} 
                      size="lg" 
                            className={`w-full text-lg py-4 ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl' 
                                : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                      {plan.cta}
                    </Button>
                        </motion.div>
                  </Link>
                </div>
              </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: plan.delay
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Potřebujete vlastní řešení? Kontaktujte nás pro individuální nabídku.
            </p>
            <Link to="/contact">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-lg px-8 py-4"
                >
                  <MessageSquare className="h-6 w-6 mr-2" />
                  Kontaktovat prodejce
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Pattern removed to keep global background consistent */}
      </section>

      {/* Newsletter section removed by request */}

      {/* Modern Demo Request Section with Glassmorphism */}
      <section className="py-20 bg-surface-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border/60 shadow-lg mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Play className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Živá ukázka</span>
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Chcete vidět{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  EduAI-Asistent v akci?
                </span>
              </h2>
              
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                Domluvte si osobní demo prezentaci s našimi specialisty. Ukážeme vám, jak může AI transformovat výuku matematiky na vaší škole.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Osobní prezentace podle vašich potřeb',
                  'Ukázka všech funkcí na reálných příkladech',
                  'Odpovědi na vaše otázky',
                  'Bezplatné a bez závazků'
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
                    <span className="text-gray-800 dark:text-gray-300 text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Floating Stats */}
              <motion.div
                className="flex gap-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Odpověď</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bezplatné</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Závazků</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Form Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Floating Form Container */}
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-2xl transform rotate-3 scale-105 pointer-events-none" />
                 <div className="relative bg-surface-card/90 backdrop-blur-xl rounded-3xl p-8 border border-surface-border/60 shadow-2xl">
              <LeadCaptureForm
                type="demo"
                title="Požádat o demo"
                description="Vyplňte formulář a my vás budeme kontaktovat do 24 hodin"
              />
            </div>
          </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </section>

      {/* Modern Final CTA Section (harmonized with dark palette) */}
      <section className={`${isMobile ? 'py-12' : 'py-20'} bg-surface-bg relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/15 via-purple-500/10 to-transparent" />
        </div>

        {/* Floating Elements */}
        {!isMobile && (
          <>
            <motion.div
              className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"
              animate={{ 
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              animate={{ 
                y: [0, 30, 0],
                x: [0, -20, 0],
                scale: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 2
              }}
            />
          </>
        )}

        <div className={`relative z-10 max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'} text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={`${
              isMobile 
                ? 'text-3xl' 
                : isTablet 
                  ? 'text-4xl md:text-5xl' 
                  : 'text-4xl md:text-6xl'
            } font-bold text-gray-900 dark:text-white ${isMobile ? 'mb-4' : 'mb-6'} leading-tight`}>
              Připraveni{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                začít?
              </span>
          </h2>
            
            <p className={`${
              isMobile 
                ? 'text-base' 
                : isTablet 
                  ? 'text-lg md:text-xl' 
                  : 'text-xl md:text-2xl'
            } text-gray-700 dark:text-gray-300 ${isMobile ? 'mb-8' : 'mb-12'} ${
              isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-3xl'
            } mx-auto leading-relaxed`}>
            Připojte se k tisícům učitelů, kteří už transformují výuku matematiky s pomocí AI
          </p>
            
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} ${isMobile ? 'gap-4' : 'gap-6'} justify-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <Link to="/register-school">
                <motion.div
                  whileHover={touchDevice ? {} : { scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button 
                    variant="primary" 
                    size={isMobile ? "md" : "lg"}
                    className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl ${
                      isMobile 
                        ? 'text-base px-6 py-3 w-full min-h-[44px]' 
                        : 'text-lg px-8 py-4'
                    }`}
                  >
                    <Rocket className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                Registrovat školu zdarma
                <ArrowRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </Button>
                </motion.div>
            </Link>
              
              <motion.div
                whileHover={touchDevice ? {} : { scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button 
                  variant="outline" 
                  size={isMobile ? "md" : "lg"}
                  className={`flex items-center gap-2 border-2 border-surface-border/60 text-surface-text hover:bg-surface-card/20 backdrop-blur-sm ${
                    isMobile 
                      ? 'text-base px-6 py-3 w-full min-h-[44px]' 
                      : 'text-lg px-8 py-4'
                  }`}
                >
              <MessageSquare className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              Kontaktovat prodejce
            </Button>
              </motion.div>
          </div>

            {/* Trust Indicators */}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} items-center justify-center ${isMobile ? 'gap-3' : 'gap-8'} text-gray-700 dark:text-blue-100 ${isMobile ? 'text-sm' : ''}`}>
              <div className="flex items-center gap-2">
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-green-500 dark:bg-green-300 rounded-full animate-pulse`}></div>
                <span>Bezplatná zkušební verze</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-blue-500 dark:bg-blue-300 rounded-full animate-pulse`}></div>
                <span>Nastavení za 5 minut</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-purple-500 dark:bg-purple-300 rounded-full animate-pulse`}></div>
                <span>24/7 podpora</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-surface-bg text-surface-text py-16 relative overflow-hidden border-t border-surface-border/60">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EduAI-Asistent
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed max-w-md">
                Revoluce ve matematickém vzdělávání s pomocí umělé inteligence. Transformujeme způsob, jakým se učí a učí matematiku.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                {[
                  { icon: '📧', label: 'Email', href: 'mailto:info@eduai-asistent.cz' },
                  { icon: '📱', label: 'Telefon', href: 'tel:+420123456789' },
                  { icon: '💬', label: 'Chat', href: '/chat' }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-lg transition-colors duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
            </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">Produkt</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                {[
                  { name: 'Funkce', href: '#features' },
                  { name: 'Ceny', href: '#pricing' },
                  { name: 'Reference', href: '#testimonials' },
                  { name: 'Demo', href: '/demo' }
                ].map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <a href={link.href} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">Podpora</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                {[
                  { name: 'Nápověda', href: '/help' },
                  { name: 'Kontakt', href: '/contact' },
                  { name: 'Dokumentace', href: '/docs' },
                  { name: 'Stav služby', href: '/status' }
                ].map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <a href={link.href} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-center md:text-left">
                &copy; 2024 EduAI-Asistent. Všechna práva vyhrazena.
              </p>
              <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                <a href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Ochrana osobních údajů</a>
                <a href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Podmínky použití</a>
                <a href="/cookies" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
