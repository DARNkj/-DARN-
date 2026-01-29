import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Heart, Github, Twitter, Mail } from 'lucide-react';
import { AppContext } from '@/App';

const Footer = () => {
  const context = useContext(AppContext);
  const siteConfig = context?.siteConfig;
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    平台: [
      { label: '首页', href: '/' },
      { label: '搜索', href: '/search' },
      { label: '上传', href: '/upload' },
    ],
    支持: [
      { label: '反馈问题', href: '/feedback' },
      { label: '联系我们', href: `mailto:${siteConfig?.contactEmail || '3833423187@qq.com'}` },
    ],
    关于: [
      { label: '用户协议', href: '#' },
      { label: '隐私政策', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src={siteConfig?.siteLogo || '/logo.png'} 
                  alt="DARN" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-2xl font-bold">
                {siteConfig?.siteName || 'DARN飞影图传'}
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              DARN飞影图传是专为航空摄影爱好者打造的图传社区，
              让每一张精彩的航空照片都能找到欣赏它的人。
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={Github} />
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href={`mailto:${siteConfig?.contactEmail || '3833423187@qq.com'}`} icon={Mail} />
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-lg mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            {siteConfig?.copyright || '©达人云端运算'} {currentYear}
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for aviation enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon: Icon }: { href: string; icon: any }) => (
  <a
    href={href}
    className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#0084d9] hover:text-white transition-all"
  >
    <Icon className="w-5 h-5" />
  </a>
);

export default Footer;
