import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { User, SiteConfig, Feedback } from '@/types';
import { useUserStore, usePhotoStore, useFeedbackStore, useSiteConfig } from '@/hooks/useStore';

// 页面组件
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PhotoDetail from '@/pages/PhotoDetail';
import Upload from '@/pages/Upload';
import Profile from '@/pages/Profile';
import Search from '@/pages/Search';
import AdminDashboard from '@/pages/AdminDashboard';
import ReviewerDashboard from '@/pages/ReviewerDashboard';
import FeedbackPage from '@/pages/FeedbackPage';
import SiteSettings from '@/pages/SiteSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

// 全局上下文
interface AppContextType {
  currentUser: User | null;
  siteConfig: SiteConfig;
  login: (username: string, password: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  register: (username: string, email: string, password: string) => { success: boolean; message: string };
  updateUser: (userId: string, updates: Partial<User>) => void;
  addExp: (userId: string, exp: number) => void;
  toggleBanUser: (userId: string) => void;
  registerReviewer: (username: string, email: string, password: string, adminId: string) => { success: boolean; message: string };
  deleteUser: (userId: string) => void;
  updateSiteConfig: (updates: Partial<SiteConfig>) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// 反馈上下文
interface FeedbackContextType {
  feedbacks: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => Feedback;
  markAsRead: (feedbackId: string) => void;
  replyFeedback: (feedbackId: string, reply: string) => void;
  deleteFeedback: (feedbackId: string) => void;
  getUnreadCount: () => number;
}

export const FeedbackContext = createContext<FeedbackContextType | null>(null);

// 保护路由组件
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { currentUser } = context;
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const userStore = useUserStore();
  const photoStore = usePhotoStore();
  const feedbackStore = useFeedbackStore();
  const { config, updateConfig } = useSiteConfig();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const contextValue: AppContextType = {
    currentUser: userStore.currentUser,
    siteConfig: config,
    login: userStore.login,
    logout: userStore.logout,
    register: userStore.register,
    updateUser: userStore.updateUser,
    addExp: userStore.addExp,
    toggleBanUser: userStore.toggleBanUser,
    registerReviewer: userStore.registerReviewer,
    deleteUser: userStore.deleteUser,
    updateSiteConfig: updateConfig,
  };

  const feedbackContextValue: FeedbackContextType = {
    feedbacks: feedbackStore.feedbacks,
    addFeedback: feedbackStore.addFeedback,
    markAsRead: feedbackStore.markAsRead,
    replyFeedback: feedbackStore.replyFeedback,
    deleteFeedback: feedbackStore.deleteFeedback,
    getUnreadCount: feedbackStore.getUnreadCount,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0084d9]/5 to-[#00a8e8]/5">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner" />
          <p className="text-gray-600 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <FeedbackContext.Provider value={feedbackContextValue}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc]">
            <Navbar />
            <main className="min-h-screen">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home photoStore={photoStore} />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/photo/:id" element={<PhotoDetail photoStore={photoStore} />} />
                  <Route path="/search" element={<Search photoStore={photoStore} />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route 
                    path="/upload" 
                    element={
                      <ProtectedRoute allowedRoles={['user', 'admin', 'reviewer']}>
                        <Upload photoStore={photoStore} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute allowedRoles={['user', 'admin', 'reviewer']}>
                        <Profile photoStore={photoStore} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile/:userId" 
                    element={<Profile photoStore={photoStore} />} 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard photoStore={photoStore} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reviewer" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'reviewer']}>
                        <ReviewerDashboard photoStore={photoStore} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/site-settings" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SiteSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                },
              }}
            />
          </div>
        </Router>
      </FeedbackContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
