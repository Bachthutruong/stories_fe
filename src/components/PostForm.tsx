"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import ImageUploadPlaceholder from './ImageUploadPlaceholder';
import { useState } from 'react';
import TermsDialog from './TermsDialog';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';

const postSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  content: z.string().min(20, "Content must be at least 20 characters").max(5000),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  post?: any; // For editing
  onSubmitSuccess?: (postId: string) => void; // Callback after successful submission
}

const PostForm: React.FC<PostFormProps> = ({ post, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [formDataForSubmission, setFormDataForSubmission] = useState<PostFormData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: post ? {
      title: post.title,
      description: post.description,
      content: post.content || '',
    } : {
      title: '',
      description: '',
      content: '',
    },
  });

  const handleImageFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const processSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    
    if (!user?.user) {
      toast({ 
        title: "Authentication Required", 
        description: "Please login to create a post.", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Upload images to Cloudinary
      const images = imageFiles.map((_file, index) => ({ 
        url: `https://placehold.co/600x400.png?text=Uploaded+${index+1}`, 
        public_id: `mock_${Date.now()}_${index}` 
      }));

      const postData = {
        title: data.title,
        description: data.description,
        content: data.content,
        images: images,
      };

      const url = post ? `https://stories-be.onrender.com/api/posts/${post._id}` : 'https://stories-be.onrender.com/api/posts';
      const method = post ? 'PUT' : 'POST';
      
      const token = user.token;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit post');
      }

      const result = await response.json();
      
      toast({ 
        title: post ? "Post Updated" : "Post Created", 
        description: `Your post "${data.title}" has been successfully ${post ? 'updated' : 'submitted'}.` 
      });
      
      setIsSubmitting(false);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result._id);
      } else {
        navigate('/posts');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      toast({ 
        title: "Error", 
        description: "Failed to submit post. Please try again.", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
    }
  };

  const onFormSubmit: SubmitHandler<PostFormData> = (data) => {
    if (post) { // Editing existing post, no terms dialog
      processSubmit(data);
    } else { // Creating new post
      setFormDataForSubmission(data);
      setIsTermsDialogOpen(true);
    }
  };

  const handleAgreeToTerms = () => {
    if (formDataForSubmission) {
      processSubmit(formDataForSubmission);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8 max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-headline text-center mb-6">{post ? 'Edit Your Story' : 'Share Your Story'}</h1>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Enter your story title..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormItem>
            <FormLabel>Upload Image(s)</FormLabel>
            <ImageUploadPlaceholder 
              onFilesChange={handleImageFilesChange} 
              maxFiles={5}
              existingImages={post?.images}
            />
          </FormItem>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Brief description of your story..." {...field} rows={3} /></FormControl>
                <FormDescription>Short summary of your story.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl><Textarea placeholder="Tell us about your story, moment, or event..." {...field} rows={8} /></FormControl>
                <FormDescription>Share the details that make your story special.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (post ? 'Updating...' : 'Submitting...') : (post ? 'Update Post' : 'Submit Post')}
          </Button>
        </form>
      </Form>
      {!post && ( // Only show terms dialog for new posts
        <TermsDialog 
          isOpen={isTermsDialogOpen} 
          onOpenChange={setIsTermsDialogOpen}
          onAgree={handleAgreeToTerms}
        />
      )}
    </>
  );
};

export default PostForm;