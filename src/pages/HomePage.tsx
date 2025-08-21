import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { LikeButton } from '../components/LikeButton';
import { ShareButton } from '../components/ui/share-button';
import { useAuth } from '../components/providers/AuthProvider';
import { useToast } from '../hooks/use-toast';
import { generatePostLuckyNumber } from '../hooks/useLuckyNumber';

interface Post {
    _id: string;
    postId?: string; // Make postId optional
    title: string;
    description: string;
    content?: string; // Add content field for API compatibility
    images?: { url: string; public_id: string }[];
    likes: number;
    shares: number;
    commentsCount: number;
    isFeatured: boolean;
    isHidden: boolean;
    userId?: {
        name: string;
        phoneNumber: string;
        email: string;
    };
    createdAt: string;
}

interface HomePageData {
    featuredPosts: Post[];
    topLikedPosts: Post[];
    topSharedPosts: Post[];
    topCommentedPosts: Post[];
}

// Skeleton component for loading states
const PostCardSkeleton = () => (
    <Card className="w-full max-w-sm shadow-lg border-none animate-pulse h-full flex flex-col relative">
        <CardHeader className="p-3 sm:p-4">
            <Skeleton className="h-5 sm:h-6 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex-grow p-3 sm:p-4">
            <Skeleton className="w-full h-32 sm:h-48 mb-3 sm:mb-4 rounded-md" />
            <Skeleton className="h-3 sm:h-4 w-full mb-2" />
            <Skeleton className="h-3 sm:h-4 w-2/3" />
        </CardContent>
        <CardFooter className="flex justify-between items-center p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
                <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
                <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
                <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
            </div>
        </CardFooter>
    </Card>
);

const HomePageContent = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const { data, isLoading, error } = useQuery<HomePageData, Error>({
        queryKey: ['homepageData'],
        queryFn: async () => {
            const res = await fetch('https://stories-be.onrender.com/api/home', {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            if (!res.ok) {
                throw new Error('Failed to fetch homepage data');
            }
            return res.json();
        },
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const handleShareClick = async (postId: string) => {
        try {
            // Only update share count if user is logged in
            if (user?.user) {
                const token = user.token;
                const res = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/share`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Failed to update share count');
                }
                const result = await res.json();
                toast({
                    title: '分享成功！',
                    description: result.message,
                });
            } else {
                // Still show success message even if not logged in
                toast({
                    title: '分享成功！',
                    description: '貼文已成功分享',
                });
            }
        } catch (error) {
            console.error('Share error:', error);
            toast({
                title: '錯誤',
                description: '更新分享次數失敗',
                variant: 'destructive',
            });
        }
    };

    const renderPostCard = (post: Post) => {
        const luckyNumber = post.postId ? generatePostLuckyNumber(post.postId) : '000';
        
        return (
            <Link key={post._id} to={`/posts/${post._id}`} className="block">
                <Card className="w-full max-w-sm shadow-lg border-none hover:shadow-xl transition-shadow duration-300 h-full flex flex-col relative">
                    <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 mb-1">
                                    {post.title}
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm line-clamp-2">
                                    {post.description}
                                </CardDescription>
                            </div>
                            <div className="ml-2 text-xs sm:text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {luckyNumber}
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow p-3 sm:p-4">
                        {post.images && post.images.length > 0 && (
                            <div className="mb-3 sm:mb-4">
                                <img 
                                    src={post.images[0].url} 
                                    alt={post.title}
                                    className="w-full h-32 sm:h-48 object-cover rounded-md"
                                />
                            </div>
                        )}
                                    <div className="text-xs sm:text-sm text-muted-foreground">
              <p>作者: {post.userId?.name || '匿名'}</p>
              <p>電話: {post.userId?.phoneNumber || '未提供'}</p>
            </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div onClick={(e) => e.stopPropagation()}>
                                <LikeButton 
                                    postId={post._id} 
                                    initialLikes={post.likes} 
                                    isInitiallyLiked={false}
                                />
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <ShareButton 
                                    url={`/posts/${post._id}`}
                                    title={post.title}
                                    description={post.description}
                                    variant="ghost"
                                    size="sm"
                                    showText={false}
                                    onShare={() => handleShareClick(post._id)}
                                />
                            </div>
                            <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-0.5 sm:space-x-1">
                                <Button variant="ghost" size="sm" className="flex items-center space-x-0.5 sm:space-x-1 text-muted-foreground p-1 sm:p-2">
                                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm">{post.commentsCount}</span>
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        );
    };

    const renderSkeletonGrid = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
            {Array.from({ length: 6 }).map((_, index) => (
                <PostCardSkeleton key={index} />
            ))}
        </div>
    );

    if (error) {
        return <div className="container mx-auto px-4 py-8 text-center text-red-500">錯誤: {error.message}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">歡迎來到希望夢想牆</h1>

            <section className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">精選夢想卡</h2>
                {isLoading ? (
                    renderSkeletonGrid()
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
                        {data?.featuredPosts?.map(renderPostCard)}
                    </div>
                )}
            </section>

            <section>
                <Tabs defaultValue="likes" className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                        <TabsTrigger value="likes" className="text-xs sm:text-sm">按讚最多</TabsTrigger>
                        <TabsTrigger value="shares" className="text-xs sm:text-sm">分享最多</TabsTrigger>
                        <TabsTrigger value="comments" className="text-xs sm:text-sm">評論最多</TabsTrigger>
                    </TabsList>
                    <TabsContent value="likes">
                        {isLoading ? (
                            renderSkeletonGrid()
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-4 justify-items-center auto-rows-fr">
                                {data?.topLikedPosts?.map(renderPostCard)}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="shares">
                        {isLoading ? (
                            renderSkeletonGrid()
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-4 justify-items-center auto-rows-fr">
                                {data?.topSharedPosts?.map(renderPostCard)}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="comments">
                        {isLoading ? (
                            renderSkeletonGrid()
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-4 justify-items-center auto-rows-fr">
                                {data?.topCommentedPosts?.map(renderPostCard)}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </section>
        </div>
    );
};

export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">歡迎來到希望夢想牆</h1>
                <section className="mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">精選夢想卡</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <PostCardSkeleton key={index} />
                        ))}
                    </div>
                </section>
            </div>
        }>
            <HomePageContent />
        </Suspense>
    );
} 