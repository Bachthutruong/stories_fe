import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import ImageUploadPlaceholder from '../components/ImageUploadPlaceholder';
import TermsDialog from '../components/TermsDialog';
import CreatePostBanner from '../components/CreatePostBanner';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/providers/AuthProvider';
import { Upload } from 'lucide-react';
import uploadService from '../lib/uploadService';
import type { UploadedImage } from '../lib/uploadService';

const postSchema = z.object({
  title: z.string().min(2, "標題至少需要2個字符").max(100, "標題不能超過100個字符"),
  content: z.string().min(20, "內容至少需要20個字符").max(5000, "內容不能超過5000個字符"),
  contactName: z.string().min(1, "請輸入如何稱呼").max(50, "稱呼不能超過50個字符"),
  phone: z.string().min(1, "請輸入電話號碼").max(20, "電話號碼不能超過20個字符"),
  email: z.string().email("請輸入有效的信箱地址").max(100, "信箱地址不能超過100個字符"),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const { user, updateUserFromStorage } = useAuth();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [formDataForSubmission, setFormDataForSubmission] = useState<PostFormData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      contactName: user?.user?.name || '',
      phone: user?.user?.phoneNumber || '',
      email: user?.user?.email || '',
    },
  });

  // Update form values when user changes
  React.useEffect(() => {
    if (user?.user) {
      form.setValue('contactName', user.user.name || '');
      form.setValue('phone', user.user.phoneNumber || '');
      form.setValue('email', user.user.email || '');
    }
  }, [user, form]);

  const handleImageFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const uploadImagesToBackend = async (files: File[]): Promise<UploadedImage[]> => {
    setIsUploading(true);
    
    try {
      // Validate files first
      const validation = uploadService.validateFiles(files);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      toast({ 
        title: "上傳圖片中", 
        description: "正在上傳圖片到伺服器..." 
      });

      // Check if user is authenticated
      const isAuthenticated = !!user?.token || !!localStorage.getItem('hem-story-token');
      
      // Upload images through backend (use guest upload if not authenticated)
      const uploadedImages = await uploadService.uploadImages(files, isAuthenticated);
      
      toast({ 
        title: "圖片上傳成功", 
        description: `${uploadedImages.length} 張圖片已上傳到雲端` 
      });

      return uploadedImages;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const processSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    
    try {
      let currentUser = user;
      let token = user?.token || localStorage.getItem('hem-story-token');

      // If no user is logged in, we'll create an account with the form data
      if (!currentUser?.user) {
        // For now, we'll use the form data to create a temporary user
        // In a real app, you might want to create a proper user account
        currentUser = {
          token: token || '',
          user: {
            id: 'temp-user',
            name: data.contactName,
            phoneNumber: data.phone,
            email: data.email,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      }

      // Upload images if any
      let finalImages: UploadedImage[] = [];
      if (imageFiles.length > 0) {
        finalImages = await uploadImagesToBackend(imageFiles);
      }

      // Prepare the data to send
      const postData = {
        title: data.title,
        description: data.content,
        content: data.content,
        images: finalImages,
        contactInfo: {
          name: data.contactName,
          phoneNumber: data.phone,
          email: data.email,
        }
      };

      // Send the post data
      const response = await fetch('https://stories-be.onrender.com/api/posts/create-with-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '發布失敗');
      }

      const result = await response.json();

      // Update user data if we got a new token
      if (result.token && result.user) {
        localStorage.setItem('hem-story-token', result.token);
        localStorage.setItem('hem-story-user', JSON.stringify(result.user));
        updateUserFromStorage();
      }

      toast({
        title: "發布成功！",
        description: "您的夢想卡已成功發布",
      });

      // Navigate to the new post
      navigate(`/posts/${result.post._id}`);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "發布失敗",
        description: error instanceof Error ? error.message : "發布夢想卡時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit: SubmitHandler<PostFormData> = (data) => {
    setFormDataForSubmission(data);
    setIsTermsDialogOpen(true);
  };

  const handleAgreeToTerms = () => {
    if (formDataForSubmission) {
      processSubmit(formDataForSubmission);
    }
    setIsTermsDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
      <CreatePostBanner />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">分享您的夢想</h1>
        <p className="text-muted-foreground">
          上傳您的夢想卡，讓世界看見您的希望
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">夢想的照片（可上傳多張）</h3>
              <p className="text-sm text-muted-foreground mb-4">
              可以是一張手寫的小卡、店內某個角落的回憶、享用甜湯的時光，或是你想與卡友分享的溫暖畫面。
<span className="font-bold text-[#2596be]">讓夢想，不只是文字，也有屬於它的影像。</span>

              </p>
            </div>
            <ImageUploadPlaceholder
              onFilesChange={handleImageFilesChange}
              isUploading={isUploading}
            />
          </div>

          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>夢想的名字</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="夢想卡的名字就像一個小標籤，可以是目標、心願，或是一句你最想記住的話" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content Field */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>夢想的心聲</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="寫下心裡的故事，請留下你的一段夢想、回憶或期待的故事。
它不需要很長，因為最真誠的文字，總能打動人心..."
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">讓希望找到你            </h3>
            <p className="text-sm text-muted-foreground">
            我們需要一點小小資訊，好在幸運降臨時，第一時間能找到你
<span className="font-bold text-[#2596be]">你的資訊只會用於通知中獎，不會公開或做其他用途，請安心留下</span>

            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>你的名字，或一個暱稱                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="因為有名字，夢想才更像一份被珍藏的心意" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>聯繫你的電話號碼</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="只在你的夢想卡被抽中時，第一時間打給你分享喜訊" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>寄送希望的信箱                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="用來寄送中獎通知，或保存一份夢想卡紀錄，留給你收藏" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting || isUploading}
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  發布中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  發布夢想卡
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Terms Dialog */}
      <TermsDialog
        isOpen={isTermsDialogOpen}
        onOpenChange={setIsTermsDialogOpen}
        onAgree={handleAgreeToTerms}
      />
    </div>
  );
} 