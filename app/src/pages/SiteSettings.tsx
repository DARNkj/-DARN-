import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Database, 
  ToggleLeft,
  AlertTriangle
} from 'lucide-react';
import { AppContext, FeedbackContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const SiteSettings = () => {
  const context = useContext(AppContext);
  const feedbackContext = useContext(FeedbackContext);
  const siteConfig = context?.siteConfig;
  const updateSiteConfig = context?.updateSiteConfig;
  const feedbacks = feedbackContext?.feedbacks || [];

  const [config, setConfig] = useState({
    siteName: siteConfig?.siteName || 'DARN飞影图传',
    siteLogo: siteConfig?.siteLogo || '/logo.png',
    copyright: siteConfig?.copyright || '©达人云端运算',
    contactEmail: siteConfig?.contactEmail || '3833423187@qq.com',
    enableRegistration: siteConfig?.enableRegistration ?? true,
    enableUpload: siteConfig?.enableUpload ?? true,
    maxUploadSize: siteConfig?.maxUploadSize || 10,
    requireReview: siteConfig?.requireReview ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSiteConfig?.(config);
      toast.success('网站设置已保存');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const unreadFeedbacks = feedbacks.filter(f => f.status === 'unread');
  const readFeedbacks = feedbacks.filter(f => f.status === 'read');
  const repliedFeedbacks = feedbacks.filter(f => f.status === 'replied');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                网站设置
              </h1>
              <p className="text-gray-500">管理网站配置和数据</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="general" className="rounded-xl gap-2">
              <Globe className="w-4 h-4" />
              基本设置
            </TabsTrigger>
            <TabsTrigger value="features" className="rounded-xl gap-2">
              <ToggleLeft className="w-4 h-4" />
              功能开关
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl gap-2">
              <Mail className="w-4 h-4" />
              用户反馈
              {unreadFeedbacks.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                  {unreadFeedbacks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-xl gap-2">
              <Database className="w-4 h-4" />
              数据管理
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">基本设置</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    网站名称
                  </label>
                  <Input
                    value={config.siteName}
                    onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                    className="max-w-md rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    网站Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={config.siteLogo} 
                      alt="Logo" 
                      className="w-16 h-16 rounded-xl object-contain bg-white border"
                    />
                    <Input
                      value={config.siteLogo}
                      onChange={(e) => setConfig({ ...config, siteLogo: e.target.value })}
                      className="max-w-md rounded-xl"
                      placeholder="Logo路径"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    版权信息
                  </label>
                  <Input
                    value={config.copyright}
                    onChange={(e) => setConfig({ ...config, copyright: e.target.value })}
                    className="max-w-md rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系邮箱
                  </label>
                  <Input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                    className="max-w-md rounded-xl"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8]"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        保存中...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        保存设置
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Feature Toggles */}
          <TabsContent value="features">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">功能开关</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">用户注册</p>
                    <p className="text-sm text-gray-500">允许新用户注册账号</p>
                  </div>
                  <Switch
                    checked={config.enableRegistration}
                    onCheckedChange={(checked) => setConfig({ ...config, enableRegistration: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">照片上传</p>
                    <p className="text-sm text-gray-500">允许用户上传照片</p>
                  </div>
                  <Switch
                    checked={config.enableUpload}
                    onCheckedChange={(checked) => setConfig({ ...config, enableUpload: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">照片审核</p>
                    <p className="text-sm text-gray-500">上传的照片需要审核后才能显示</p>
                  </div>
                  <Switch
                    checked={config.requireReview}
                    onCheckedChange={(checked) => setConfig({ ...config, requireReview: checked })}
                  />
                </div>

                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">最大上传大小</p>
                      <p className="text-sm text-gray-500">单张照片最大大小（MB）</p>
                    </div>
                    <Input
                      type="number"
                      value={config.maxUploadSize}
                      onChange={(e) => setConfig({ ...config, maxUploadSize: parseInt(e.target.value) || 10 })}
                      className="w-24 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8]"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        保存中...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        保存设置
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Feedback Management */}
          <TabsContent value="feedback">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{unreadFeedbacks.length}</div>
                  <div className="text-sm text-gray-500">未读</div>
                </div>
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{readFeedbacks.length}</div>
                  <div className="text-sm text-gray-500">已读</div>
                </div>
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{repliedFeedbacks.length}</div>
                  <div className="text-sm text-gray-500">已回复</div>
                </div>
              </div>

              {/* Feedback List */}
              <div className="card-glass p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">用户反馈</h3>
                {feedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">暂无反馈</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div 
                        key={feedback.id} 
                        className={`p-4 rounded-xl border ${
                          feedback.status === 'unread' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                feedback.type === 'suggestion' ? 'bg-yellow-100 text-yellow-700' :
                                feedback.type === 'bug' ? 'bg-red-100 text-red-700' :
                                feedback.type === 'complaint' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {feedback.type === 'suggestion' ? '建议' :
                                 feedback.type === 'bug' ? '问题' :
                                 feedback.type === 'complaint' ? '投诉' : '其他'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                feedback.status === 'unread' ? 'bg-red-100 text-red-700' :
                                feedback.status === 'read' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {feedback.status === 'unread' ? '未读' :
                                 feedback.status === 'read' ? '已读' : '已回复'}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900">{feedback.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1">{feedback.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>来自: {feedback.username}</span>
                              <span>邮箱: {feedback.email}</span>
                              <span>{new Date(feedback.createdAt).toLocaleString('zh-CN')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {feedback.status === 'unread' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => feedbackContext?.markAsRead(feedback.id)}
                              >
                                标记已读
                              </Button>
                            )}
                          </div>
                        </div>
                        {feedback.reply && (
                          <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm text-green-800">
                              <span className="font-medium">回复:</span> {feedback.reply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card-glass p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">数据管理</h3>
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">警告</p>
                        <p className="text-sm text-yellow-700">
                          以下操作会清除网站数据，请谨慎操作。建议先备份重要数据。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">清除所有照片</h4>
                      <p className="text-sm text-gray-500 mb-4">删除所有用户上传的照片数据</p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('确定要删除所有照片吗？此操作不可恢复。')) {
                            localStorage.removeItem('darn-photos');
                            toast.success('照片数据已清除');
                            window.location.reload();
                          }
                        }}
                      >
                        清除照片
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">清除所有反馈</h4>
                      <p className="text-sm text-gray-500 mb-4">删除所有用户反馈数据</p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('确定要删除所有反馈吗？此操作不可恢复。')) {
                            localStorage.removeItem('darn-feedbacks');
                            toast.success('反馈数据已清除');
                            window.location.reload();
                          }
                        }}
                      >
                        清除反馈
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">重置网站设置</h4>
                      <p className="text-sm text-gray-500 mb-4">恢复网站默认设置</p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('确定要重置网站设置吗？')) {
                            localStorage.removeItem('darn-site-config');
                            toast.success('网站设置已重置');
                            window.location.reload();
                          }
                        }}
                      >
                        重置设置
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                      <h4 className="font-medium text-red-900 mb-2">清除所有数据</h4>
                      <p className="text-sm text-red-600 mb-4">清除所有数据，包括用户、照片、反馈等</p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
                            localStorage.clear();
                            toast.success('所有数据已清除');
                            window.location.href = '/';
                          }
                        }}
                      >
                        清除所有数据
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteSettings;
