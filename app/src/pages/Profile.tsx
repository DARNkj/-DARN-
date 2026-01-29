import { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Heart, 
  Bookmark, 
  Edit3, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Award,
  Eye,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { AppContext } from '@/App';
import type { Photo, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { calculateLevel, getExpToNextLevel, LEVEL_CONFIG } from '@/hooks/useStore';

interface ProfileProps {
  photoStore: {
    photos: Photo[];
    getUserPhotos: (userId: string) => Photo[];
    getUserFavorites: (userId: string) => Photo[];
  };
}

const Profile = ({ photoStore }: ProfileProps) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  
  const currentUser = context?.currentUser;
  const updateUser = context?.updateUser;
  const logout = context?.logout;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    email: '',
  });

  // 获取用户数据
  useEffect(() => {
    if (userId) {
      // 查看其他用户主页
      const users = JSON.parse(localStorage.getItem('feiying-users') || '[]');
      const user = users.find((u: User) => u.id === userId);
      if (user) {
        setProfileUser(user);
      } else {
        navigate('/');
        toast.error('用户不存在');
      }
    } else if (currentUser) {
      // 查看自己的主页
      setProfileUser(currentUser);
      setEditForm({
        username: currentUser.username,
        bio: currentUser.bio || '',
        email: currentUser.email,
      });
    } else {
      navigate('/login');
    }
  }, [userId, currentUser, navigate]);

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const userPhotos = photoStore.getUserPhotos(profileUser.id);
  const userFavorites = isOwnProfile ? photoStore.getUserFavorites(profileUser.id) : [];
  
  const levelInfo = calculateLevel(profileUser.exp);
  const expToNext = getExpToNextLevel(profileUser.exp);
  const expProgress = expToNext > 0 
    ? ((profileUser.exp - levelInfo.minExp) / (levelInfo.maxExp - levelInfo.minExp)) * 100 
    : 100;

  const handleSaveProfile = () => {
    if (!editForm.username.trim()) {
      toast.error('用户名不能为空');
      return;
    }
    
    updateUser?.(profileUser.id, {
      username: editForm.username,
      bio: editForm.bio,
      email: editForm.email,
    });
    
    setIsEditing(false);
    toast.success('资料已更新');
  };

  const handleLogout = () => {
    logout?.();
    navigate('/');
    toast.success('已退出登录');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-28 h-28 ring-4 ring-white shadow-xl">
                <AvatarFallback 
                  className="text-3xl text-white"
                  style={{ background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}dd)` }}
                >
                  {profileUser.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                style={{ backgroundColor: levelInfo.color }}
              >
                {profileUser.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="用户名"
                    className="max-w-xs"
                  />
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="邮箱"
                    className="max-w-xs"
                  />
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="个人简介"
                    className="max-w-md"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="rounded-xl">
                      保存
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profileUser.username}</h1>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: levelInfo.color }}
                    >
                      {levelInfo.name}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{profileUser.bio || '这个人很懒，还没有写简介'}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      飞友
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      加入于 {new Date(profileUser.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Lv.{profileUser.level}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            {isOwnProfile && !isEditing && (
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑资料
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="rounded-xl gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </Button>
              </div>
            )}
          </div>

          {/* Level Progress */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0084d9]" />
                <span className="font-medium text-gray-700">等级进度</span>
              </div>
              <span className="text-sm text-gray-500">
                {profileUser.exp} / {levelInfo.maxExp === Infinity ? '∞' : levelInfo.maxExp} EXP
              </span>
            </div>
            <div className="relative">
              <Progress value={expProgress} className="h-3" />
              {expToNext > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  还需 {expToNext} 经验值升级到 Lv.{profileUser.level + 1}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <StatCard icon={Camera} value={userPhotos.length} label="上传照片" />
            <StatCard icon={Heart} value={profileUser.likeCount} label="获得点赞" />
            <StatCard icon={Eye} value={profileUser.downloadCount} label="下载次数" />
            <StatCard icon={MessageSquare} value={profileUser.commentCount} label="评论数" />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="photos" className="rounded-xl gap-2">
              <Camera className="w-4 h-4" />
              我的照片
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="favorites" className="rounded-xl gap-2">
                <Bookmark className="w-4 h-4" />
                我的收藏
              </TabsTrigger>
            )}
            <TabsTrigger value="levels" className="rounded-xl gap-2">
              <Award className="w-4 h-4" />
              等级说明
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            {userPhotos.length === 0 ? (
              <EmptyState 
                icon={Camera} 
                title="还没有上传照片" 
                description="分享你的航空摄影作品，与全球飞友交流"
                action={isOwnProfile ? { label: '去上传', href: '/upload' } : undefined}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {userPhotos.map((photo, index) => (
                  <PhotoCard key={photo.id} photo={photo} index={index} />
                ))}
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="favorites">
              {userFavorites.length === 0 ? (
                <EmptyState 
                  icon={Bookmark} 
                  title="还没有收藏照片" 
                  description="浏览图库，收藏你喜欢的航空摄影作品"
                  action={{ label: '去浏览', href: '/search' }}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {userFavorites.map((photo, index) => (
                    <PhotoCard key={photo.id} photo={photo} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="levels">
            <div className="card-glass p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">等级系统</h3>
              <div className="space-y-4">
                {LEVEL_CONFIG.map((level) => (
                  <div 
                    key={level.level}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      profileUser.level === level.level ? 'bg-[#0084d9]/10' : 'bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.level}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">{level.name}</h4>
                        {profileUser.level === level.level && (
                          <span className="px-2 py-1 rounded-full text-xs bg-[#0084d9] text-white">
                            当前等级
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        需要 {level.minExp} 经验值
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">如何获得经验值</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 上传照片：+20 EXP</li>
                  <li>• 点赞照片：+2 EXP</li>
                  <li>• 发表评论：+5 EXP</li>
                  <li>• 下载照片：+3 EXP</li>
                  <li>• 照片被点赞：+5 EXP</li>
                  <li>• 照片被下载：+5 EXP</li>
                  <li>• 照片审核通过：+30 EXP</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// 统计卡片
const StatCard = ({ icon: Icon, value, label }: { icon: any; value: number; label: string }) => (
  <div className="text-center p-4 rounded-xl bg-gray-50">
    <Icon className="w-6 h-6 mx-auto mb-2 text-[#0084d9]" />
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

// 照片卡片
const PhotoCard = ({ photo, index }: { photo: Photo; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group"
  >
    <Link to={`/photo/${photo.id}`}>
      <div className="card-glass overflow-hidden">
        <div className="relative aspect-square">
          <img
            src={photo.thumbnail || photo.url}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
            <h3 className="font-bold truncate">{photo.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {photo.likes.length}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {photo.views}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

// 空状态
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any; 
  title: string; 
  description: string;
  action?: { label: string; href: string };
}) => (
  <div className="text-center py-20">
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
      <Icon className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {action && (
      <Link to={action.href}>
        <Button className="rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8]">
          {action.label}
        </Button>
      </Link>
    )}
  </div>
);

export default Profile;
