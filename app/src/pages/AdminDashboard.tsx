import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Camera, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Eye,
  UserPlus,
  Search,
  Mail,
  Lock,
  AlertTriangle,
  MessageSquare,
  Settings
} from 'lucide-react';
import { AppContext, FeedbackContext } from '@/App';
import type { Photo, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface AdminDashboardProps {
  photoStore: {
    photos: Photo[];
    deletePhoto: (photoId: string) => void;
    getPendingPhotos: () => Photo[];
  };
}

const AdminDashboard = ({ photoStore }: AdminDashboardProps) => {
  const context = useContext(AppContext);
  const feedbackContext = useContext(FeedbackContext);
  const navigate = useNavigate();
  const currentUser = context?.currentUser;
  const toggleBanUser = context?.toggleBanUser;
  const deleteUser = context?.deleteUser;
  const registerReviewer = context?.registerReviewer;
  const feedbacks = feedbackContext?.feedbacks || [];
  const markAsRead = feedbackContext?.markAsRead;
  const replyFeedback = feedbackContext?.replyFeedback;
  const deleteFeedback = feedbackContext?.deleteFeedback;

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isDeletePhotoDialogOpen, setIsDeletePhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isReviewerDialogOpen, setIsReviewerDialogOpen] = useState(false);
  const [reviewerForm, setReviewerForm] = useState({ username: '', email: '', password: '' });
  const [replyText, setReplyText] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      toast.error('无权访问');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('darn-users') || '[]');
    setUsers(storedUsers);
  }, [currentUser, navigate]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.filter(u => u.role === 'user').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    totalReviewers: users.filter(u => u.role === 'reviewer').length,
    bannedUsers: users.filter(u => u.status === 'banned').length,
    totalPhotos: photoStore.photos.length,
    pendingPhotos: photoStore.getPendingPhotos().length,
    unreadFeedbacks: feedbacks.filter(f => f.status === 'unread').length,
  };

  const handleBanUser = () => {
    if (selectedUser) {
      toggleBanUser?.(selectedUser.id);
      const storedUsers = JSON.parse(localStorage.getItem('darn-users') || '[]');
      setUsers(storedUsers);
      setIsBanDialogOpen(false);
      toast.success(selectedUser.status === 'banned' ? '用户已解封' : '用户已封禁');
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser?.(selectedUser.id);
      const storedUsers = JSON.parse(localStorage.getItem('darn-users') || '[]');
      setUsers(storedUsers);
      setIsDeleteUserDialogOpen(false);
      toast.success('用户已删除');
    }
  };

  const handleDeletePhoto = () => {
    if (selectedPhoto) {
      photoStore.deletePhoto(selectedPhoto.id);
      setIsDeletePhotoDialogOpen(false);
      toast.success('照片已删除');
    }
  };

  const handleRegisterReviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerForm.username || !reviewerForm.email || !reviewerForm.password) {
      toast.error('请填写完整信息');
      return;
    }

    const result = registerReviewer?.(
      reviewerForm.username,
      reviewerForm.email,
      reviewerForm.password,
      currentUser!.id
    );

    if (result?.success) {
      toast.success('审核员注册成功');
      setIsReviewerDialogOpen(false);
      setReviewerForm({ username: '', email: '', password: '' });
      const storedUsers = JSON.parse(localStorage.getItem('darn-users') || '[]');
      setUsers(storedUsers);
    } else {
      toast.error(result?.message || '注册失败');
    }
  };

  const handleReplyFeedback = () => {
    if (selectedFeedback && replyText.trim()) {
      replyFeedback?.(selectedFeedback.id, replyText);
      setIsReplyDialogOpen(false);
      setReplyText('');
      toast.success('回复已发送');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">管理员</span>;
      case 'reviewer':
        return <span className="px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-700 font-medium">审核员</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">用户</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">正常</span>
      : <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 font-medium">封禁</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  管理员后台
                </h1>
                <p className="text-gray-500">管理系统用户和内容</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/site-settings')}
              variant="outline"
              className="gap-2 rounded-xl"
            >
              <Settings className="w-4 h-4" />
              网站设置
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={Users} value={stats.totalUsers} label="普通用户" color="blue" />
          <StatCard icon={Shield} value={stats.totalAdmins} label="管理员" color="purple" />
          <StatCard icon={Eye} value={stats.totalReviewers} label="审核员" color="cyan" />
          <StatCard icon={Ban} value={stats.bannedUsers} label="封禁用户" color="red" />
          <StatCard icon={Camera} value={stats.totalPhotos} label="总照片" color="green" />
          <StatCard icon={AlertTriangle} value={stats.pendingPhotos} label="待审核" color="orange" />
          <StatCard icon={MessageSquare} value={stats.unreadFeedbacks} label="未读反馈" color="pink" />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="users" className="rounded-xl gap-2">
              <Users className="w-4 h-4" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="photos" className="rounded-xl gap-2">
              <Camera className="w-4 h-4" />
              照片管理
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl gap-2">
              <MessageSquare className="w-4 h-4" />
              用户反馈
              {stats.unreadFeedbacks > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                  {stats.unreadFeedbacks}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewers" className="rounded-xl gap-2">
              <UserPlus className="w-4 h-4" />
              审核员管理
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">用户列表</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索用户..."
                    className="pl-10 w-64 rounded-xl"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">用户</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">角色</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">状态</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">等级</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">注册时间</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-[#0084d9] to-[#00a8e8] text-white text-sm font-bold">
                                {user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.username}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-[#0084d9]/10 text-[#0084d9] font-medium">
                            Lv.{user.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsBanDialogOpen(true);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    user.status === 'banned'
                                      ? 'text-green-600 hover:bg-green-50'
                                      : 'text-orange-600 hover:bg-orange-50'
                                  }`}
                                  title={user.status === 'banned' ? '解封' : '封禁'}
                                >
                                  {user.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteUserDialogOpen(true);
                                  }}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                  title="删除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <div className="card-glass p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">照片列表</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photoStore.photos.map((photo) => (
                  <div key={photo.id} className="group relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={photo.thumbnail || photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button
                        onClick={() => window.open(`/photo/${photo.id}`, '_blank')}
                        className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setIsDeletePhotoDialogOpen(true);
                        }}
                        className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-700 mt-1 truncate font-medium">{photo.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="card-glass p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">用户反馈</h3>
              {feedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无反馈</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback: any) => (
                    <div 
                      key={feedback.id} 
                      className={`p-4 rounded-xl border ${
                        feedback.status === 'unread' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              feedback.type === 'suggestion' ? 'bg-yellow-100 text-yellow-700' :
                              feedback.type === 'bug' ? 'bg-red-100 text-red-700' :
                              feedback.type === 'complaint' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {feedback.type === 'suggestion' ? '建议' :
                               feedback.type === 'bug' ? '问题' :
                               feedback.type === 'complaint' ? '投诉' : '其他'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              feedback.status === 'unread' ? 'bg-red-100 text-red-700' :
                              feedback.status === 'read' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {feedback.status === 'unread' ? '未读' :
                               feedback.status === 'read' ? '已读' : '已回复'}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{feedback.subject}</h4>
                          <p className="text-sm text-gray-600 mt-1">{feedback.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>来自: {feedback.username}</span>
                            <span>邮箱: {feedback.email}</span>
                            <span>{new Date(feedback.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                          {feedback.reply && (
                            <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                              <p className="text-sm text-green-800">
                                <span className="font-semibold">回复:</span> {feedback.reply}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {feedback.status === 'unread' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markAsRead?.(feedback.id)}
                            >
                              标记已读
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setIsReplyDialogOpen(true);
                            }}
                          >
                            回复
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              if (confirm('确定要删除这条反馈吗？')) {
                                deleteFeedback?.(feedback.id);
                                toast.success('反馈已删除');
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reviewers Tab */}
          <TabsContent value="reviewers">
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">审核员列表</h3>
                <Button 
                  onClick={() => setIsReviewerDialogOpen(true)}
                  className="rounded-xl gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  注册审核员
                </Button>
              </div>

              <div className="space-y-4">
                {users.filter(u => u.role === 'reviewer').map((reviewer) => (
                  <div key={reviewer.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-bold">
                          {reviewer.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{reviewer.username}</p>
                        <p className="text-sm text-gray-500">{reviewer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-700">
                        审核员
                      </span>
                    </div>
                  </div>
                ))}

                {users.filter(u => u.role === 'reviewer').length === 0 && (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">暂无审核员</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ban Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === 'banned' ? '解封用户' : '封禁用户'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.status === 'banned' 
                ? `确定要解封用户 "${selectedUser?.username}" 吗？`
                : `确定要封禁用户 "${selectedUser?.username}" 吗？封禁后该用户将无法登录。`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleBanUser}
              variant={selectedUser?.status === 'banned' ? 'default' : 'destructive'}
            >
              {selectedUser?.status === 'banned' ? '解封' : '封禁'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除用户</DialogTitle>
            <DialogDescription>
              确定要删除用户 "{selectedUser?.username}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Dialog */}
      <Dialog open={isDeletePhotoDialogOpen} onOpenChange={setIsDeletePhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除照片</DialogTitle>
            <DialogDescription>
              确定要删除这张照片吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePhotoDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeletePhoto}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Reviewer Dialog */}
      <Dialog open={isReviewerDialogOpen} onOpenChange={setIsReviewerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>注册审核员</DialogTitle>
            <DialogDescription>
              创建新的审核员账号，审核员可以审核用户上传的照片。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterReviewer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={reviewerForm.username}
                  onChange={(e) => setReviewerForm({ ...reviewerForm, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  value={reviewerForm.email}
                  onChange={(e) => setReviewerForm({ ...reviewerForm, email: e.target.value })}
                  placeholder="请输入邮箱"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="password"
                  value={reviewerForm.password}
                  onChange={(e) => setReviewerForm({ ...reviewerForm, password: e.target.value })}
                  placeholder="请输入密码"
                  className="pl-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReviewerDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">注册</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reply Feedback Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>回复反馈</DialogTitle>
            <DialogDescription>
              回复用户 "{selectedFeedback?.username}" 的反馈
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">{selectedFeedback?.content}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="请输入回复内容..."
              rows={4}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#0084d9] focus:ring-2 focus:ring-[#0084d9]/20 outline-none resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleReplyFeedback}>发送回复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 统计卡片
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: any; 
  value: number; 
  label: string;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    pink: 'bg-pink-100 text-pink-700',
  };

  return (
    <div className="card-glass p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
