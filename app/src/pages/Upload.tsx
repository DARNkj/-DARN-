import { useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, X, Plus, MapPin, Tag, FileImage, CheckCircle } from 'lucide-react';
import { AppContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { EXP_CONFIG } from '@/hooks/useStore';

interface UploadProps {
  photoStore: {
    uploadPhoto: (photoData: any) => any;
  };
}

const Upload = ({ photoStore }: UploadProps) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const currentUser = context?.currentUser;
  const addExp = context?.addExp;

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    airport: '',
    tags: '',
  });

  // 验证登录
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // 验证账号状态
  if (currentUser.status === 'banned') {
    toast.error('账号已被封禁，无法上传');
    navigate('/');
    return null;
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type.startsWith('image/')
      );
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > 5) {
      toast.error('最多只能上传5张照片');
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('请选择要上传的照片');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('请输入照片标题');
      return;
    }

    if (!formData.airport.trim()) {
      toast.error('请输入机场信息');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // 上传每张照片
      for (let i = 0; i < files.length; i++) {
        const preview = previews[i];
        
        photoStore.uploadPhoto({
          url: preview,
          thumbnail: preview,
          title: files.length > 1 ? `${formData.title} #${i + 1}` : formData.title,
          description: formData.description,
          airport: formData.airport,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          uploaderId: currentUser.id,
          uploaderName: currentUser.username,
          uploaderAvatar: currentUser.avatar,
        });
      }

      setUploadProgress(100);
      clearInterval(progressInterval);

      // 增加经验值
      addExp?.(currentUser.id, EXP_CONFIG.uploadPhoto * files.length);

      toast.success(`成功上传 ${files.length} 张照片！`);
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      toast.error('上传失败，请重试');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "'Changa One', Impact, sans-serif", fontStyle: 'italic' }}
            >
              上传照片
            </h1>
            <p className="text-gray-600">分享你的航空摄影作品，与全球飞友交流</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-[#0084d9] bg-[#0084d9]/5'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="pointer-events-none">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0084d9]/10 to-[#00a8e8]/10 flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-[#0084d9]" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    拖拽照片到此处
                  </p>
                  <p className="text-sm text-gray-500">
                    或点击选择文件，最多5张
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    支持 JPG、PNG、WEBP 格式
                  </p>
                </div>
              </div>

              {/* Preview Grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  {previews.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#0084d9] hover:bg-[#0084d9]/5 transition-colors">
                      <Plus className="w-8 h-8 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="card-glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">上传中...</span>
                    <span className="text-sm text-[#0084d9]">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#0084d9] to-[#00a8e8]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  照片标题 *
                </label>
                <div className="relative">
                  <FileImage className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="给你的照片起个名字"
                    className="w-full pl-12 pr-4 py-3 rounded-xl"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  机场 *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.airport}
                    onChange={(e) => setFormData({ ...formData, airport: e.target.value })}
                    placeholder="例如：北京首都机场"
                    className="w-full pl-12 pr-4 py-3 rounded-xl"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="用逗号分隔，例如：波音, 737, 起飞"
                    className="w-full pl-12 pr-4 py-3 rounded-xl"
                    disabled={isUploading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">添加标签可以让更多人发现你的作品</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="分享这张照片背后的故事..."
                  rows={4}
                  className="w-full rounded-xl resize-none"
                  disabled={isUploading}
                />
              </div>

              {/* Tips */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  上传提示
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 每张照片可获得 20 经验值</li>
                  <li>• 照片审核通过后会显示在首页</li>
                  <li>• 支持 JPG、PNG、WEBP 格式，单张最大 10MB</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isUploading || files.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    上传中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UploadIcon className="w-5 h-5" />
                    确认上传
                  </span>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
