import { useState, useCallback } from 'react';
import type { User, Photo, Comment, PhotoStatus, Feedback, SiteConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// 等级配置
export const LEVEL_CONFIG = [
  { level: 1, name: '见习飞友', minExp: 0, maxExp: 99, color: '#94a3b8' },
  { level: 2, name: '初级飞友', minExp: 100, maxExp: 299, color: '#22c55e' },
  { level: 3, name: '中级飞友', minExp: 300, maxExp: 599, color: '#3b82f6' },
  { level: 4, name: '高级飞友', minExp: 600, maxExp: 999, color: '#8b5cf6' },
  { level: 5, name: '资深飞友', minExp: 1000, maxExp: 1499, color: '#f59e0b' },
  { level: 6, name: '飞行达人', minExp: 1500, maxExp: 2199, color: '#ef4444' },
  { level: 7, name: '航空摄影师', minExp: 2200, maxExp: 3099, color: '#ec4899' },
  { level: 8, name: '首席摄影师', minExp: 3100, maxExp: 4499, color: '#06b6d4' },
  { level: 9, name: '传奇飞友', minExp: 4500, maxExp: 6999, color: '#6366f1' },
  { level: 10, name: '航空大师', minExp: 7000, maxExp: Infinity, color: '#fbbf24' },
];

// 计算等级
export const calculateLevel = (exp: number) => {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_CONFIG[i].minExp) {
      return LEVEL_CONFIG[i];
    }
  }
  return LEVEL_CONFIG[0];
};

// 计算升级所需经验
export const getExpToNextLevel = (exp: number) => {
  const currentLevel = calculateLevel(exp);
  const nextLevel = LEVEL_CONFIG.find(l => l.level === currentLevel.level + 1);
  if (!nextLevel) return 0;
  return nextLevel.minExp - exp;
};

// 获取存储数据
const getStorageData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// 设置存储数据
const setStorageData = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

// 默认网站配置
const defaultSiteConfig: SiteConfig = {
  siteName: 'DARN飞影图传',
  siteLogo: '/logo.png',
  copyright: '©达人云端运算',
  contactEmail: '3833423187@qq.com',
  enableRegistration: true,
  enableUpload: true,
  maxUploadSize: 10,
  requireReview: true,
};

// 初始化默认管理员账号
const initDefaultAdmin = (): User => ({
  id: 'admin-001',
  username: 'DARNAdmin',
  email: 'admin@darn.com',
  password: 'DARN@2024!Secure',
  role: 'admin',
  status: 'active',
  level: 10,
  exp: 10000,
  bio: 'DARN飞影图传系统管理员',
  createdAt: new Date().toISOString(),
  uploadCount: 0,
  likeCount: 0,
  commentCount: 0,
  downloadCount: 0,
});

// 初始化第二个管理员账号
const initSecondAdmin = (): User => ({
  id: 'admin-002',
  username: 'DARNAdmin2',
  email: 'admin2@darn.com',
  password: 'DARN@2024!Secure2',
  role: 'admin',
  status: 'active',
  level: 10,
  exp: 10000,
  bio: 'DARN飞影图传系统管理员',
  createdAt: new Date().toISOString(),
  uploadCount: 0,
  likeCount: 0,
  commentCount: 0,
  downloadCount: 0,
});

