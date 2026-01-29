// 用户角色类型
export type UserRole = 'user' | 'admin' | 'reviewer';

// 用户状态类型
export type UserStatus = 'active' | 'banned';

// 照片状态类型
export type PhotoStatus = 'pending' | 'approved' | 'rejected';

// 反馈状态类型
export type FeedbackStatus = 'unread' | 'read' | 'replied';

// 用户接口
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  level: number;
  exp: number;
  bio?: string;
  createdAt: string;
  lastLoginAt?: string;
  // 活跃度统计
  uploadCount: number;
  likeCount: number;
  commentCount: number;
  downloadCount: number;
}

// 照片接口
export interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  airport: string;
  tags: string[];
  uploaderId: string;
  uploaderName: string;
  uploaderAvatar?: string;
  status: PhotoStatus;
  createdAt: string;
  // 互动数据
  likes: string[];
  comments: Comment[];
  favorites: string[];
  downloads: number;
  views: number;
}

// 评论接口
export interface Comment {
  id: string;
  photoId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

// 反馈/留言接口
export interface Feedback {
  id: string;
  userId?: string;
  username: string;
  email: string;
  type: 'suggestion' | 'bug' | 'complaint' | 'other';
  subject: string;
  content: string;
  status: FeedbackStatus;
  reply?: string;
  createdAt: string;
  repliedAt?: string;
}

// 网站配置接口
export interface SiteConfig {
  siteName: string;
  siteLogo: string;
  copyright: string;
  contactEmail: string;
  enableRegistration: boolean;
  enableUpload: boolean;
  maxUploadSize: number;
  requireReview: boolean;
}

// 登录状态
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// 搜索过滤
export interface SearchFilters {
  query: string;
  airport?: string;
  tags?: string[];
  uploader?: string;
}

// 等级配置
export interface LevelConfig {
  level: number;
  name: string;
  minExp: number;
  maxExp: number;
  color: string;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  createdAt: string;
}
