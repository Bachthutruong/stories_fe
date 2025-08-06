import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './components/providers/AuthProvider';
import SiteHeader from './components/SiteHeader';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostsPage from './pages/PostsPage';
import LoginPage from './pages/LoginPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import MyPostsPage from './pages/MyPostsPage';
import MyAccountPage from './pages/MyAccountPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts from './pages/admin/AdminPosts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminComments from './pages/admin/AdminComments';
import AdminReports from './pages/admin/AdminReports';
import AdminKeywords from './pages/admin/AdminKeywords';
import AdminLottery from './pages/admin/AdminLottery';
import AdminSettings from './pages/admin/AdminSettings';
import LotteryWinnersPage from './pages/LotteryWinnersPage';
import ApiTest from './components/ApiTest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create-post" element={<CreatePostPage />} />
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route path="/users/:userId" element={<UserProfilePage />} />
                <Route path="/my-posts" element={<MyPostsPage />} />
                <Route path="/my-account" element={<MyAccountPage />} />
                <Route path="/lottery-winners" element={<LotteryWinnersPage />} />
                <Route path="/api-test" element={<ApiTest />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="posts/:id" element={<AdminPosts />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/:id" element={<AdminUsers />} />
                  <Route path="comments" element={<AdminComments />} />
                  <Route path="comments/:id" element={<AdminComments />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="reports/:id" element={<AdminReports />} />
                  <Route path="keywords" element={<AdminKeywords />} />
                  <Route path="keywords/:id" element={<AdminKeywords />} />
                  <Route path="lottery" element={<AdminLottery />} />
                  <Route path="lottery/:id" element={<AdminLottery />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
