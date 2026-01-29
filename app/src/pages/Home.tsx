import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Users, 
  Search, 
  Heart, 
  MessageCircle, 
  Eye,
  ArrowRight,
  Camera,
  Star,
  Plane
} from 'lucide-react';
import { AppContext } from '@/App';
import type { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HomeProps {
  photoStore: {
    photos: Photo[];
    searchPhotos: (query: string) => Photo[];
  };
}

const Home = ({ photoStore }: HomeProps) => {
  const context = useContext(AppContext);
  const currentUser = context?.currentUser;
  const siteConfig = context?.siteConfig;
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ users: 0, photos: 0, likes: 0, views: 0 });

  const approvedPhotos = photoStore.photos.filter(p => p.status === 'approved').slice(0, 8);
  
  const hotPhotos = [...photoStore.photos]
    .filter(p => p.status === 'approved')
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('darn-users') || '[]').length;
    const photos = photoStore.photos.length;
    const likes = photoStore.photos.reduce((sum, p) => sum + p.likes.length, 0);
    const views = photoStore.photos.reduce((sum, p) => sum + p.views, 0);
    setStats({ users, photos, likes, views });
  }, [photoStore.photos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-white"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 mb-6"
              >
                <Plane className="w-4 h-4" />
                <span className="text-sm font-medium">{siteConfig?.siteName || 'DARN飞影图传'}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              >
                捕捉航空
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#0084d9]">
                  之美
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-lg"
              >
                加入{siteConfig?.siteName || 'DARN飞影图传'}，与全球飞友分享你的航空摄影作品。
                上传、发现、收藏最精彩的飞机照片。
              </motion.p>

              {/* Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                onSubmit={handleSearch}
                className="flex gap-2 max-w-md mb-8"
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="搜索机场、机型、标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0084d9]"
                  />
                </div>
                <Button 
                  type="submit"
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8] text-white hover:opacity-90 transition-opacity"
                >
                  搜索
                </Button>
              </motion.form>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                {currentUser ? (
                  <Link to="/upload">
                    <Button 
                      size="lg"
                      className="gap-2 bg-white text-[#0084d9] hover:bg-white/95 rounded-xl px-8 font-semibold"
                    >
                      <Upload className="w-5 h-5" />
                      上传照片
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button 
                      size="lg"
                      className="gap-2 bg-white text-[#0084d9] hover:bg-white/95 rounded-xl px-8 font-semibold"
                    >
                      <Users className="w-5 h-5" />
                      加入社区
                    </Button>
                  </Link>
                )}
                <Link to="/search">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="gap-2 border-white/40 text-white hover:bg-white/15 rounded-xl px-8"
                  >
                    <Camera className="w-5 h-5" />
                    浏览图库
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              <StatCard 
                icon={Users} 
                value={stats.users} 
                label="注册用户" 
                delay={0.5}
              />
              <StatCard 
                icon={Camera} 
                value={stats.photos} 
                label="上传照片" 
                delay={0.6}
              />
              <StatCard 
                icon={Heart} 
                value={stats.likes} 
                label="累计点赞" 
                delay={0.7}
              />
              <StatCard 
                icon={Eye} 
                value={stats.views} 
                label="总浏览量" 
                delay={0.8}
              />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              平台特色
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              为飞友打造的专业图传社区，提供全方位的航空摄影体验
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Upload}
              title="轻松上传"
              description="支持批量上传，自动识别机场信息，快速分享你的航空摄影作品"
              delay={0}
            />
            <FeatureCard
              icon={Search}
              title="智能搜索"
              description="通过机场、机型、航空公司等多维度搜索，快速找到想要的图片"
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              title="飞友社区"
              description="结识志同道合的飞友，交流拍摄技巧，分享航空资讯"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Latest Photos Section */}
      <section className="py-24 bg-gradient-to-br from-[#0084d9]/5 to-[#00a8e8]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                最新上传
              </h2>
              <p className="text-gray-600">发现飞友们最新分享的航空摄影作品</p>
            </div>
            <Link 
              to="/search"
              className="hidden md:flex items-center gap-2 text-[#0084d9] hover:text-[#0066cc] font-medium"
            >
              查看更多
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {approvedPhotos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/search">
              <Button variant="outline" className="gap-2">
                查看更多
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Photos Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                热门照片
              </h2>
              <p className="text-gray-600">浏览量最高的精选航空摄影作品</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700">
              <Star className="w-5 h-5 fill-orange-500" />
              <span className="font-medium">精选</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotPhotos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} featured={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0084d9] to-[#00a8e8]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              准备好分享你的作品了吗？
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              加入{siteConfig?.siteName || 'DARN飞影图传'}社区，与全球飞友一起记录航空之美
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {currentUser ? (
                <Link to="/upload">
                  <Button 
                    size="lg"
                    className="gap-2 bg-white text-[#0084d9] hover:bg-white/95 rounded-xl px-8 font-semibold"
                  >
                    <Upload className="w-5 h-5" />
                    立即上传
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button 
                    size="lg"
                    className="gap-2 bg-white text-[#0084d9] hover:bg-white/95 rounded-xl px-8 font-semibold"
                  >
                    <Users className="w-5 h-5" />
                    免费注册
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ icon: Icon, value, label, delay }: { icon: any, value: number, label: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="glass rounded-2xl p-6 text-white"
  >
    <Icon className="w-8 h-8 mb-4 opacity-90" />
    <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
    <div className="text-sm opacity-80">{label}</div>
  </motion.div>
);

// 特色卡片组件
const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className="card-glass p-8 text-center group"
  >
    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0084d9]/10 to-[#00a8e8]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-8 h-8 text-[#0084d9]" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

// 照片卡片组件
const PhotoCard = ({ photo, index, featured = false }: { photo: Photo, index: number, featured?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    className={`group relative overflow-hidden rounded-2xl bg-gray-100 ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
  >
    <Link to={`/photo/${photo.id}`}>
      <div className={`relative ${featured ? 'aspect-square md:aspect-auto md:h-full' : 'aspect-square'}`}>
        <img
          src={photo.thumbnail || photo.url}
          alt={photo.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold truncate">{photo.title}</h3>
          <p className="text-sm opacity-90">{photo.airport}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {photo.likes.length}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {photo.comments.length}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {photo.views}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {photo.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2 py-1 rounded-full text-xs bg-white/95 text-gray-800 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  </motion.div>
);

export default Home;
