"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from './providers/AuthProvider';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  name: z.string().min(2, "姓名必須至少有2個字符。").max(50, "姓名太長。"),
  phoneNumber: z.string().regex(/^\d{10,11}$/, "電話號碼無效（10-11位數字）。"),
});

const registerSchema = z.object({
  name: z.string().min(2, "姓名必須至少有2個字符。").max(50, "姓名太長。"),
  phoneNumber: z.string().regex(/^\d{10,11}$/, "電話號碼無效（10-11位數字）。"),
  email: z.string().email("電子郵件格式無效。").optional().or(z.literal("")),
});

type LoginFormSchema = z.infer<typeof loginSchema>;
type RegisterFormSchema = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  // const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  const registerForm = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
    },
  });

  const onLoginSubmit: SubmitHandler<LoginFormSchema> = async (data) => {
    setIsLoading(true);
    setRedirectPath(null);
    const loggedInUser = await login(data.name, data.phoneNumber);
    setIsLoading(false);

    if (loggedInUser) {
      toast({
        title: "登入成功！",
        description: `歡迎回來，${loggedInUser.user.name}！`,
      });
      
      if (loggedInUser?.user.role === 'admin') {
        setRedirectPath('/admin');
      } else {
        setRedirectPath('/');
      }
    } else {
      toast({
        title: "登入失敗",
        description: "姓名或電話號碼錯誤。請重試。",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit: SubmitHandler<RegisterFormSchema> = async (data) => {
    setIsLoading(true);
    setRedirectPath(null);
    const registeredUser = await register(data.name, data.phoneNumber, data.email || '');
    setIsLoading(false);

    if (registeredUser) {
      toast({
        title: "註冊成功！",
        description: `歡迎加入，${data.name}！`,
      });
      setRedirectPath('/');
    } else {
      toast({
        title: "註冊失敗",
        description: "電話號碼已存在或發生錯誤。請重試。",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [redirectPath, navigate]);

  if (redirectPath && !isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">正在轉向...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">登入成功。請稍候...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">帳戶管理</CardTitle>
        <CardDescription>
          登入或註冊新帳戶以開始分享您的夢想。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登入</TabsTrigger>
            <TabsTrigger value="register">註冊</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="李小明" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>電話號碼</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="0912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '處理中...' : '登入'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="李小明" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>電話號碼</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="0912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>電子郵件 (選填)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '處理中...' : '註冊'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        
        <p className="mt-4 text-center text-sm text-muted-foreground">
          登入即表示您同意我們的{' '}
          <Link to="/terms" className="underline hover:text-primary">
            服務條款
          </Link>。
        </p>
      </CardContent>
    </Card>
  );
}
