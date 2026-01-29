import { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Download, 
  Bookmark, 
  Share2, 
  ArrowLeft, 
  Send,
  Trash2,
  MapPin,
  Tag,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { AppContext } from '@/App';
import type { Photo, Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { EXP_CONFIG } from '@/hooks/useStore';

interface PhotoDetailProps {
  photoStore: {
    photos: Photo[];
    toggleLike: (photoId: string, userId: string) => void;
    toggleFavorite: (photoId: string, userId: string) => void;
    addComment: (photoId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
    deleteComment: (photoId: string, commentId: string) => void;
    deletePhoto: (photoId: string) => void;
    incrementDownload: (photoId: string) => void;
    incrementView: (photoId: string) => void;
  };
}

const PhotoDetail = ({ photoStore }: PhotoDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const currentUser = context?.currentUser;
  const addExp = context?.addExp;

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      const foundPhoto = photoStore.photos.find(p => p.id === id);
      if (foundPhoto) {
        setPhoto(foundPhoto);
        photoStore.incrementView(id);
      } else {
        navigate('/');
        toast.error('照片不存在');
      }
    }
  }, [id, photoStore, navigate]);

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  const isLiked = currentUser ? photo.likes.includes(currentUser.id) : false;
  const isFavorited = currentUser ? photo.favorites.includes(currentUser.id) : false;
  const isOwner = currentUser?.id === photo.uploaderId;
  const isAdmin = currentUser?.role === 'admin';

  const handleLike = () => {
    if (!currentUser) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    photoStore.toggleLike(photo.id, currentUser.id);
    if (!isLiked) {
      addExp?.(photo.uploaderId, EXP_CONFIG.photoLiked);
      toast.success('点赞成功');
    }
  };

  const handleFavorite = () => {
    if (!currentUser) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    photoStore.toggleFavorite(photo.id, currentUser.id);
    toast.success(isFavorited ? '已取消收藏' : '收藏成功');
  };

  const handleDownload = () => {
    if (!currentUser) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    photoStore.incrementDownload(photo.id);
    addExp?.(currentUser.id, EXP_CONFIG.download);
    addExp?.(photo.uploaderId, EXP_CONFIG.photoDownloaded);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${photo.title}.jpg`;
    link.target = '_blank';
    link.click();
    
    toast.success('开始下载');
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    if (!commentText.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    photoStore.addComment(photo.id, {
      photoId: photo.id,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
    });

    addExp?.(currentUser.id, EXP_CONFIG.comment);
    setCommentText('');
    toast.success('评论成功');
  };

  const handleDeleteComment = (commentId: string) => {
    photoStore.deleteComment(photo.id, commentId);
    toast.success('评论已删除');
  };

  const handleDeletePhoto = () => {
    photoStore.deletePhoto(photo.id);
    setIsDeleteDialogOpen(false);
    toast.success('照片已删除');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0084d9] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="card-glass overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100">
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="loading-spinner" />
                  </div>
                )}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setIsImageLoaded(true)}
                />
              </div>
            </div>

            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ActionButton
                  icon={Heart}
                  count={photo.likes.length}
                  isActive={isLiked}
                  onClick={handleLike}
                  activeColor="text-red-500"
                  label="点赞"
                />
                <ActionButton
                  icon={MessageCircle}
                  count={photo.comments.length}
                  label="评论"
                />
                <ActionButton
                  icon={Eye}
                  count={photo.views}
                  label="浏览"
                />
              </div>
              <div className="flex items-center gap-2">
                <ActionButton
                  icon={Bookmark}
                  isActive={isFavorited}
                  onClick={handleFavorite}
                  activeColor="text-yellow-500"
                  label="收藏"
                />
                <ActionButton
                  icon={Download}
                  count={photo.downloads}
                  onClick={handleDownload}
                  label="下载"
                />
                <ActionButton
                  icon={Share2}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('链接已复制');
                  }}
                  label="分享"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Photo Info */}
            <div className="card-glass p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{photo.title}</h1>
                {(isOwner || isAdmin) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-lg hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(isOwner || isAdmin) && (
                        <DropdownMenuItem 
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除照片
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {photo.description && (
                <p className="text-gray-600 mb-4">{photo.description}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-[#0084d9]" />
                  <span>{photo.airport}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-[#0084d9]" />
                  <span>{new Date(photo.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {photo.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="tag"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Uploader Info */}
            <div className="card-glass p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">上传者</h3>
              <Link 
                to={`/profile/${photo.uploaderId}`}
                className="flex items-center gap-4 group"
              >
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-[#0084d9] to-[#00a8e8] text-white text-lg">
                    {photo.uploaderName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-[#0084d9] transition-colors">
                    {photo.uploaderName}
                  </p>
                  <p className="text-sm text-gray-500">点击查看主页</p>
                </div>
              </Link>
            </div>

            {/* Comments Section */}
            <div className="card-glass p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                评论 ({photo.comments.length})
              </h3>

              {/* Comment List */}
              <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                {photo.comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无评论，来说点什么吧</p>
                ) : (
                  photo.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          {comment.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-gray-900">{comment.username}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            {(currentUser?.id === comment.userId || isAdmin) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              {currentUser ? (
                <form onSubmit={handleComment} className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="写下你的评论..."
                    className="flex-1 rounded-xl"
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    className="rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">登录后发表评论</p>
                  <Link to="/login">
                    <Button size="sm" className="rounded-xl">
                      去登录
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这张照片吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeletePhoto}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 操作按钮组件
const ActionButton = ({ 
  icon: Icon, 
  count, 
  isActive, 
  onClick, 
  activeColor = 'text-[#0084d9]',
  label
}: { 
  icon: any; 
  count?: number; 
  isActive?: boolean; 
  onClick?: () => void;
  activeColor?: string;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
      isActive 
        ? `${activeColor} bg-current/10` 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
    title={label}
  >
    <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
    {count !== undefined && <span className="font-medium">{count}</span>}
  </button>
);

export default PhotoDetail;
