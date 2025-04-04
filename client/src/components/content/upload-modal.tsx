import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { contentTypes } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

// Form schema for content upload
const uploadFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().refine(val => Object.values(contentTypes).includes(val as any), {
    message: "Please select a valid content type",
  }),
  unitId: z.coerce.number({
    required_error: "Please select a unit",
    invalid_type_error: "Unit ID must be a number",
  }),
  file: z.instanceof(File, { message: "Please upload a file" }).optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId?: number;
  unitName?: string;
  contentType?: string;
}

export default function UploadModal({ 
  open, 
  onOpenChange, 
  unitId,
  unitName,
  contentType,
}: UploadModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Initialize form with default values
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: contentType || "",
      unitId: unitId || 0,
      dueDate: "",
      dueTime: "",
    },
  });
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/contents", data, {
        isFormData: true,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload content");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (unitId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/units", unitId, "contents"],
        });
      }
      
      // Show success message
      toast({
        title: "Upload successful",
        description: "Your content has been uploaded successfully!",
      });
      
      // Close modal and reset form
      onOpenChange(false);
      form.reset();
      setSelectedFile(null);
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      // Show error message
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: UploadFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add file if exists
      if (data.file) {
        formData.append("file", data.file);
      }
      
      // Add other data as JSON string
      const contentData = {
        title: data.title,
        description: data.description,
        type: data.type,
        unitId: data.unitId,
        dueDate: data.type === contentTypes.ASSIGNMENT && data.dueDate && data.dueTime 
          ? new Date(`${data.dueDate}T${data.dueTime}`).toISOString()
          : null,
      };
      
      formData.append("data", JSON.stringify(contentData));
      
      // Submit form
      await uploadMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Upload error:", error);
      setIsSubmitting(false);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("file", file, { shouldValidate: true });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload {contentType?.toLowerCase().replace('_', ' ')}
          </DialogTitle>
          <DialogDescription>
            {unitName 
              ? `Upload learning materials for ${unitName}`
              : "Upload learning materials to share with your classmates"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter content title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the content (what is it about, why is it useful, etc.)" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {contentType !== contentTypes.ASSIGNMENT && (
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => {
                          handleFileChange(e);
                          onChange(e);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {contentType === contentTypes.ASSIGNMENT && (
              <>
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>File (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            handleFileChange(e);
                            onChange(e);
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}