import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import { AppContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Login = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const siteConfig = context?.siteConfig;
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = context?.login(formData.username, formData.password);
      
      if (result?.success) {
        toast.success('登录成功！');
        
        if (result.user?.role === 'admin') {
          navigate('/admin');
        } else if (result.user?.role === 'reviewer') {
          navigate('/reviewer');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result?.message || '登录失败');
      }
    } catch (error) {
      toast.error('登录出错，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/background.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center shadow-lg"
            >
              <img 
                src={siteConfig?.siteLogo || '/logo.png'} 
                alt="DARN" 
                className="w-12 h-12 object-contain"
              />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              欢迎回来
            </h2>
            <p className="text-gray-600">登录{siteConfig?.siteName || 'DARN飞影图传'}，继续你的航空摄影之旅</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0084d9] focus:ring-[#0084d9]/20 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#0084d9] focus:ring-[#0084d9]/20 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-[#0084d9] focus:ring-[#0084d9]" />
                <span className="text-gray-600">记住我</span>
              </label>
              <Link to="/forgot-password" className="text-[#0084d9] hover:text-[#0066cc]">
                忘记密码？
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  登录
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            还没有账号？{' '}
            <Link to="/register" className="text-[#0084d9] hover:text-[#0066cc] font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