// 生成示例照片
const generateSamplePhotos = (users: User[]): Photo[] => {
  const sampleAirports = ['北京首都机场', '上海浦东机场', '广州白云机场', '深圳宝安机场', '成都双流机场', '杭州萧山机场', '西安咸阳机场', '重庆江北机场'];
  const sampleTags = ['民航客机', '货机', '公务机', '直升机', '战斗机', '波音', '空客', '中国商飞', '夜景', '日出', '日落', '云层'];
  
  const photos: Photo[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const uploader = users[Math.floor(Math.random() * users.length)];
    photos.push({
      id: `photo-${i}`,
      url: `https://picsum.photos/seed/plane${i}/800/800`,
      thumbnail: `https://picsum.photos/seed/plane${i}/400/400`,
      title: `精彩航空摄影作品 #${i}`,
      description: `这是一张在机场拍摄的精彩照片，记录了航空之美。`,
      airport: sampleAirports[Math.floor(Math.random() * sampleAirports.length)],
      tags: [sampleTags[Math.floor(Math.random() * sampleTags.length)], sampleTags[Math.floor(Math.random() * sampleTags.length)]],
      uploaderId: uploader.id,
      uploaderName: uploader.username,
      uploaderAvatar: uploader.avatar,
      status: 'approved',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      likes: [],
      comments: [],
      favorites: [],
      downloads: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 500),
    });
  }
  
  return photos;
};

// 自定义Hook：网站配置管理
export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(() => {
    return getStorageData<SiteConfig>('darn-site-config', defaultSiteConfig);
  });

  const updateConfig = useCallback((updates: Partial<SiteConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setStorageData('darn-site-config', newConfig);
  }, [config]);

  return {
    config,
    updateConfig,
  };
};

// 自定义Hook：反馈管理
export const useFeedbackStore = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    return getStorageData<Feedback[]>('darn-feedbacks', []);
  });

  const saveFeedbacks = useCallback((newFeedbacks: Feedback[]) => {
    setFeedbacks(newFeedbacks);
    setStorageData('darn-feedbacks', newFeedbacks);
  }, []);

  // 添加反馈
  const addFeedback = useCallback((feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: uuidv4(),
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    saveFeedbacks([newFeedback, ...feedbacks]);
    return newFeedback;
  }, [feedbacks, saveFeedbacks]);

  // 标记为已读
  const markAsRead = useCallback((feedbackId: string) => {
    const updatedFeedbacks = feedbacks.map(f => 
      f.id === feedbackId ? { ...f, status: 'read' as const } : f
    );
    saveFeedbacks(updatedFeedbacks);
  }, [feedbacks, saveFeedbacks]);

  // 回复反馈
  const replyFeedback = useCallback((feedbackId: string, reply: string) => {
    const updatedFeedbacks = feedbacks.map(f => 
      f.id === feedbackId ? { ...f, reply, status: 'replied' as const, repliedAt: new Date().toISOString() } : f
    );
    saveFeedbacks(updatedFeedbacks);
  }, [feedbacks, saveFeedbacks]);

  // 删除反馈
  const deleteFeedback = useCallback((feedbackId: string) => {
    saveFeedbacks(feedbacks.filter(f => f.id !== feedbackId));
  }, [feedbacks, saveFeedbacks]);

  // 获取未读数量
  const getUnreadCount = useCallback(() => {
    return feedbacks.filter(f => f.status === 'unread').length;
  }, [feedbacks]);

  return {
    feedbacks,
    addFeedback,
    markAsRead,
    replyFeedback,
    deleteFeedback,
    getUnreadCount,
  };
};

