import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Award,
  Trophy, 
  TrendingUp, 
  Info, 
  Rocket,
  BarChart3,
  MessageCircle,
  Quote,
  Sparkles,
  Flame,
  X,
  Star,
  ArrowUp,
  Lightbulb,
  BookOpen,
  Compass,
  Crosshair,
  BookMarked,
  Brain,
  Shield,
  Crown,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { BadgeRank } from "@/components/ui/badge-rank";
import { ProfileBadge } from "@/components/ui/profile-badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Define the types for user stats
type UserStats = {
  id: number;
  totalPoints: number;
  rank: number;
  badge: string;
  totalContributions: number;
  contributionBreakdown: {
    assignments: number;
    notes: number;
    pastPapers: number;
  };
};

// Define the type for leaderboard entries
type LeaderboardEntry = {
  id: number;
  username: string;
  admissionNumber: string;
  profilePicture: string | null;
  points: number;
  badge: string;
  totalContributions: number;
};

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showRanksDialog, setShowRanksDialog] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [adminQuote, setAdminQuote] = useState("Knowledge shared is knowledge multiplied. Share with your friends today!");
  
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Fetch user details including academic info
  const { data: userDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["/api/user/details"],
    queryFn: async () => {
      const res = await fetch("/api/user/details");
      if (!res.ok) throw new Error("Failed to fetch user details");
      return res.json();
    },
  });

  // Fetch user's units
  const { data: userUnits, isLoading: unitsLoading } = useQuery({
    queryKey: ["/api/user/units"],
    queryFn: async () => {
      const res = await fetch("/api/user/units");
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
  });

  const [, setLocation] = useLocation();

  // Calculate percentages for contribution progress bars
  const getTotalContributions = () => {
    if (!userStats?.contributionBreakdown) return 0;
    const { assignments, notes, pastPapers } = userStats.contributionBreakdown;
    return assignments + notes + pastPapers;
  };

  const getPercentage = (value: number) => {
    const total = getTotalContributions();
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Set up intersection observers for different sections animation
  const [welcomeRef, welcomeInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [quoteRef, quoteInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [leaderboardRef, leaderboardInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [infoRef, infoInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <MainLayout>
      {/* Welcome Header - Section 1 */}
      <motion.div 
        ref={welcomeRef}
        initial={{ opacity: 0, y: 20 }}
        animate={welcomeInView ? { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.7, 
            ease: [0.22, 1, 0.36, 1]
          }
        } : {}}
        className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20 shadow-sm relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <motion.div 
          className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 z-0"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/4 z-0"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Floating particles */}
        <motion.div 
          className="absolute top-1/4 right-1/3 w-2 h-2 bg-primary/40 rounded-full z-0"
          animate={{ 
            y: [0, -15, 0],
            x: [0, 5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary/30 rounded-full z-0"
          animate={{ 
            y: [0, 10, 0],
            x: [0, -8, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <motion.h1 
              className="font-bold text-3xl text-gradient-blue mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={welcomeInView ? {
                opacity: 1, 
                x: 0,
                transition: { 
                  duration: 0.6,
                  delay: 0.2,
                  ease: "easeOut"
                }
              } : {}}
            >
              Welcome, {user?.username || 'Scholar'}!
            </motion.h1>
            
            {userDetails && (
              <motion.div 
                className="text-muted-foreground space-y-1"
                initial={{ opacity: 0 }}
                animate={welcomeInView ? {
                  opacity: 1,
                  transition: {
                    duration: 0.8,
                    delay: 0.4,
                    staggerChildren: 0.1
                  }
                } : {}}
              >
                {[
                  { label: "Admission Number", value: userDetails.admissionNumber },
                  { label: "Course", value: userDetails.courseName },
                  { label: "Program", value: userDetails.programName },
                  { label: "Year", value: userDetails.yearName },
                  { label: "Semester", value: userDetails.semesterName },
                  { label: "Group", value: userDetails.groupName }
                ].map((detail, index) => (
                  <motion.p 
                    key={detail.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={welcomeInView ? {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.5,
                        delay: 0.5 + (index * 0.1)
                      }
                    } : {}}
                  >
                    <strong>{detail.label}:</strong> {detail.value}
                  </motion.p>
                ))}
              </motion.div>
            )}
          </div>
          
          {!statsLoading && userStats?.badge && (
            <motion.div 
              className="hidden md:flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={welcomeInView ? {
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.6,
                  delay: 0.3,
                  ease: "easeOut"
                }
              } : {}}
            >
              <ProfileBadge 
                rank={userStats.badge} 
                profileImage={user?.profilePicture || null}
                username={user?.username || ""}
                size="xl"
                pulseEffect={true}
                className="mb-2 animate-float"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={welcomeInView ? {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.4,
                    delay: 0.9
                  }
                } : {}}
              >
                <BadgeRank 
                  rank={userStats.badge} 
                  className="text-xs px-3 py-1 mt-2"
                  showIcon={true}
                />
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Units Section */}
      <div className="mb-8">
        <motion.h2 
          className="text-2xl font-bold mb-6 text-gradient-purple relative inline-flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <BookMarked className="mr-2 text-primary" />
          Your Learning Units
          <motion.div 
            className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          />
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unitsLoading ? (
            <motion.div 
              className="col-span-full flex flex-col items-center justify-center py-12 text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="h-12 w-12 mb-3 text-primary/30 animate-pulse" />
              <p className="text-lg">Loading your units...</p>
            </motion.div>
          ) : userUnits?.length === 0 ? (
            <motion.div 
              className="col-span-full flex flex-col items-center justify-center py-12 text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="h-12 w-12 mb-3 text-primary/50" />
              <p className="text-lg font-medium mb-2">No units available yet</p>
              <p className="text-sm text-center max-w-md">Your academic units will appear here once they are assigned to your group</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {userUnits?.map((unit, index) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: 0.1 * index,
                      ease: "easeOut"
                    }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <Card className="h-full overflow-hidden hover:shadow-md transition-all duration-300 relative group">
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary/70 to-primary/30 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-gradient-blue">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        {unit.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 h-10">{unit.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Progress</span>
                          <motion.span 
                            className="font-medium text-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 + (0.1 * index) }}
                          >
                            {unit.progress}%
                          </motion.span>
                        </div>
                        <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${unit.progress}%` }}
                            transition={{ 
                              duration: 1, 
                              delay: 0.5 + (0.1 * index),
                              ease: "easeOut"
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary/5 transition-colors"
                        onClick={() => setLocation(`/units/${unit.id}`)}
                      >
                        <span>View Content</span>
                        <motion.div 
                          className="ml-2"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            repeatType: "loop",
                            ease: "easeInOut",
                            repeatDelay: 1
                          }}
                        >
                          <ArrowRight size={14} />
                        </motion.div>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Admin Quote - Section 2 */}
      <div className="mb-8">
        {/* Use ref for intersection observer to trigger animations */}
        <motion.div 
          ref={quoteRef}
          initial={{ opacity: 0, y: 10 }}
          animate={quoteInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden"
        >
          <Card className="border-primary/20 overflow-hidden">
            <motion.div 
              className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent"
              initial={{ opacity: 0, x: 30 }}
              animate={quoteInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            
            <motion.div 
              className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5"
              animate={quoteInView ? {
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.7, 0.5],
              } : {}}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-6">
                  <motion.div 
                    className="flex items-center mb-3 text-primary/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={quoteInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.div
                      animate={quoteInView ? {
                        rotate: [0, 10, 0, -10, 0],
                      } : {}}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 2
                      }}
                    >
                      <Quote size={18} className="mr-2" />
                    </motion.div>
                    <span className="text-sm font-medium">Daily Motivation</span>
                  </motion.div>
                  
                  <motion.div 
                    className="text-xl text-neutral-800 italic font-medium mb-3 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={quoteInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    <span className="relative">
                      <motion.span
                        className="inline-block text-4xl text-primary/30 absolute -top-4 -left-4 font-serif"
                        initial={{ opacity: 0, y: 10 }}
                        animate={quoteInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        "
                      </motion.span>
                      <span className="relative">{adminQuote}</span>
                      <motion.span
                        className="inline-block text-4xl text-primary/30 absolute -bottom-6 -right-4 font-serif"
                        initial={{ opacity: 0, y: -10 }}
                        animate={quoteInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        "
                      </motion.span>
                    </span>
                  </motion.div>
                  
                  <motion.div 
                    className="text-sm text-neutral-500"
                    initial={{ opacity: 0 }}
                    animate={quoteInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    - Stratizens Admin Team
                  </motion.div>
                </div>
                
                {user?.isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={quoteInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuoteModalOpen(true)}
                      className="text-xs scale-on-hover relative overflow-hidden group"
                    >
                      <motion.span
                        className="absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                      />
                      <motion.div
                        className="relative z-10 flex items-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <MessageCircle className="mr-1 h-3 w-3" />
                        <span>Update Quote</span>
                      </motion.div>
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Leaderboard - Section 3 */}
      <motion.div
        ref={leaderboardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={leaderboardInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <Card className="shadow-md overflow-hidden relative">
          {/* Decorative elements */}
          <motion.div 
            className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-amber-400/5 rounded-full z-0"
            animate={leaderboardInView ? {
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-blue-400/5 rounded-full z-0"
            animate={leaderboardInView ? {
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.4, 0.2],
            } : {}}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <CardHeader className="pb-0 relative z-10">
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={leaderboardInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={leaderboardInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardTitle className="text-xl flex items-center">
                  <motion.div
                    animate={leaderboardInView ? {
                      rotateY: [0, 360],
                      scale: [1, 1.2, 1]
                    } : {}}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      delay: 0.5,
                      repeatDelay: 7,
                      repeat: Infinity
                    }}
                  >
                    <Trophy className="text-primary mr-2" size={24} />
                  </motion.div>
                  <motion.span 
                    className="text-gradient-gold"
                    animate={leaderboardInView ? {
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    } : {}}
                    transition={{
                      duration: 5,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                  >
                    Top Stratizens
                  </motion.span>
                </CardTitle>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={leaderboardInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Button 
                  variant="outline" 
                  className="text-xs px-3 py-1 h-auto scale-on-hover relative overflow-hidden group" 
                  onClick={() => setShowRanksDialog(true)}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                  />
                  <motion.div
                    className="relative z-10 flex items-center"
                    animate={leaderboardInView ? {
                      y: [0, -2, 0, 2, 0]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    <Rocket className="mr-1 h-3 w-3" />
                    <span>View All Ranks</span>
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={leaderboardInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CardDescription className="mt-1">
                The most active contributors in your academic community
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="p-6 relative z-10">
            {leaderboardLoading ? (
              <motion.div 
                className="py-8 text-center text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Rocket className="animate-spin h-8 w-8 mx-auto mb-2 text-primary/50" />
                <p>Loading leaderboard...</p>
              </motion.div>
            ) : leaderboard.length === 0 ? (
              <motion.div 
                className="py-8 text-center text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No users found
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <motion.h3 
                    className="text-sm font-medium text-neutral-500 flex items-center mb-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={leaderboardInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <motion.span
                      animate={leaderboardInView ? {
                        rotate: [0, 15, 0, -15, 0],
                      } : {}}
                      transition={{
                        duration: 2,
                        delay: 1,
                        repeat: Infinity,
                        repeatDelay: 5
                      }}
                    >
                      <Star className="h-4 w-4 mr-1 text-amber-500" />
                    </motion.span>
                    Top 5 Performers
                  </motion.h3>
                  
                  {leaderboard.slice(0, 5).map((user: LeaderboardEntry, index: number) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={leaderboardInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.6 + (index * 0.1),
                        ease: "easeOut"
                      }}
                    >
                      <Card 
                        className={cn(
                          "overflow-hidden border shadow-sm hover:shadow-md transition-all", 
                          index === 0 ? "bg-amber-50 border-amber-200" : "",
                          userStats && user.id === userStats.id ? "border-primary/50 bg-primary/5" : ""
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center">
                            <div className="relative mr-3">
                              <motion.div 
                                className={cn(
                                  "absolute -left-1 -top-1 z-10 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center",
                                  index === 0 ? "bg-amber-500 text-white" : "bg-neutral-200 text-neutral-700"
                                )}
                                initial={{ scale: 0 }}
                                animate={leaderboardInView ? { scale: 1 } : {}}
                                transition={{ 
                                  duration: 0.3, 
                                  delay: 0.8 + (index * 0.1),
                                  type: "spring"
                                }}
                              >
                                {index + 1}
                              </motion.div>
                              
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <ProfileBadge 
                                  rank={user.badge} 
                                  profileImage={user.profilePicture} 
                                  username={user.username}
                                  size="md"
                                  className={index === 0 ? "shine" : ""}
                                />
                              </motion.div>
                            </div>
                            
                            <div className="flex-1 overflow-hidden">
                              <motion.div 
                                className="font-semibold text-neutral-800 text-sm truncate mb-0.5"
                                initial={{ opacity: 0 }}
                                animate={leaderboardInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.3, delay: 0.9 + (index * 0.1) }}
                              >
                                {user.username}
                              </motion.div>
                              
                              <motion.div 
                                className="text-xs text-neutral-500 truncate"
                                initial={{ opacity: 0 }}
                                animate={leaderboardInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.3, delay: 1 + (index * 0.1) }}
                              >
                                {user.admissionNumber}
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center mt-1.5"
                                initial={{ opacity: 0, y: 5 }}
                                animate={leaderboardInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.3, delay: 1.1 + (index * 0.1) }}
                              >
                                <BadgeRank 
                                  rank={user.badge} 
                                  className="text-[10px] px-2 py-0.5 mr-2" 
                                  showIcon={false}
                                />
                                
                                <motion.div 
                                  className="text-xs font-medium text-primary"
                                  initial={{ opacity: 0 }}
                                  animate={leaderboardInView ? { 
                                    opacity: 1,
                                    scale: [1, 1.15, 1]
                                  } : {}}
                                  transition={{ 
                                    duration: 0.5, 
                                    delay: 1.2 + (index * 0.1),
                                    times: [0, 0.5, 1]
                                  }}
                                >
                                  {user.points} pts
                                </motion.div>
                              </motion.div>
                            </div>
                            
                            <motion.div 
                              className="text-xs text-center bg-neutral-100 px-2 py-1 rounded-full"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={leaderboardInView ? { opacity: 1, scale: 1 } : {}}
                              transition={{ duration: 0.3, delay: 1.3 + (index * 0.1) }}
                              whileHover={{ 
                                backgroundColor: "rgba(var(--primary), 0.1)",
                                transition: { duration: 0.2 }
                              }}
                            >
                              <span className="font-semibold">{user.totalContributions}</span>
                              <span className="text-neutral-500 ml-1">items</span>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <motion.h3 
                    className="text-sm font-medium text-neutral-500 flex items-center mb-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={leaderboardInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <motion.span
                      animate={leaderboardInView ? {
                        y: [0, -3, 0],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        delay: 1.5,
                        repeat: Infinity,
                        repeatDelay: 4
                      }}
                    >
                      <ArrowUp className="h-4 w-4 mr-1 text-cyan-500" />
                    </motion.span>
                    Rising Stars
                  </motion.h3>
                  
                  {leaderboard.slice(5, 10).map((user: LeaderboardEntry, index: number) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={leaderboardInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.9 + (index * 0.1),
                        ease: "easeOut"
                      }}
                    >
                      <Card 
                        className={cn(
                          "overflow-hidden border shadow-sm hover:shadow-md transition-all", 
                          userStats && user.id === userStats.id ? "border-primary/50 bg-primary/5" : ""
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center">
                            <div className="relative mr-3">
                              <motion.div 
                                className="absolute -left-1 -top-1 z-10 text-xs font-bold bg-neutral-200 text-neutral-700 rounded-full w-5 h-5 flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={leaderboardInView ? { scale: 1 } : {}}
                                transition={{ 
                                  duration: 0.3, 
                                  delay: 1.1 + (index * 0.1),
                                  type: "spring"
                                }}
                              >
                                {index + 6}
                              </motion.div>
                              
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <ProfileBadge 
                                  rank={user.badge} 
                                  profileImage={user.profilePicture} 
                                  username={user.username}
                                  size="md"
                                />
                              </motion.div>
                            </div>
                            
                            <div className="flex-1 overflow-hidden">
                              <motion.div 
                                className="font-semibold text-neutral-800 text-sm truncate mb-0.5"
                                initial={{ opacity: 0 }}
                                animate={leaderboardInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.3, delay: 1.2 + (index * 0.1) }}
                              >
                                {user.username}
                              </motion.div>
                              
                              <motion.div 
                                className="text-xs text-neutral-500 truncate"
                                initial={{ opacity: 0 }}
                                animate={leaderboardInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.3, delay: 1.3 + (index * 0.1) }}
                              >
                                {user.admissionNumber}
                              </motion.div>
                              
                              <motion.div 
                                className="flex items-center mt-1.5"
                                initial={{ opacity: 0, y: 5 }}
                                animate={leaderboardInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.3, delay: 1.4 + (index * 0.1) }}
                              >
                                <BadgeRank 
                                  rank={user.badge} 
                                  className="text-[10px] px-2 py-0.5 mr-2" 
                                  showIcon={false}
                                />
                                
                                <motion.div 
                                  className="text-xs font-medium text-primary"
                                  initial={{ opacity: 0 }}
                                  animate={leaderboardInView ? { 
                                    opacity: 1,
                                    scale: [1, 1.15, 1]
                                  } : {}}
                                  transition={{ 
                                    duration: 0.5, 
                                    delay: 1.5 + (index * 0.1),
                                    times: [0, 0.5, 1]
                                  }}
                                >
                                  {user.points} pts
                                </motion.div>
                              </motion.div>
                            </div>
                            
                            <motion.div 
                              className="text-xs text-center bg-neutral-100 px-2 py-1 rounded-full"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={leaderboardInView ? { opacity: 1, scale: 1 } : {}}
                              transition={{ duration: 0.3, delay: 1.6 + (index * 0.1) }}
                              whileHover={{ 
                                backgroundColor: "rgba(var(--primary), 0.1)",
                                transition: { duration: 0.2 }
                              }}
                            >
                              <span className="font-semibold">{user.totalContributions}</span>
                              <span className="text-neutral-500 ml-1">items</span>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Personal Statistics - Section 4 */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={statsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <Card className="shadow-md overflow-hidden relative">
          {/* Decorative background elements */}
          <motion.div 
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/10 to-purple-400/5 rounded-full -translate-y-1/2 translate-x-1/4 z-0"
            animate={statsInView ? {
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3],
            } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute -bottom-20 -left-16 w-56 h-56 bg-gradient-to-tr from-blue-200/10 to-blue-300/5 rounded-full z-0"
            animate={statsInView ? {
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            } : {}}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <CardHeader className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle className="text-xl flex items-center">
                <motion.div
                  animate={statsInView ? {
                    rotate: [0, 15, 0, -15, 0],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="text-primary mr-2" size={24} />
                </motion.div>
                <motion.span 
                  className="text-gradient-purple"
                  animate={statsInView ? {
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  } : {}}
                  transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                >
                  Your Performance
                </motion.span>
              </CardTitle>
              <CardDescription>
                Track your progress and contributions to the community
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="p-6 relative z-10">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={statsInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Stat Card 1: Total Points */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border shadow-sm overflow-hidden h-full">
                  <CardContent className="p-4 text-center relative">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="text-xs uppercase font-semibold text-neutral-500 mb-1"
                    >
                      Total Points
                    </motion.div>
                    
                    <motion.div 
                      className="text-3xl font-bold text-gradient-blue mb-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={statsInView ? { 
                        opacity: 1, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 0.6, type: "spring" }
                      } : {}}
                    >
                      {statsLoading ? '...' : userStats?.totalPoints}
                    </motion.div>
                    
                    <motion.div 
                      className="absolute -bottom-4 -right-4 text-primary/10"
                      initial={{ rotate: -15, scale: 0.9 }}
                      animate={statsInView ? { 
                        rotate: 0, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 0.7, type: "spring" }
                      } : {}}
                    >
                      <motion.div
                        animate={statsInView ? {
                          rotate: [0, 10, 0, -10, 0],
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      >
                        <Star size={48} />
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Stat Card 2: Community Rank */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border shadow-sm overflow-hidden h-full">
                  <CardContent className="p-4 text-center relative">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.7 }}
                      className="text-xs uppercase font-semibold text-neutral-500 mb-1"
                    >
                      Community Rank
                    </motion.div>
                    
                    <motion.div 
                      className="text-3xl font-bold text-gradient-blue mb-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={statsInView ? { 
                        opacity: 1, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 0.8, type: "spring" }
                      } : {}}
                    >
                      #{statsLoading ? '...' : userStats?.rank}
                    </motion.div>
                    
                    <motion.div 
                      className="absolute -bottom-4 -right-4 text-primary/10"
                      initial={{ rotate: -15, scale: 0.9 }}
                      animate={statsInView ? { 
                        rotate: 0, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 0.9, type: "spring" }
                      } : {}}
                    >
                      <motion.div
                        animate={statsInView ? {
                          rotateY: [0, 180, 360],
                          scale: [1, 1.15, 1],
                        } : {}}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          repeatDelay: 4,
                          ease: "easeInOut",
                          delay: 1.5
                        }}
                      >
                        <Trophy size={48} />
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Stat Card 3: Badge Level */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border shadow-sm overflow-hidden h-full">
                  <CardContent className="p-4 text-center relative">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.9 }}
                      className="text-xs uppercase font-semibold text-neutral-500 mb-1"
                    >
                      Badge Level
                    </motion.div>
                    
                    <motion.div 
                      className="text-xl font-bold text-gradient-blue mb-0 truncate"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={statsInView ? { 
                        opacity: 1, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 1.0, type: "spring" }
                      } : {}}
                    >
                      {statsLoading ? '...' : userStats?.badge}
                    </motion.div>
                    
                    <motion.div 
                      className="absolute -bottom-4 -right-4 text-primary/10"
                      initial={{ rotate: -15, scale: 0.9 }}
                      animate={statsInView ? { 
                        rotate: 0, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 1.1, type: "spring" }
                      } : {}}
                    >
                      <motion.div
                        animate={statsInView ? {
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        } : {}}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                          delay: 2
                        }}
                      >
                        <Award size={48} />
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Stat Card 4: Materials Shared */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border shadow-sm overflow-hidden h-full">
                  <CardContent className="p-4 text-center relative">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: 1.1 }}
                      className="text-xs uppercase font-semibold text-neutral-500 mb-1"
                    >
                      Materials Shared
                    </motion.div>
                    
                    <motion.div 
                      className="text-3xl font-bold text-gradient-blue mb-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={statsInView ? { 
                        opacity: 1, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 1.2, type: "spring" }
                      } : {}}
                    >
                      {statsLoading ? '...' : userStats?.totalContributions}
                    </motion.div>
                    
                    <motion.div 
                      className="absolute -bottom-4 -right-4 text-primary/10"
                      initial={{ rotate: -15, scale: 0.9 }}
                      animate={statsInView ? { 
                        rotate: 0, 
                        scale: 1,
                        transition: { duration: 0.5, delay: 1.3, type: "spring" }
                      } : {}}
                    >
                      <motion.div
                        animate={statsInView ? {
                          y: [0, -5, 0],
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut",
                          delay: 2.5
                        }}
                      >
                        <Flame size={48} />
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <motion.h3 
                className="font-semibold text-lg mb-4 flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={statsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 1.3 }}
              >
                <motion.div
                  animate={statsInView ? {
                    rotate: [0, 20, 0, -20, 0],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut",
                    delay: 2
                  }}
                >
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                </motion.div>
                Contribution Breakdown
              </motion.h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Assignments Progress */}
                <motion.div
                  className="border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "rgba(var(--primary), 0.3)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <motion.div 
                      className="font-semibold"
                      initial={{ opacity: 0 }}
                      animate={statsInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.3, delay: 1.5 }}
                    >
                      Assignments
                    </motion.div>
                    <motion.div 
                      className="text-sm bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 1.6, type: "spring" }}
                    >
                      {statsLoading ? '...' : userStats?.contributionBreakdown?.assignments} shared
                    </motion.div>
                  </div>
                  <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={statsInView ? { width: `${statsLoading ? 0 : getPercentage(userStats?.contributionBreakdown?.assignments || 0)}%` } : {}}
                      transition={{ duration: 1, delay: 1.7, ease: "easeOut" }}
                    />
                    <motion.div 
                      className="absolute top-0 right-0 h-full w-1 bg-white rounded-full opacity-30"
                      animate={statsInView ? {
                        x: [100, -400],
                        opacity: [0, 0.8, 0]
                      } : {}}
                      transition={{
                        duration: 1.5,
                        delay: 2,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>
                
                {/* Notes Progress */}
                <motion.div
                  className="border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1.6 }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "rgba(var(--primary), 0.3)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <motion.div 
                      className="font-semibold"
                      initial={{ opacity: 0 }}
                      animate={statsInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.3, delay: 1.7 }}
                    >
                      Notes
                    </motion.div>
                    <motion.div 
                      className="text-sm bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 1.8, type: "spring" }}
                    >
                      {statsLoading ? '...' : userStats?.contributionBreakdown?.notes} shared
                    </motion.div>
                  </div>
                  <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={statsInView ? { width: `${statsLoading ? 0 : getPercentage(userStats?.contributionBreakdown?.notes || 0)}%` } : {}}
                      transition={{ duration: 1, delay: 1.9, ease: "easeOut" }}
                    />
                    <motion.div 
                      className="absolute top-0 right-0 h-full w-1 bg-white rounded-full opacity-30"
                      animate={statsInView ? {
                        x: [100, -400],
                        opacity: [0, 0.8, 0]
                      } : {}}
                      transition={{
                        duration: 1.5,
                        delay: 2.2,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>
                
                {/* Past Papers Progress */}
                <motion.div
                  className="border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1.8 }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "rgba(var(--primary), 0.3)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <motion.div 
                      className="font-semibold"
                      initial={{ opacity: 0 }}
                      animate={statsInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.3, delay: 1.9 }}
                    >
                      Past Papers
                    </motion.div>
                    <motion.div 
                      className="text-sm bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 2.0, type: "spring" }}
                    >
                      {statsLoading ? '...' : userStats?.contributionBreakdown?.pastPapers} shared
                    </motion.div>
                  </div>
                  <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={statsInView ? { width: `${statsLoading ? 0 : getPercentage(userStats?.contributionBreakdown?.pastPapers || 0)}%` } : {}}
                      transition={{ duration: 1, delay: 2.1, ease: "easeOut" }}
                    />
                    <motion.div 
                      className="absolute top-0 right-0 h-full w-1 bg-white rounded-full opacity-30"
                      animate={statsInView ? {
                        x: [100, -400],
                        opacity: [0, 0.8, 0]
                      } : {}}
                      transition={{
                        duration: 1.5,
                        delay: 2.4,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Point System Explanation - Section 5 */}
      <motion.div
        ref={infoRef}
        initial={{ opacity: 0, y: 20 }}
        animate={infoInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <Card className="shadow-md overflow-hidden relative">
          {/* Decorative background elements */}
          <motion.div 
            className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-green-200/10 to-primary/5 rounded-full z-0"
            animate={infoInView ? {
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.4, 0.2],
            } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute -bottom-24 -left-16 w-64 h-64 bg-gradient-to-tr from-blue-200/10 to-green-300/5 rounded-full z-0"
            animate={infoInView ? {
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            } : {}}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <CardHeader className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={infoInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle className="text-xl flex items-center">
                <motion.div
                  animate={infoInView ? {
                    rotate: [0, 15, 0, -15, 0],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut"
                  }}
                >
                  <Info className="text-primary mr-2" size={24} />
                </motion.div>
                <motion.span 
                  className="text-gradient-green"
                  animate={infoInView ? {
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  } : {}}
                  transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                >
                  Information Center
                </motion.span>
              </CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="p-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Earning Points Panel */}
              <motion.div
                className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border shadow-sm overflow-hidden relative"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={infoInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full"
                  animate={infoInView ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  } : {}}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <motion.h3 
                  className="font-semibold text-primary mb-3 flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={infoInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <motion.div
                    animate={infoInView ? {
                      y: [0, -3, 0, -3, 0],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                  </motion.div>
                  Earning Points
                </motion.h3>
                
                <motion.ul className="text-sm space-y-2 relative z-10">
                  {[
                    { action: "Upload Assignment", points: "+10 pts" },
                    { action: "Upload Notes", points: "+25 pts" },
                    { action: "Upload Past Paper", points: "+20 pts" },
                    { action: "Early Assignment Completion", points: "+Variable" },
                    { action: "Receive a Like", points: "+1 pt" }
                  ].map((item, index) => (
                    <motion.li 
                      key={item.action}
                      className="flex justify-between items-center p-1.5 hover:bg-primary/5 rounded-md transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={infoInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                      whileHover={{ x: 2, transition: { duration: 0.1 } }}
                    >
                      <span>{item.action}</span>
                      <motion.span 
                        className="font-semibold px-2 py-0.5 bg-white/70 rounded-full text-primary shadow-sm"
                        initial={{ scale: 0.9 }}
                        animate={infoInView ? { scale: 1 } : {}}
                        transition={{ duration: 0.2, delay: 0.6 + (index * 0.1) }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
                      >
                        {item.points}
                      </motion.span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
              
              {/* Losing Points Panel */}
              <motion.div
                className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 shadow-sm overflow-hidden relative"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={infoInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-bl from-red-200/20 to-transparent rounded-full"
                  animate={infoInView ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  } : {}}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                
                <motion.h3 
                  className="font-semibold text-red-500 mb-3 flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={infoInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <motion.div
                    animate={infoInView ? {
                      rotate: [0, 90, 180, 270, 360],
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut"
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                  </motion.div>
                  Losing Points
                </motion.h3>
                
                <motion.ul className="text-sm space-y-2 relative z-10">
                  {[
                    { action: "Overdue Assignment", points: "-20 pts" },
                    { action: "Receive a Dislike", points: "-1 pt" }
                  ].map((item, index) => (
                    <motion.li 
                      key={item.action}
                      className="flex justify-between items-center p-1.5 hover:bg-red-100 rounded-md transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={infoInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
                      whileHover={{ x: 2, transition: { duration: 0.1 } }}
                    >
                      <span>{item.action}</span>
                      <motion.span 
                        className="font-semibold px-2 py-0.5 bg-white/70 rounded-full text-red-500 shadow-sm"
                        initial={{ scale: 0.9 }}
                        animate={infoInView ? { scale: 1 } : {}}
                        transition={{ duration: 0.2, delay: 0.8 + (index * 0.1) }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
                      >
                        {item.points}
                      </motion.span>
                    </motion.li>
                  ))}
                  
                  {/* Empty space to match height of previous panel */}
                  <div className="h-[108px]"></div>
                </motion.ul>
              </motion.div>
              
              {/* Ranks & Badges Panel */}
              <motion.div
                className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 rounded-lg border shadow-sm overflow-hidden relative"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={infoInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full"
                  animate={infoInView ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  } : {}}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                />
                
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <motion.h3 
                    className="font-semibold"
                    initial={{ opacity: 0, x: -10 }}
                    animate={infoInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    Ranks & Badges
                  </motion.h3>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={infoInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="ghost" 
                      className="text-xs px-2 py-1 h-auto group"
                      onClick={() => setShowRanksDialog(true)}
                    >
                      <span className="mr-1">View All</span>
                      <motion.div
                        animate={infoInView ? {
                          x: [0, 3, 0]
                        } : {}}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut"
                        }}
                      >
                        <ArrowRight size={12} />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="text-sm space-y-1 max-h-[162px] overflow-y-auto pr-1 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={infoInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  {[
                    { name: "Starlet Scholar", points: "0-50 pts", icon: Star, color: "text-slate-400" },
                    { name: "Knowledge Keeper", points: "51-150 pts", icon: Award, color: "text-green-400" },
                    { name: "Insight Voyager", points: "151-300 pts", icon: Rocket, color: "text-cyan-500" },
                    { name: "Wisdom Weaver", points: "301-500 pts", icon: TrendingUp, color: "text-blue-500" }
                  ].map((rank, index) => (
                    <motion.div 
                      key={rank.name}
                      className="flex items-center justify-between p-1.5 hover:bg-white rounded-md transition-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={infoInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: 1.1 + (index * 0.1) }}
                      whileHover={{ 
                        backgroundColor: "rgba(var(--primary), 0.05)",
                        x: 2,
                        transition: { duration: 0.1 } 
                      }}
                    >
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.02 }}
                      >
                        <motion.div
                          animate={infoInView ? (index % 2 === 0 ? {
                            rotate: [0, 10, 0, -10, 0]
                          } : {
                            scale: [1, 1.2, 1]
                          }) : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 5 + index,
                            ease: "easeInOut"
                          }}
                        >
                          <span className={`h-3.5 w-3.5 ${rank.color} mr-2`}>{<rank.icon />}</span>
                        </motion.div>
                        <span>{rank.name}</span>
                      </motion.div>
                      <motion.span 
                        className="font-semibold text-xs bg-neutral-100 px-2 py-0.5 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        {rank.points}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Rank System Dialog */}
      <Dialog open={showRanksDialog} onOpenChange={setShowRanksDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Trophy className="text-primary mr-2" size={20} />
              <span className="text-gradient-gold">Stratizens Rank System</span>
            </DialogTitle>
            <DialogDescription>
              Earn points by actively participating and sharing resources to climb through these prestigious academic ranks.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Starlet Scholar" size="sm" className="mr-2" />
                  <span className="font-semibold">Starlet Scholar</span>
                </div>
                <BadgeRank rank="Starlet Scholar" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">0-50 points</p>
              <p className="text-xs text-neutral-600">Taking the first steps in sharing knowledge. Every journey begins with a single contribution.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Knowledge Keeper" size="sm" className="mr-2" />
                  <span className="font-semibold">Knowledge Keeper</span>
                </div>
                <BadgeRank rank="Knowledge Keeper" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">51-150 points</p>
              <p className="text-xs text-neutral-600">Developing a habit of sharing resources with your peers. Your contributions are making a difference.</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Insight Voyager" size="sm" className="mr-2" />
                  <span className="font-semibold">Insight Voyager</span>
                </div>
                <BadgeRank rank="Insight Voyager" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">151-300 points</p>
              <p className="text-xs text-neutral-600">Your consistent sharing is creating ripples. You're becoming known for your helpful resources.</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Wisdom Weaver" size="sm" className="mr-2" />
                  <span className="font-semibold">Wisdom Weaver</span>
                </div>
                <BadgeRank rank="Wisdom Weaver" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">301-500 points</p>
              <p className="text-xs text-neutral-600">Crafting a web of knowledge that supports many students. Your contributions have notable quality.</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Truth Hunter" size="sm" className="mr-2" />
                  <span className="font-semibold">Truth Hunter</span>
                </div>
                <BadgeRank rank="Truth Hunter" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">501-750 points</p>
              <p className="text-xs text-neutral-600">Seeking and sharing deeper academic insights. Your reputation for quality is growing rapidly.</p>
            </div>
            
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-lg border border-violet-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Galactic Sage" size="sm" className="mr-2" />
                  <span className="font-semibold">Galactic Sage</span>
                </div>
                <BadgeRank rank="Galactic Sage" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">751-1000 points</p>
              <p className="text-xs text-neutral-600">Your knowledge transcends ordinary understanding. Students seek out your materials specifically.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Cosmic Intellect" size="sm" className="mr-2" />
                  <span className="font-semibold">Cosmic Intellect</span>
                </div>
                <BadgeRank rank="Cosmic Intellect" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">1001-1500 points</p>
              <p className="text-xs text-neutral-600">Your contributions have universal appeal. Few can match your dedication to academic excellence.</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Eternal Guardian" size="sm" className="mr-2" />
                  <span className="font-semibold">Eternal Guardian</span>
                </div>
                <BadgeRank rank="Eternal Guardian" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">1501-2500 points</p>
              <p className="text-xs text-neutral-600">A protector of knowledge, preserving wisdom for generations of students to come.</p>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-lg border border-rose-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Phoenix Prodigy" size="sm" className="mr-2" />
                  <span className="font-semibold">Phoenix Prodigy</span>
                </div>
                <BadgeRank rank="Phoenix Prodigy" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">2501-4000 points</p>
              <p className="text-xs text-neutral-600">Rising from academic challenges with brilliant insights that ignite others' understanding.</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 col-span-1 sm:col-span-2 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <ProfileBadge rank="Celestial Champion" size="sm" className="mr-2 shine" />
                  <span className="font-semibold">Celestial Champion</span>
                </div>
                <BadgeRank rank="Celestial Champion" showIcon={true} className="text-xs" />
              </div>
              <p className="text-sm font-medium text-neutral-700 mb-2">4001+ points</p>
              <p className="text-xs text-neutral-600">The pinnacle of academic sharing. Your contributions have transformed the learning experience for countless students. An inspiration to all Stratizens.</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-500 mb-4">
              Continue sharing quality academic materials to earn points and climb the ranks!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <DialogClose asChild>
                <Button className="scale-on-hover">
                  <Trophy className="mr-2 h-4 w-4" />
                  Start Earning
                </Button>
              </DialogClose>
              <Button 
                variant="outline" 
                className="scale-on-hover" 
                onClick={() => {
                  setShowRanksDialog(false);
                  setLocation('/badge-demo');
                }}
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                See Badge Animations
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Quote Editor Dialog */}
      {user?.isAdmin && (
        <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center">
                  <Quote className="text-primary mr-2" size={18} />
                  <span className="text-gradient-blue">Update Motivational Quote</span>
                </div>
              </DialogTitle>
              <DialogDescription>
                Set an inspirational message to motivate all Stratizens on their dashboard.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1 text-primary" />
                  New Motivational Quote
                </label>
                <Textarea
                  value={adminQuote}
                  onChange={(e) => setAdminQuote(e.target.value)}
                  className="min-h-[120px] resize-none shadow-sm"
                  placeholder="Enter an inspirational quote to encourage knowledge sharing..."
                  maxLength={150}
                />
                <div className="text-xs text-neutral-500 flex justify-between">
                  <span>This quote will appear on every user's dashboard.</span>
                  <span>{adminQuote.length}/150</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setQuoteModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Quote Updated Successfully",
                      description: "The motivational quote has been updated for all Stratizens.",
                      variant: "default",
                    });
                    setQuoteModalOpen(false);
                  }}
                  className="scale-on-hover"
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  Update Quote
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}
