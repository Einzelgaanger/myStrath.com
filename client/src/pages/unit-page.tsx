import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ChevronDown, 
  Plus,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import ContentCard from "@/components/content/content-card";
import UploadModal from "@/components/content/upload-modal";
import { CommentsModal } from "@/components/content/comments-modal";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { contentTypes, Content, Unit } from "@shared/schema";

export default function UnitPage() {
  const { unitId } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(contentTypes.ASSIGNMENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [commentsModalContent, setCommentsModalContent] = useState<Content | null>(null);

  // Fetch unit details
  const { data: unit, isLoading: unitLoading } = useQuery<Unit>({
    queryKey: [`/api/units/${unitId}`],
    enabled: !!unitId,
  });

  // Fetch contents based on active tab
  const { data: contents = [], isLoading: contentsLoading } = useQuery<Content[]>({
    queryKey: [`/api/contents`, { unitId, type: activeTab }],
    enabled: !!unitId,
  });

  // Filter and sort contents
  const filteredContents = contents.filter((content) => {
    return content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           content.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedContents = [...filteredContents].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    } else if (sortBy === "dueDate") {
      // If no due date, put at the end
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === "mostLiked") {
      return b.likes - a.likes;
    }
    return 0;
  });

  // Content mutations
  const likeMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const res = await fetch(`/api/contents/${contentId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contents`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const res = await fetch(`/api/contents/${contentId}/dislike`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contents`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const res = await fetch(`/api/contents/${contentId}/complete`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/contents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/stats`] });
      toast({
        title: "Assignment Completed",
        description: `You've earned ${data.pointsAwarded > 0 ? data.pointsAwarded : 0} points.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery("");
  };

  // Handle content actions
  const handleLike = (contentId: number) => {
    likeMutation.mutate(contentId);
  };

  const handleDislike = (contentId: number) => {
    dislikeMutation.mutate(contentId);
  };

  const handleComplete = (contentId: number) => {
    completeMutation.mutate(contentId);
  };

  const handleViewComments = (content: Content) => {
    setCommentsModalContent(content);
  };

  const closeCommentsModal = (open: boolean) => {
    if (!open) {
      setCommentsModalContent(null);
    }
  };

  return (
    <MainLayout>
      <header className="mb-8">
        <h1 className="font-bold text-3xl text-neutral-800">
          {unitLoading ? "Loading..." : `${unit?.code}: ${unit?.name}`}
        </h1>
        <p className="text-neutral-600">Access and share materials for this unit.</p>
      </header>
      
      {/* Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="mb-6 border-b border-neutral-200">
          <TabsList className="bg-transparent border-b border-neutral-200">
            <TabsTrigger 
              value={contentTypes.ASSIGNMENT} 
              className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Assignments
            </TabsTrigger>
            <TabsTrigger 
              value={contentTypes.NOTE} 
              className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger 
              value={contentTypes.PAST_PAPER} 
              className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              Past Papers
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="w-full md:w-64">
            <div className="relative">
              <Input
                placeholder={`Search ${activeTab}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg" 
              />
              <Search className="absolute left-3 top-2.5 text-neutral-400 h-4 w-4" />
            </div>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="py-2 px-4 border border-neutral-200 rounded-lg w-full md:w-auto">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Sort by latest</SelectItem>
              {activeTab === contentTypes.ASSIGNMENT && 
                <SelectItem value="dueDate">Sort by due date</SelectItem>
              }
              <SelectItem value="mostLiked">Sort by most liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Content Tabs */}
        <TabsContent value={activeTab} className="mt-0">
          {contentsLoading ? (
            <div className="text-center py-12">
              <p>Loading {activeTab}s...</p>
            </div>
          ) : sortedContents.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
              <p className="text-neutral-500">No {activeTab}s found</p>
              <Button 
                variant="outline"
                className="mt-4"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Plus size={16} className="mr-2" />
                Upload your first {activeTab}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sortedContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  contentType={activeTab}
                  onLike={() => handleLike(content.id)}
                  onDislike={() => handleDislike(content.id)}
                  onComplete={() => handleComplete(content.id)}
                  onViewComments={() => handleViewComments(content)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Floating Upload Button */}
      <Button 
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={() => setIsUploadModalOpen(true)}
      >
        <Plus size={20} />
      </Button>
      
      {/* Upload Modal */}
      <UploadModal 
        open={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen}
        unitId={Number(unitId)}
        unitName={unit?.name}
        contentType={activeTab}
      />
      
      {/* Comments Modal */}
      {commentsModalContent && (
        <CommentsModal 
          contentId={commentsModalContent.id}
          contentTitle={commentsModalContent.title}
          isOpen={!!commentsModalContent}
          onOpenChange={closeCommentsModal}
        />
      )}
    </MainLayout>
  );
}
