import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  School,
  BookOpen,
  LayoutDashboard,
  User,
  LogOut
} from "lucide-react";
import { BadgeRank } from "@/components/ui/badge-rank";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [userInitials, setUserInitials] = useState("UN");

  const { data: units = [] } = useQuery({
    queryKey: ["/api/units"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  useEffect(() => {
    if (user?.username) {
      // Extract initials from username
      const initials = user.username
        .split(/\s+/)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      setUserInitials(initials);
    }
  }, [user]);

  const [, setLocation] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Redirect to landing page after logout
        setLocation("/");
      }
    });
  };

  return (
    <aside className="w-64 bg-primary text-white fixed h-screen z-10">
      <div className="p-4 border-b border-primary-800 flex items-center">
        <div className="flex items-center bg-white text-primary p-1 rounded-lg mr-2">
          <School size={20} />
        </div>
        <h1 className="font-bold text-xl">Stratizens</h1>
      </div>
      
      <ScrollArea className="h-[calc(100vh-64px)]">
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard">
                <a className={cn(
                  "flex items-center p-3 rounded-lg hover:bg-primary-800 transition-colors",
                  location === "/dashboard" && "bg-primary-800"
                )}>
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </a>
              </Link>
            </li>
            
            {/* Units */}
            {units.map((unit: any) => (
              <li key={unit.id}>
                <Link href={`/unit/${unit.id}`}>
                  <a className={cn(
                    "flex items-center p-3 rounded-lg hover:bg-primary-800 transition-colors",
                    location === `/unit/${unit.id}` && "bg-primary-800"
                  )}>
                    <BookOpen className="mr-3 h-5 w-5" />
                    {unit.code}: {unit.name}
                  </a>
                </Link>
              </li>
            ))}
            
            <li>
              <Link href="/profile">
                <a className={cn(
                  "flex items-center p-3 rounded-lg hover:bg-primary-800 transition-colors",
                  location === "/profile" && "bg-primary-800"
                )}>
                  <User className="mr-3 h-5 w-5" />
                  My Profile
                </a>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* User Profile Section in Sidebar */}
        <div className="p-4 mt-4 border-t border-primary-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden mr-3 flex items-center justify-center">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-semibold text-primary">{userInitials}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{user?.username}</h3>
              <p className="text-xs opacity-80">{user?.admissionNumber}</p>
            </div>
          </div>
          
          <div className="mt-4 bg-primary-800 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold">Current Rank:</span>
              {userStats?.badge && (
                <BadgeRank rank={userStats.badge} className="text-xs" />
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">Points:</span>
              <span className="text-xs">{userStats?.totalPoints || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-primary-800">
          <button 
            className="w-full flex items-center justify-center p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </ScrollArea>
    </aside>
  );
}
