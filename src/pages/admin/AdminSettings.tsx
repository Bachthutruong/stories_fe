import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useState, useEffect } from 'react';
import { Save, Settings, FileText, MessageSquare, Bell } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminFetch } from '../../lib/utils';

interface SiteSettings {
  postCreationConfirmation: {
    title: string;
    message: string;
    buttonText: string;
  };
  termsAndConditions: {
    title: string;
    content: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  siteInfo: {
    name: string;
    description: string;
    footerText: string;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    postCreationConfirmation: {
      title: '夢想卡上傳成功',
      message: '感謝您分享您的夢想！您的夢想卡已成功上傳並等待審核。',
      buttonText: '確定'
    },
    termsAndConditions: {
      title: '使用條款與隱私政策',
      content: '請仔細閱讀以下條款...'
    },
    contactInfo: {
      email: 'contact@example.com',
      phone: '+886 912 345 678',
      address: '台北市信義區信義路五段7號'
    },
    siteInfo: {
      name: '希望夢想牆',
      description: '分享您的夢想，讓世界看見希望',
      footerText: '© 2025 希望夢想牆. All rights reserved.'
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSettings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await adminFetch('https://stories-be.onrender.com/api/settings/admin');
      return res.json();
    },
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SiteSettings) => {
      const res = await adminFetch('https://stories-be.onrender.com/api/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update settings');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({ title: '成功', description: '設定已更新' });
    },
    onError: (error: any) => {
      toast({ 
        title: '錯誤', 
        description: error.message || '更新設定失敗', 
        variant: 'destructive' 
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm sm:text-lg">正在載入設定...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">系統設定</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">管理網站設定和配置</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateSettingsMutation.isPending ? '儲存中...' : '儲存設定'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">一般設定</TabsTrigger>
          <TabsTrigger value="confirmation">確認訊息</TabsTrigger>
          <TabsTrigger value="terms">條款政策</TabsTrigger>
          <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                網站資訊
              </CardTitle>
              <CardDescription>
                設定網站的基本資訊
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">網站名稱</Label>
                <Input
                  id="siteName"
                  value={settings.siteInfo.name}
                  onChange={(e) => setSettings({
                    ...settings,
                    siteInfo: { ...settings.siteInfo, name: e.target.value }
                  })}
                  placeholder="輸入網站名稱"
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">網站描述</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteInfo.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    siteInfo: { ...settings.siteInfo, description: e.target.value }
                  })}
                  placeholder="輸入網站描述"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="footerText">頁尾文字</Label>
                <Input
                  id="footerText"
                  value={settings.siteInfo.footerText}
                  onChange={(e) => setSettings({
                    ...settings,
                    siteInfo: { ...settings.siteInfo, footerText: e.target.value }
                  })}
                  placeholder="輸入頁尾文字"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                貼文建立確認
              </CardTitle>
              <CardDescription>
                設定用戶建立貼文後顯示的確認訊息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="confirmationTitle">確認標題</Label>
                <Input
                  id="confirmationTitle"
                  value={settings.postCreationConfirmation.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    postCreationConfirmation: { 
                      ...settings.postCreationConfirmation, 
                      title: e.target.value 
                    }
                  })}
                  placeholder="輸入確認標題"
                />
              </div>
              <div>
                <Label htmlFor="confirmationMessage">確認訊息</Label>
                <Textarea
                  id="confirmationMessage"
                  value={settings.postCreationConfirmation.message}
                  onChange={(e) => setSettings({
                    ...settings,
                    postCreationConfirmation: { 
                      ...settings.postCreationConfirmation, 
                      message: e.target.value 
                    }
                  })}
                  placeholder="輸入確認訊息"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="confirmationButton">按鈕文字</Label>
                <Input
                  id="confirmationButton"
                  value={settings.postCreationConfirmation.buttonText}
                  onChange={(e) => setSettings({
                    ...settings,
                    postCreationConfirmation: { 
                      ...settings.postCreationConfirmation, 
                      buttonText: e.target.value 
                    }
                  })}
                  placeholder="輸入按鈕文字"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                使用條款與隱私政策
              </CardTitle>
              <CardDescription>
                設定網站的使用條款和隱私政策內容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="termsTitle">條款標題</Label>
                <Input
                  id="termsTitle"
                  value={settings.termsAndConditions.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    termsAndConditions: { 
                      ...settings.termsAndConditions, 
                      title: e.target.value 
                    }
                  })}
                  placeholder="輸入條款標題"
                />
              </div>
              <div>
                <Label htmlFor="termsContent">條款內容</Label>
                <Textarea
                  id="termsContent"
                  value={settings.termsAndConditions.content}
                  onChange={(e) => setSettings({
                    ...settings,
                    termsAndConditions: { 
                      ...settings.termsAndConditions, 
                      content: e.target.value 
                    }
                  })}
                  placeholder="輸入條款內容"
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                聯絡資訊
              </CardTitle>
              <CardDescription>
                設定網站的聯絡資訊
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">電子郵件</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactInfo.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    contactInfo: { ...settings.contactInfo, email: e.target.value }
                  })}
                  placeholder="輸入聯絡電子郵件"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">電話號碼</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={settings.contactInfo.phone}
                  onChange={(e) => setSettings({
                    ...settings,
                    contactInfo: { ...settings.contactInfo, phone: e.target.value }
                  })}
                  placeholder="輸入聯絡電話"
                />
              </div>
              <div>
                <Label htmlFor="contactAddress">地址</Label>
                <Textarea
                  id="contactAddress"
                  value={settings.contactInfo.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    contactInfo: { ...settings.contactInfo, address: e.target.value }
                  })}
                  placeholder="輸入聯絡地址"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 