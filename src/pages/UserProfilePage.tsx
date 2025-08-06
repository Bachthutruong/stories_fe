import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';

interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface Post {
  _id: string;
  postId?: string;
  title: string;
  description: string;
  images?: { url: string; public_id: string }[];
  likes: number;
  shares: number;
  commentsCount: number;
  createdAt: string;
}

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
  </Card>
);

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`https://stories-be.onrender.com/api/users/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      return res.json();
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      const res = await fetch(`https://stories-be.onrender.com/api/users/${userId}/posts`);
      if (!res.ok) {
        throw new Error('Failed to fetch user posts');
      }
      return res.json();
    },
  });

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-6 sm:h-8 w-1/2" />
            <Skeleton className="h-3 sm:h-4 w-3/4" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-3 sm:h-4 w-full mb-2" />
            <Skeleton className="h-3 sm:h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Card className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{user.name}</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {user.email && `${user.email} • `}{user.phoneNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <p className="text-sm sm:text-base">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p className="text-sm sm:text-base">Role: {user.role}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="posts" className="text-sm sm:text-base">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {postsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
              {Array.from({ length: 6 }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center auto-rows-fr">
              {posts?.map((post) => (
                <Card key={post._id} className="w-full shadow-lg border-none">
                  <CardHeader className="p-3 sm:p-4">
                    <CardTitle className="text-sm sm:text-lg truncate">{post.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    {post.images && post.images.length > 0 && (
                      <div className="relative w-full h-32 sm:h-48 mb-3 sm:mb-4 rounded-md overflow-hidden">
                        <img
                          src={post.images[0].url}
                          alt={post.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600">
                      {post.description.length > 80 
                        ? `${post.description.substring(0, 80)}...` 
                        : post.description}
                    </p>
                    <div className="flex items-center space-x-2 sm:space-x-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
                      <span>❤️ {post.likes}</span>
                      <span>📤 {post.shares}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 