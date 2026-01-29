import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  Eye,
  ChevronDown,
  Settings,
  Bell
} from 'lucide-react';
import { AppContext, FeedbackContext } from '@/App';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const context = useContext(AppContext);
  const feedbackContext = useContext(FeedbackContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentUser = context?.currentUser;
  const logout = context?.logout;
  const siteConfig = context?.siteConfig;
  const unreadCount = feedbackContext?.getUnreadCount() || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/search', label: '搜索' },
    { path: '/feedback', label: '反馈' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'nav-glass shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-10 h-10 rounded-xl overflow-hidden shadow-lg"
            >
              <img 
                src={siteConfig?.siteLogo || '/logo.png'} 
                alt="DARN" 
                className="w-full h-full object-contain bg-white"
              />
            </motion.div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              {siteConfig?.siteName || 'DARN飞影图传'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-[#0084d9] bg-[#0084d9]/10'
                    : 'text-gray-700 hover:text-[#0084d9] hover:bg-[#0084d9]/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <Link to="/upload">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-2 text-gray-700 hover:text-[#0084d9] hover:bg-[#0084d9]/5"
                  >
                    <Upload className="w-4 h-4" />
                    上传
                  </Button>
                </Link>

                {/* Admin Notifications */}
                {currentUser.role === 'admin' && (
                  <Link to="/admin">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-2 text-gray-700 hover:text-[#0084d9] hover:bg-[#0084d9]/5 relative"
                    >
                      <Bell className="w-4 h-4" />
                      消息
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="gap-2 pl-2 pr-3 h-10 rounded-xl hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0084d9] to-[#00a8e8] flex items-center justify-center text-white text-sm font-bold">
                        {currentUser.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {currentUser.username}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: getLevelColor(currentUser.level) }}
                        >
                          Lv.{currentUser.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getLevelName(currentUser.level)}
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        个人中心
                      </Link>
                    </DropdownMenuItem>

                    {currentUser.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="w-4 h-4" />
                            管理员后台
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/site-settings" className="flex items-center gap-2 cursor-pointer">
                            <Settings className="w-4 h-4" />
                            网站设置
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {(currentUser.role === 'admin' || currentUser.role === 'reviewer') && (
                      <DropdownMenuItem asChild>
                        <Link to="/reviewer" className="flex items-center gap-2 cursor-pointer">
                          <Eye className="w-4 h-4" />
                          审核中心
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-[#0084d9]"
                  >
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-[#0084d9] to-[#00a8e8] text-white hover:opacity-90"
                  >
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden nav-glass border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(link.path)
                      ? 'bg-[#0084d9]/10 text-[#0084d9]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {currentUser ? (
                <>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <Link
                      to="/upload"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                    >
                      <Upload className="w-5 h-5" />
                      上传照片
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-5 h-5" />
                      个人中心
                    </Link>
                    {currentUser.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                        >
                          <Shield className="w-5 h-5" />
                          管理员后台
                        </Link>
                        <Link
                          to="/site-settings"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="w-5 h-5" />
                          网站设置
                        </Link>
                      </>
                    )}
                    {(currentUser.role === 'admin' || currentUser.role === 'reviewer') && (
                      <Link
                        to="/reviewer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="w-5 h-5" />
                        审核中心
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      退出登录
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 pt-2 mt-2 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-center text-gray-700 hover:bg-gray-100"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-center bg-gradient-to-r from-[#0084d9] to-[#00a8e8] text-white"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// 辅助函数
const getLevelColor = (level: number) => {
  const colors = [
    '#94a3b8', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b',
    '#ef4444', '#ec4899', '#06b6d4', '#6366f1', '#fbbf24'
  ];
  return colors[level - 1] || colors[0];
};

const getLevelName = (level: number) => {
  const names = [
    '见习飞友', '初级飞友', '中级飞友', '高级飞友', '资深飞友',
    '飞行达人', '航空摄影师', '首席摄影师', '传奇飞友', '航空大师'
  ];
  return names[level - 1] || names[0];
};

export default Navbar;