// 自定义Hook：用户状态管理
export const useUserStore = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = getStorageData<User[]>('darn-users', []);
    if (stored.length === 0) {
      const defaultAdmins = [initDefaultAdmin(), initSecondAdmin()];
      setStorageData('darn-users', defaultAdmins);
      return defaultAdmins;
    }
    return stored;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return getStorageData<User | null>('darn-current-user', null);
  });

  const saveUsers = useCallback((newUsers: User[]) => {
    setUsers(newUsers);
    setStorageData('darn-users', newUsers);
  }, []);

  const setUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    setStorageData('darn-current-user', user);
  }, []);

  // 注册用户
  const register = useCallback((username: string, email: string, password: string): { success: boolean; message: string } => {
    if (users.some(u => u.username === username)) {
      return { success: false, message: '用户名已存在' };
    }
    if (users.some(u => u.email === email)) {
      return { success: false, message: '邮箱已被注册' };
    }

    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      password,
      role: 'user',
      status: 'active',
      level: 1,
      exp: 0,
      createdAt: new Date().toISOString(),
      uploadCount: 0,
      likeCount: 0,
      commentCount: 0,
      downloadCount: 0,
    };

    saveUsers([...users, newUser]);
    return { success: true, message: '注册成功' };
  }, [users, saveUsers]);

  // 登录
  const login = useCallback((username: string, password: string): { success: boolean; message: string; user?: User } => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }
    if (user.status === 'banned') {
      return { success: false, message: '账号已被封禁，请联系管理员' };
    }

    const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    saveUsers(updatedUsers);
    setUser(updatedUser);
    return { success: true, message: '登录成功', user: updatedUser };
  }, [users, saveUsers, setUser]);

  // 登出
  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  // 更新用户信息
  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    saveUsers(updatedUsers);
    if (currentUser?.id === userId) {
      setUser({ ...currentUser, ...updates });
    }
  }, [users, currentUser, saveUsers, setUser]);

  // 添加经验值
  const addExp = useCallback((userId: string, exp: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newExp = user.exp + exp;
      const newLevel = calculateLevel(newExp).level;
      updateUser(userId, { exp: newExp, level: newLevel });
    }
  }, [users, updateUser]);

  // 封禁/解封用户
  const toggleBanUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      updateUser(userId, { status: user.status === 'active' ? 'banned' : 'active' });
    }
  }, [users, updateUser]);

  // 注册审核员（仅管理员可操作）
  const registerReviewer = useCallback((username: string, email: string, password: string, adminId: string): { success: boolean; message: string } => {
    const admin = users.find(u => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, message: '无权操作' };
    }

    if (users.some(u => u.username === username)) {
      return { success: false, message: '用户名已存在' };
    }

    const newReviewer: User = {
      id: uuidv4(),
      username,
      email,
      password,
      role: 'reviewer',
      status: 'active',
      level: 5,
      exp: 1000,
      createdAt: new Date().toISOString(),
      uploadCount: 0,
      likeCount: 0,
      commentCount: 0,
      downloadCount: 0,
    };

    saveUsers([...users, newReviewer]);
    return { success: true, message: '审核员注册成功' };
  }, [users, saveUsers]);

  // 删除用户
  const deleteUser = useCallback((userId: string) => {
    saveUsers(users.filter(u => u.id !== userId));
  }, [users, saveUsers]);

  return {
    users,
    currentUser,
    login,
    logout,
    register,
    updateUser,
    addExp,
    toggleBanUser,
    registerReviewer,
    deleteUser,
  };
};

