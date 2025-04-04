import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BadgeRank } from "@/components/ui/badge-rank";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Key, Calculator, Upload, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FormData {
  username: string;
  admissionNumber: string;
  profilePicture: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const formData: FormData = {
    username: user?.username || "",
    admissionNumber: user?.admissionNumber || "",
    profilePicture: user?.profilePicture || null,
  };
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  // Update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/user", data);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(e.target.files[0]);
      // Simplified handling - in a real app, you'd upload the file
      // Here we just use the filename as a placeholder
      setFormData({
        ...formData,
        profilePicture: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      });
      return;
    }

    // Only include changed fields
    const updateData: any = {};
    if (formData.username !== user?.username) updateData.username = formData.username;
    if (formData.admissionNumber !== user?.admissionNumber) updateData.admissionNumber = formData.admissionNumber;
    if (formData.password) updateData.password = formData.password;
    if (formData.pin !== user?.pin) updateData.pin = formData.pin;
    if (formData.profilePicture !== user?.profilePicture) updateData.profilePicture = formData.profilePicture;

    if (Object.keys(updateData).length > 0) {
      updateProfileMutation.mutate(updateData);
    } else {
      toast({
        title: "No changes",
        description: "No changes were made to your profile.",
      });
      setIsEditing(false);
    }
  };

  // Calculate points needed for next rank
  const getNextRank = () => {
    const points = userStats?.totalPoints || 0;
    
    if (points < 100) return { rank: "Contributor", required: 101, current: points };
    if (points < 250) return { rank: "Expert", required: 251, current: points };
    if (points < 500) return { rank: "Master", required: 501, current: points };
    if (points < 1000) return { rank: "Guru", required: 1001, current: points };
    
    return { rank: "Guru", required: 1000, current: points };
  };

  const nextRank = getNextRank();
  const progressPercentage = Math.min(100, (nextRank.current / nextRank.required) * 100);

  return (
    <MainLayout>
      <header className="mb-8">
        <h1 className="font-bold text-3xl text-neutral-800">My Profile</h1>
        <p className="text-neutral-600">Manage your account settings and view your progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center">
                      {formData.profilePicture ? (
                        <img 
                          src={formData.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={32} className="text-neutral-500" />
                      )}
                    </div>
                    <Label 
                      htmlFor="profile-picture" 
                      className="cursor-pointer bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center"
                    >
                      <Upload size={16} className="mr-2" />
                      Change Photo
                      <Input 
                        id="profile-picture" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Full Name</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admissionNumber">Admission Number</Label>
                      <Input
                        id="admissionNumber"
                        name="admissionNumber"
                        value={formData.admissionNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your admission number"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">New Password</Label>
                        <Input 
                          id="password" 
                          name="password" 
                          type="password" 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          placeholder="Confirm new password"
                          disabled={!formData.password}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="pin">4-Digit PIN (Quick Access)</Label>
                      <Input 
                        id="pin" 
                        name="pin" 
                        type="password" 
                        value={formData.pin} 
                        onChange={handleInputChange} 
                        maxLength={4}
                        placeholder="Enter your 4-digit PIN"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <span className="flex items-center">
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center">
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={32} className="text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user?.username}</h3>
                      <p className="text-neutral-500 text-sm">{user?.admissionNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-sm text-neutral-500">Full Name</p>
                      <p>{user?.username}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-500">Admission Number</p>
                      <p>{user?.admissionNumber}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity & Achievements */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Activity & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Current Rank</h3>
                    {userStats?.badge && (
                      <BadgeRank rank={userStats.badge} />
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500 mb-2">
                    <span>{userStats?.totalPoints || 0} points</span>
                    <span>Next: {nextRank.rank} ({nextRank.required} points)</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Contribution Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Assignments</span>
                        <span>{userStats?.contributionBreakdown?.assignments || 0}</span>
                      </div>
                      <Progress 
                        value={userStats?.contributionBreakdown?.assignments ? 100 : 0} 
                        className="h-1.5" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Notes</span>
                        <span>{userStats?.contributionBreakdown?.notes || 0}</span>
                      </div>
                      <Progress 
                        value={userStats?.contributionBreakdown?.notes ? 100 : 0} 
                        className="h-1.5"
                        indicatorClassName="bg-green-600" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Past Papers</span>
                        <span>{userStats?.contributionBreakdown?.pastPapers || 0}</span>
                      </div>
                      <Progress 
                        value={userStats?.contributionBreakdown?.pastPapers ? 100 : 0} 
                        className="h-1.5"
                        indicatorClassName="bg-orange-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Points</span>
                      <span className="font-semibold">{userStats?.totalPoints || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Rank</span>
                      <span className="font-semibold">#{userStats?.rank || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Contributions</span>
                      <span className="font-semibold">{userStats?.totalContributions || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
