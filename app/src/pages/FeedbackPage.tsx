import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Bug, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { AppContext, FeedbackContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const FeedbackPage = () => {
  const context = useContext(AppContext);
  const feedbackContext = useContext(FeedbackContext);
  const siteConfig = context?.siteConfig;
  const currentUser = context?.currentUser;
  const addFeedback = feedbackContext?.addFeedback;

  const [formData, setFormData] = useState({
    type: 'suggestion' as 'suggestion' | 'bug' | 'complaint' | 'other',
    subject: '',
    content: '',
    email: currentUser?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    { id: 'suggestion', label: '功能建议', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50' },
    { id: 'bug', label: '问题反馈', icon: Bug, color: 'text-red-600 bg-red-50' },
    { id: 'complaint', label: '投诉举报', icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
    { id: 'other', label: '其他', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error('请输入主题');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('请输入内容');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('请输入联系邮箱');
      return;
    }

    setIsSubmitting(true);

    try {
      addFeedback?.({
        userId: currentUser?.id,
        username: currentUser?.username || '匿名用户',
        email: formData.email,
        type: formData.type,
        subject: formData.subject,
        content: formData.content,
      });

      setIsSubmitted(true);
      toast.success('反馈提交成功，我们会尽快处理！');
    } catch (error) {
      toast.error('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-glass p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">感谢您的反馈！</h2>
            <p className="text-gray-600 mb-8">
              我们已收到您的{feedbackTypes.find(t => t.id === formData.type)?.label}，
              会尽快进行处理。如有需要，我们会通过邮件与您联系。
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/">
                <Button className="rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8]">
                  返回首页
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    type: 'suggestion',
                    subject: '',
                    content: '',
                    email: currentUser?.email || '',
                  });
                }}
                className="rounded-xl"
              >
                继续反馈
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            意见反馈
          </h1>
          <p className="text-gray-600 text-lg">
            您的建议是我们进步的动力，欢迎提出宝贵意见
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="card-glass p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    反馈类型
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {feedbackTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          formData.type === type.id
                            ? 'border-[#0084d9] bg-[#0084d9]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                          <type.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-700">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系邮箱 *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="请输入您的邮箱地址"
                      className="pl-12 py-3 rounded-xl"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主题 *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="请简要描述您的反馈"
                    className="py-3 rounded-xl"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    详细内容 *
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="请详细描述您的问题或建议..."
                    rows={6}
                    className="rounded-xl resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      提交中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      提交反馈
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="card-glass p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">联系方式</h3>
              <div className="space-y-4">
                <a 
                  href={`mailto:${siteConfig?.contactEmail || '3833423187@qq.com'}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">邮件反馈</p>
                    <p className="text-sm text-gray-500">{siteConfig?.contactEmail || '3833423187@qq.com'}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
              </div>
            </div>

            <div className="card-glass p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">反馈须知</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  请尽量详细描述您的问题或建议
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  提供有效的联系方式以便我们回复
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  我们会尽快处理您的反馈
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