// 自定义Hook：照片状态管理
export const usePhotoStore = () => {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const stored = getStorageData<Photo[]>('darn-photos', []);
    if (stored.length === 0) {
      const users = getStorageData<User[]>('darn-users', []);
      const samplePhotos = generateSamplePhotos(users.length > 0 ? users : [initDefaultAdmin()]);
      setStorageData('darn-photos', samplePhotos);
      return samplePhotos;
    }
    return stored;
  });

  const savePhotos = useCallback((newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    setStorageData('darn-photos', newPhotos);
  }, []);

  // 上传照片
  const uploadPhoto = useCallback((photoData: Omit<Photo, 'id' | 'createdAt' | 'likes' | 'comments' | 'favorites' | 'downloads' | 'views' | 'status'>): Photo => {
    const newPhoto: Photo = {
      ...photoData,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      favorites: [],
      downloads: 0,
      views: 0,
    };
    savePhotos([newPhoto, ...photos]);
    return newPhoto;
  }, [photos, savePhotos]);

  // 审核照片
  const reviewPhoto = useCallback((photoId: string, status: PhotoStatus) => {
    const updatedPhotos = photos.map(p => p.id === photoId ? { ...p, status } : p);
    savePhotos(updatedPhotos);
  }, [photos, savePhotos]);

  // 删除照片
  const deletePhoto = useCallback((photoId: string) => {
    savePhotos(photos.filter(p => p.id !== photoId));
  }, [photos, savePhotos]);

  // 点赞
  const toggleLike = useCallback((photoId: string, userId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    const hasLiked = photo.likes.includes(userId);
    const updatedPhotos = photos.map(p => {
      if (p.id === photoId) {
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId]
        };
      }
      return p;
    });
    savePhotos(updatedPhotos);
  }, [photos, savePhotos]);

  // 收藏
  const toggleFavorite = useCallback((photoId: string, userId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    const hasFavorited = photo.favorites.includes(userId);
    const updatedPhotos = photos.map(p => {
      if (p.id === photoId) {
        return {
          ...p,
          favorites: hasFavorited ? p.favorites.filter(id => id !== userId) : [...p.favorites, userId]
        };
      }
      return p;
    });
    savePhotos(updatedPhotos);
  }, [photos, savePhotos]);

  // 添加评论
  const addComment = useCallback((photoId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const updatedPhotos = photos.map(p => {
      if (p.id === photoId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });
    savePhotos(updatedPhotos);
  }, [photos, savePhotos]);

  // 删除评论
  const deleteComment = useCallback((photoId: string, commentId: string) => {
    const updatedPhotos = photos.map(p => {
      if (p.id === photoId) {
        return { ...p, comments: p.comments.filter(c => c.id !== commentId) };
      }
      return p;
    });
    savePhotos(updatedPhotos);
  }, [photos, savePhotos]);

  // 增加下载数
  const incrementDownload = useCallback((photoId: string) => {
    const updatedPhotos = photos.map(p => {
      if (p.id === photoId) {
        return { ...p, downloads: p.downloads + 1 };
      }
      return p;
    });
    savePhotos(updatedPhotos);
  }, [photos, savePhotos]);

  // 增加浏览数
  const incrementView = useCallback((photoId: string) => {
    const updatedPhotos = photos.map(p => {
      if (p.id === photoId) {
        return { ...p, views: p.views + 1 };
      }
      return p;
    });
    savePhotos(updatedPhotos);
  }, [photos, savePhotos]);

  // 搜索照片
  const searchPhotos = useCallback((query: string, filters?: { airport?: string; tags?: string[] }) => {
    return photos.filter(p => {
      if (p.status !== 'approved') return false;
      
      const matchesQuery = !query || 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        p.airport.toLowerCase().includes(query.toLowerCase());
      
      const matchesAirport = !filters?.airport || p.airport === filters.airport;
      const matchesTags = !filters?.tags || filters.tags.length === 0 || 
        filters.tags.some(tag => p.tags.includes(tag));
      
      return matchesQuery && matchesAirport && matchesTags;
    });
  }, [photos]);

  // 获取用户照片
  const getUserPhotos = useCallback((userId: string) => {
    return photos.filter(p => p.uploaderId === userId);
  }, [photos]);

  // 获取待审核照片
  const getPendingPhotos = useCallback(() => {
    return photos.filter(p => p.status === 'pending');
  }, [photos]);

  // 获取用户收藏的照片
  const getUserFavorites = useCallback((userId: string) => {
    return photos.filter(p => p.favorites.includes(userId));
  }, [photos]);

  return {
    photos,
    uploadPhoto,
    reviewPhoto,
    deletePhoto,
    toggleLike,
    toggleFavorite,
    addComment,
    deleteComment,
    incrementDownload,
    incrementView,
    searchPhotos,
    getUserPhotos,
    getPendingPhotos,
    getUserFavorites,
  };
};

// 经验值配置
export const EXP_CONFIG = {
  uploadPhoto: 20,
  likePhoto: 2,
  comment: 5,
  download: 3,
  photoLiked: 5,
  photoDownloaded: 5,
  photoApproved: 30,
  dailyLogin: 10,
};
