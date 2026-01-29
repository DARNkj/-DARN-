import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Camera,
  MapPin,
  User,
  Calendar,
  Search
} from 'lucide-react';
import { AppContext } from '@/App';
import type { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { EXP_CONFIG } from '@/hooks/useStore';

interface ReviewerDashboardProps {
  photoStore: {
    photos: Photo[];
    getPendingPhotos: () => Photo[];
    reviewPhoto: (photoId: string, status: 'approved' | 'rejected') => void;
  };
}

const ReviewerDashboard = ({ photoStore }: ReviewerDashboardProps) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const currentUser = context?.currentUser;
  const addExp = context?.addExp;

  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 验证权限
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'reviewer')) {
      navigate('/');
      toast.error('无权访问');
      return;
    }

    // 加载待审核照片
    const photos = photoStore.getPendingPhotos();
    setPendingPhotos(photos);
  }, [currentUser, navigate, photoStore]);

  // 过滤照片
  const filteredPhotos = pendingPhotos.filter(photo =>
    photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.airport.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.uploaderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (photoId: string) => {
    photoStore.reviewPhoto(photoId, 'approved');
    // 给上传者增加经验值
    const photo = pendingPhotos.find(p => p.id === photoId);
    if (photo) {
      addExp?.(photo.uploaderId, EXP_CONFIG.photoApproved);
    }
    // 刷新列表
    setPendingPhotos(photoStore.getPendingPhotos());
    setIsReviewModalOpen(false);
    toast.success('照片已通过审核');
  };

  const handleReject = (photoId: string) => {
    photoStore.reviewPhoto(photoId, 'rejected');
    // 刷新列表
    setPendingPhotos(photoStore.getPendingPhotos());
    setIsReviewModalOpen(false);
    toast.success('照片已拒绝');
  };

  const stats = {
    pending: pendingPhotos.length,
    totalReviewed: photoStore.photos.filter(p => p.status !== 'pending').length,
    todayPending: pendingPhotos.filter(p => {
      const today = new Date().toDateString();
      return new Date(p.createdAt).toDateString() === today;
    }).length,
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 
                className="text-3xl md:text-4xl font-bold text-gray-900"
                style={{ fontFamily: "'Changa One', Impact, sans-serif", fontStyle: 'italic' }}
              >
                审核中心
              </h1>
              <p className="text-gray-500">审核用户上传的照片</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <StatCard icon={Clock} value={stats.pending} label="待审核" color="orange" />
          <StatCard icon={CheckCircle} value={stats.totalReviewed} label="已审核" color="green" />
          <StatCard icon={Camera} value={stats.todayPending} label="今日新增" color="blue" />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-6 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索照片标题、机场、上传者..."
              className="pl-12 py-3 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Photo Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredPhotos.length === 0 ? (
            <div className="card-glass p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">太棒了！</h3>
              <p className="text-gray-500">所有照片都已审核完毕</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="card-glass overflow-hidden">
                    <div 
                      className="relative aspect-square cursor-pointer"
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setIsReviewModalOpen(true);
                      }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <h3 className="font-bold truncate">{photo.title}</h3>
                        <p className="text-sm opacity-80">{photo.airport}</p>
                      </div>

                      {/* Pending Badge */}
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs bg-orange-500 text-white">
                        待审核
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0084d9] to-[#00a8e8] flex items-center justify-center text-white text-xs">
                          {photo.uploaderName[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600">{photo.uploaderName}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(photo.id)}
                          className="flex-1 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          通过
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(photo.id)}
                          className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          拒绝
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedPhoto.title}</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#0084d9]" />
                    <span className="text-gray-700">{selectedPhoto.airport}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#0084d9]" />
                    <span className="text-gray-700">{selectedPhoto.uploaderName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#0084d9]" />
                    <span className="text-gray-700">
                      {new Date(selectedPhoto.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>

                {selectedPhoto.description && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">描述</h4>
                    <p className="text-gray-600">{selectedPhoto.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPhoto.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(selectedPhoto.id)}
                    className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white py-3"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    通过审核
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedPhoto.id)}
                    className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 py-3"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    拒绝
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
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

export default ReviewerDashboard;
