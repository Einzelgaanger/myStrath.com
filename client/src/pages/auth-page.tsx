import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, BookOpen, Award, Shield } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMutation.isPending) return;

    try {
      await loginMutation.mutateAsync({
        admissionNumber,
        password,
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerMutation.isPending) return;
    
    // Input validation
    if (registerPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    if (registerPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    
    try {
      await registerMutation.mutateAsync({
        username,
        password: registerPassword,
        admissionNumber,
      });
      
      // Note: No need to manually login after registration
      // The registerMutation already sets the user in the auth context
      
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-lg border-primary/20">
          <div className="md:grid md:grid-cols-5">
            {/* Left side - Auth Form */}
            <div className="md:col-span-3 p-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-gradient-blue">Welcome to Stratizens</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Please log in with your admission number and password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admissionNumber">Admission Number</Label>
                        <Input
                          id="admissionNumber"
                          type="text"
                          value={admissionNumber}
                          onChange={(e) => setAdmissionNumber(e.target.value)}
                          placeholder="Enter your admission number"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>

                      {loginMutation.isError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            {loginMutation.error.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="registerUsername">Username</Label>
                        <Input
                          id="registerUsername"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="registerAdmissionNumber">Admission Number</Label>
                        <Input
                          id="registerAdmissionNumber"
                          type="text"
                          value={admissionNumber}
                          onChange={(e) => setAdmissionNumber(e.target.value)}
                          placeholder="Enter your admission number"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Password</Label>
                        <Input
                          id="registerPassword"
                          type="password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Create a password (min 8 characters)"
                          minLength={8}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Registering..." : "Register"}
                      </Button>
                      
                      {registerMutation.isError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            {registerMutation.error.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
            
            {/* Right side - Hero Section */}
            <div className="md:col-span-2 bg-gradient-to-br from-primary/80 to-primary/90 text-white p-6 rounded-r-lg hidden md:flex md:flex-col md:justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
                
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-bold mb-4">Academic Excellence Reimagined</h2>
                <p className="opacity-90 mb-6">
                  Join Stratizens to connect with fellow students, share academic resources, and elevate your learning journey through our collaborative platform.
                </p>
                  
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Resource Sharing</h3>
                      <p className="text-sm opacity-80">Access and contribute to a growing repository of study materials.</p>
                    </div>
                  </div>
                      
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Achievement System</h3>
                      <p className="text-sm opacity-80">Earn points and badges as you contribute to the community.</p>
                    </div>
                  </div>
                      
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Secure Environment</h3>
                      <p className="text-sm opacity-80">Multi-layered security to protect your academic data.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}