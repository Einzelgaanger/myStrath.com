import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { School, FileText, Trophy, Users, ArrowRight, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({
    hero: false,
    features: false,
    testimonials: false,
    about: false,
    workflow: false,
    cta: false
  });
  
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    testimonials: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    workflow: useRef<HTMLDivElement>(null),
    cta: useRef<HTMLDivElement>(null)
  };

  // For parallax effect
  const [scrollY, setScrollY] = useState(0);
  
  // For particle animation
  const particlesRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (particlesRef.current) {
        const rect = particlesRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // @ts-ignore
          const id = entry.target.dataset.section;
          if (id) {
            setIsVisible(prev => ({ ...prev, [id]: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all section refs
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/academic-selection");
    }
  };

  // Animation helper for staggered children
  const getStaggeredDelay = (index: number) => {
    return { animationDelay: `${index * 0.1 + 0.2}s` };
  };
  
  // For animated counter effect
  const AnimatedCounter = ({ value, duration = 2000 }: { value: number, duration?: number }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const [ref, inView] = useInView({ triggerOnce: true });
  
    useEffect(() => {
      if (inView) {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const nextCount = Math.floor(progress * value);
          
          if (nextCount !== countRef.current) {
            countRef.current = nextCount;
            setCount(nextCount);
          }
          
          if (progress === 1) clearInterval(interval);
        }, 16);
        
        return () => clearInterval(interval);
      }
    }, [inView, value, duration]);
  
    return <span ref={ref}>{count.toLocaleString()}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center bg-primary text-white p-2 rounded-lg mr-2 animate-pulse-ring relative">
              <div className="absolute inset-0 rounded-lg animate-pulse-ring"></div>
              <School size={24} className="animate-float-slow" />
            </div>
            <h1 className="font-bold text-2xl text-gradient-blue animate-text-shimmer">Stratizens</h1>
          </div>
          <nav>
            <Button 
              variant="default" 
              className="rounded-full button-glow relative overflow-hidden transition-all hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              <span className="relative z-10">Login</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section 
        ref={sectionRefs.hero}
        data-section="hero"
        className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white pt-28 pb-20 relative overflow-hidden"
      >
        {/* Animated background dots */}
        <div className="absolute inset-0 bg-dots opacity-10"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl animate-float"></div>
        
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
          <div className={`md:w-1/2 mb-10 md:mb-0 md:pr-10 ${isVisible.hero ? 'animate-slide-in-from-left' : 'opacity-0'}`}>
            <h2 className="font-bold text-4xl md:text-5xl mb-6 leading-tight text-3d">
              Share, Learn, and <span className="text-gradient-gold">Grow Together</span>
            </h2>
            <p className="text-lg mb-8 opacity-90 leading-relaxed appears appear-delay-1">
              A collaborative platform designed specifically for university students to share learning materials and motivate each other through gamification.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shine animate-fade-in-up shadow-lg"
              onClick={handleGetStarted}
              style={{ animationDelay: '0.4s' }}
            >
              <span className="mr-2">Get Started</span>
              <ArrowRight size={18} className="animate-bounce-slow" />
            </Button>
          </div>
          <div className={`md:w-1/2 flex justify-center ${isVisible.hero ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full max-w-lg h-64 md:h-80 bg-white/10 rounded-xl backdrop-blur-sm overflow-hidden card-glow interactive-card">
              {/* Animated pattern background */}
              <div className="absolute inset-0 bg-grid opacity-20"></div>
              
              {/* Orbiting particles */}
              <div className="absolute w-full h-full">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/80 animate-orbit"></div>
                <div className="absolute top-3/4 right-1/4 w-2 h-2 rounded-full bg-white/80 animate-orbit-reverse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-orange-400/80 animate-orbit" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <School size={64} className="mx-auto mb-4 text-white/90 animate-float" />
                  <h3 className="text-xl font-semibold mb-2 text-gradient-gold">Stratizens Learning Platform</h3>
                  <p className="text-sm text-white/90 animate-fade-in-slide" style={{ animationDelay: '0.6s' }}>Empowering students through collaboration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,256L48,266.7C96,277,192,299,288,293.3C384,288,480,256,576,229.3C672,203,768,181,864,192C960,203,1056,245,1152,261.3C1248,277,1344,267,1392,261.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section with Staggered Animation */}
      <section 
        ref={sectionRefs.features}
        data-section="features"
        className="py-20 bg-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-lines pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="font-bold text-3xl text-gradient-purple relative inline-block">
              How It Works
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </h2>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-10 staggered-children ${isVisible.features ? 'revealed' : ''}`}>
            <div className="p-6 rounded-xl border border-neutral-200/60 hover:border-primary/20 transition-all bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md interactive-card">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 animate-float-slow">
                <FileText className="text-primary w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4 text-center text-gradient-blue">Share Materials</h3>
              <p className="text-neutral-600 text-center">
                Upload and share assignments, notes, and past papers with your classmates to create a knowledge repository.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-neutral-200/60 hover:border-primary/20 transition-all bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md interactive-card">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 animate-pulse-scale">
                <Trophy className="text-primary w-10 h-10 animate-sparkle" />
              </div>
              <h3 className="font-semibold text-xl mb-4 text-center text-gradient-gold">Earn Points</h3>
              <p className="text-neutral-600 text-center">
                Get rewarded for your contributions and active participation with our gamified point system.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-neutral-200/60 hover:border-primary/20 transition-all bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md interactive-card">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 animate-float">
                <Users className="text-primary w-10 h-10" />
              </div>
              <h3 className="font-semibold text-xl mb-4 text-center text-gradient-green">Learn Together</h3>
              <p className="text-neutral-600 text-center">
                Discuss, comment, and collaborate with students in your program to enhance your learning experience.
              </p>
            </div>
          </div>
          
          <div className={`mt-16 text-center ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-full button-glow relative overflow-hidden hover:scale-105 transition-transform"
              onClick={handleGetStarted}
            >
              <span className="relative z-10">Proceed</span>
              <span className="absolute inset-0 w-full h-full bg-white/20 transform translate-y-full transition-transform group-hover:translate-y-0"></span>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        ref={sectionRefs.about}
        data-section="about"
        className="py-24 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`${isVisible.about ? 'animate-slide-in-from-left' : 'opacity-0'}`}>
              <h2 className="text-3xl font-bold mb-6 relative inline-block text-gradient-blue">
                About Stratizens
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-primary"></span>
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  Stratizens is a comprehensive learning platform designed specifically for university students who want to collaborate, share knowledge, and excel in their academic pursuits.
                </p>
                <p className="leading-relaxed">
                  Our mission is to create a community-driven ecosystem where students can exchange educational resources, engage in meaningful academic discussions, and motivate each other through gamification elements.
                </p>
                <p className="leading-relaxed">
                  With advanced security features and a user-friendly interface, Stratizens provides a safe and accessible environment for students to enhance their learning experience.
                </p>
                
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-primary mb-1">
                      <AnimatedCounter value={500} />+
                    </div>
                    <div className="text-sm text-center text-gray-600">Universities</div>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-primary mb-1">
                      <AnimatedCounter value={25000} />+
                    </div>
                    <div className="text-sm text-center text-gray-600">Students</div>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-primary mb-1">
                      <AnimatedCounter value={45000} />+
                    </div>
                    <div className="text-sm text-center text-gray-600">Resources</div>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-primary mb-1">
                      <AnimatedCounter value={120} />+
                    </div>
                    <div className="text-sm text-center text-gray-600">Countries</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`relative ${isVisible.about ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <div className="relative mx-auto w-full max-w-md">
                {/* Main graphic */}
                <div className="relative z-20 bg-white p-6 rounded-xl shadow-xl interactive-card overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0"></div>
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold">S</div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-center mb-4">Our Core Values</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Recognition</h4>
                          <p className="text-sm text-gray-600">Reward and recognize student contributions through badges and points</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Collaboration</h4>
                          <p className="text-sm text-gray-600">Foster a supportive community where students help each other succeed</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Quality</h4>
                          <p className="text-sm text-gray-600">Ensure high-quality learning materials through peer reviews and ratings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-lg rotate-12 z-0 animate-float-slow"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-400/20 rounded-lg -rotate-12 z-0 animate-float"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={sectionRefs.workflow}
        data-section="workflow"
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 ${isVisible.workflow ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="font-bold text-3xl mb-4 relative inline-block">
              <span className="text-gradient-purple">How Stratizens Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform follows a structured approach to organize academic content and facilitate collaboration among students.
            </p>
          </div>
          
          <div className={`relative ${isVisible.workflow ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            {/* Timeline connector */}
            <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-gradient-to-b from-primary via-purple-500 to-blue-500 transform -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-16">
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row">
                <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0 md:text-right">
                  <h3 className="text-xl font-semibold mb-3 text-gradient-blue">1. Select Your Academic Program</h3>
                  <p className="text-gray-600">
                    Choose your country, university, program, course, year, semester, and group to ensure you access the most relevant materials.
                  </p>
                </div>
                
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 hidden md:block">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold animate-pulse-scale">1</div>
                </div>
                
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-gradient-to-br from-white to-primary/5 p-4 rounded-xl shadow-sm border border-primary/10 transform hover:scale-105 transition-transform">
                    <div className="flex items-center text-primary mb-2">
                      <School className="mr-2" size={20} />
                      <span className="font-medium">Academic Selection</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Our hierarchical structure ensures you connect with students in your specific program and access targeted resources.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row">
                <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0 md:text-right order-2 md:order-1">
                  <div className="bg-gradient-to-br from-white to-primary/5 p-4 rounded-xl shadow-sm border border-primary/10 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-end text-primary mb-2">
                      <span className="font-medium">Collaborative Learning</span>
                      <Users className="ml-2" size={20} />
                    </div>
                    <div className="text-sm text-gray-600">
                      Share notes, assignments, and past papers with your classmates. Comment on materials to ask questions or provide clarification.
                    </div>
                  </div>
                </div>
                
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 hidden md:block">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold animate-pulse-scale">2</div>
                </div>
                
                <div className="md:w-1/2 md:pl-12 order-1 md:order-2">
                  <h3 className="text-xl font-semibold mb-3 text-gradient-purple">2. Share and Access Resources</h3>
                  <p className="text-gray-600">
                    Contribute your own study materials or benefit from resources shared by your peers. All content is organized by units and types.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row">
                <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0 md:text-right">
                  <h3 className="text-xl font-semibold mb-3 text-gradient-gold">3. Earn Points and Level Up</h3>
                  <p className="text-gray-600">
                    Get rewarded for your contributions and active participation. Earn points to climb the leaderboard and unlock exclusive badges.
                  </p>
                </div>
                
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 hidden md:block">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold animate-pulse-scale">3</div>
                </div>
                
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-gradient-to-br from-white to-primary/5 p-4 rounded-xl shadow-sm border border-primary/10 transform hover:scale-105 transition-transform">
                    <div className="flex items-center text-primary mb-2">
                      <Trophy className="mr-2 animate-sparkle" size={20} />
                      <span className="font-medium">Gamification</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Our point system rewards high-quality contributions and encourages active participation in the learning community.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with 3D Cards */}
      <section 
        ref={sectionRefs.testimonials}
        data-section="testimonials"
        className="py-20 bg-neutral-50 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/5 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 ${isVisible.testimonials ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="font-bold text-3xl relative inline-block">
              <span className="text-gradient-rose">What Students Say</span>
            </h2>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 staggered-children ${isVisible.testimonials ? 'revealed' : ''}`}>
            <Card className="overflow-hidden interactive-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mr-4 shadow-md border-2 border-white animate-pulse-scale">
                    <p className="font-semibold text-xl text-white">SJ</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Sarah J.</h4>
                    <div className="flex items-center text-neutral-500 text-sm">
                      <span>Computer Science, Year 3</span>
                      <div className="flex ml-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={12} className="fill-amber-400 text-amber-400 ml-px" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -top-4 -left-1 text-6xl text-primary/10">"</div>
                  <p className="text-neutral-600 italic relative z-10 pl-4">This platform has dramatically improved how we share notes and prepare for exams. The point system motivates everyone to contribute quality materials!</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden interactive-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-4 shadow-md border-2 border-white animate-float-slow">
                    <p className="font-semibold text-xl text-white">MT</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Michael T.</h4>
                    <div className="flex items-center text-neutral-500 text-sm">
                      <span>Engineering, Year 2</span>
                      <div className="flex ml-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={12} className="fill-amber-400 text-amber-400 ml-px" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -top-4 -left-1 text-6xl text-primary/10">"</div>
                  <p className="text-neutral-600 italic relative z-10 pl-4">I've collected so many past papers through this site. The comment section helps clarify complex topics and the ranking system makes it fun to participate!</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden interactive-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-4 shadow-md border-2 border-white animate-pulse-scale">
                    <p className="font-semibold text-xl text-white">AK</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Anna K.</h4>
                    <div className="flex items-center text-neutral-500 text-sm">
                      <span>Medicine, Year 4</span>
                      <div className="flex ml-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={12} className="fill-amber-400 text-amber-400 ml-px" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -top-4 -left-1 text-6xl text-primary/10">"</div>
                  <p className="text-neutral-600 italic relative z-10 pl-4">The security features give me peace of mind when sharing study materials. It's so helpful to access resources from students who took our courses in previous years!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with Advanced Animations */}
      <section 
        ref={sectionRefs.cta}
        data-section="cta"
        className="py-24 bg-gradient-to-br from-primary via-primary/90 to-primary/95 text-white relative overflow-hidden"
      >
        {/* Enhanced animated background with multiple layers */}
        <div className="absolute inset-0 bg-dots opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-2xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Enhanced particles container with more variation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`,
                left: `${(Math.sin(i * 0.5) * 60) + 50}%`, 
                top: `${(Math.cos(i * 0.5) * 50) + 50}%`,
                transform: `translate(${(mousePosition.x - window.innerWidth/2) * 0.03 * (i % 3 + 1) * 0.01}px, ${(mousePosition.y - window.innerHeight/2) * 0.03 * (i % 2 + 1) * 0.01}px)`,
                transition: 'transform 0.3s ease-out',
                animation: `float ${7 + i % 5}s infinite ease-in-out alternate`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {/* Content with improved layout */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
            {/* Left column - Main CTA content */}
            <div className={`md:w-3/5 ${isVisible.cta ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="font-bold text-5xl md:text-6xl mb-6 leading-tight">
                Ready to <span className="relative text-gradient-gold">Transform
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"></span>
                </span> Your Learning Experience?
              </h2>
              <p className="text-xl opacity-95 mb-10 leading-relaxed">
                Join thousands of students who are already benefiting from collaborative learning, 
                resource sharing, and gamified knowledge exchange on Stratizens.
              </p>
              
              {/* Enhanced CTA button with animation */}
              <div className="relative inline-block group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse-slow"></div>
                <Button 
                  size="lg" 
                  className="relative rounded-full text-lg px-10 py-6 bg-white text-primary hover:bg-white/95 shadow-xl group-hover:shadow-yellow-500/20 transition-all duration-300"
                  onClick={handleGetStarted}
                >
                  <span className="relative mr-2 z-10">Get Started Today</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
            
            {/* Right column - Stats */}
            <div className={`md:w-2/5 ${isVisible.cta ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h3 className="text-xl font-semibold mb-5 text-center">Join Our Growing Community</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-gradient-gold">
                      <AnimatedCounter value={25000} />+
                    </div>
                    <div className="text-sm opacity-90">Students</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-gradient-gold">
                      <AnimatedCounter value={500} />+
                    </div>
                    <div className="text-sm opacity-90">Universities</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-gradient-gold">
                      <AnimatedCounter value={45000} />+
                    </div>
                    <div className="text-sm opacity-90">Resources</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-gradient-gold">
                      <AnimatedCounter value={98} />%
                    </div>
                    <div className="text-sm opacity-90">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Animated Elements */}
      <footer className="bg-gradient-to-br from-primary to-primary/90 text-white py-10 mt-auto relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        
        {/* Animated lights */}
        <div className="absolute top-0 left-1/4 w-24 h-24 rounded-full bg-white/5 blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-white/5 blur-xl animate-float-slow"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0 animate-fade-in-slide">
              <div className="flex items-center mb-4">
                <div className="flex items-center bg-white text-primary p-1 rounded-lg mr-2 animate-pulse-scale">
                  <School size={20} className="animate-float-slow" />
                </div>
                <h3 className="font-bold text-xl text-gradient-gold">Stratizens</h3>
              </div>
              <p className="text-sm opacity-90 max-w-md">
                A collaborative learning platform for university students to share materials and enhance their academic experience.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 animate-fade-in-slide" style={{ animationDelay: '0.2s' }}>
              <div>
                <h4 className="font-semibold mb-4 text-gradient-gold">Contact</h4>
                <ul className="space-y-2 text-sm opacity-90">
                  <li className="flex items-center hover:translate-x-1 transition-transform cursor-pointer">
                    <span className="bg-white/10 p-1 rounded mr-2 text-xs">@</span>
                    support@stratizens.edu
                  </li>
                  <li className="flex items-center hover:translate-x-1 transition-transform cursor-pointer">
                    <span className="bg-white/10 p-1 rounded mr-2 text-xs">📱</span>
                    +254 700 123 456
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-gradient-gold">Links</h4>
                <ul className="space-y-2 text-sm opacity-90">
                  <li className="hover:translate-x-1 transition-transform">
                    <a href="#" className="hover:text-white inline-block border-b border-transparent hover:border-white/50 pb-px transition-colors">Terms of Service</a>
                  </li>
                  <li className="hover:translate-x-1 transition-transform">
                    <a href="#" className="hover:text-white inline-block border-b border-transparent hover:border-white/50 pb-px transition-colors">Privacy Policy</a>
                  </li>
                  <li className="hover:translate-x-1 transition-transform">
                    <a href="#" className="hover:text-white inline-block border-b border-transparent hover:border-white/50 pb-px transition-colors">Help Center</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white border-opacity-20 mt-8 pt-8 text-center text-sm opacity-80 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p>&copy; {new Date().getFullYear()} Stratizens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
