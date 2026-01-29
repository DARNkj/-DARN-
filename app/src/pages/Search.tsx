import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search as SearchIcon, 
  MapPin, 
  Tag, 
  Filter, 
  X,
  Heart,
  Eye,
  ChevronDown,
  Grid3X3,
  LayoutList
} from 'lucide-react';
import type { Photo } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SearchProps {
  photoStore: {
    photos: Photo[];
    searchPhotos: (query: string, filters?: { airport?: string; tags?: string[] }) => Photo[];
  };
}

const Search = ({ photoStore }: SearchProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedAirport, setSelectedAirport] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'mostLiked'>('newest');

  // 获取所有机场和标签（用于筛选）
  const allAirports = useMemo(() => {
    const airports = new Set<string>();
    photoStore.photos.forEach(p => {
      if (p.status === 'approved') airports.add(p.airport);
    });
    return Array.from(airports).sort();
  }, [photoStore.photos]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photoStore.photos.forEach(p => {
      if (p.status === 'approved') p.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [photoStore.photos]);

  // 搜索照片
  const searchResults = useMemo(() => {
    let results = photoStore.searchPhotos(query, {
      airport: selectedAirport || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });

    // 排序
    switch (sortBy) {
      case 'newest':
        results = results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        results = results.sort((a, b) => b.views - a.views);
        break;
      case 'mostLiked':
        results = results.sort((a, b) => b.likes.length - a.likes.length);
        break;
    }

    return results;
  }, [photoStore, query, selectedAirport, selectedTags, sortBy]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  // 清除筛选
  const clearFilters = () => {
    setSelectedAirport('');
    setSelectedTags([]);
    setQuery('');
    setSearchParams({});
  };

  // 切换标签
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] via-white to-[#e8f4fc] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Changa One', Impact, sans-serif", fontStyle: 'italic' }}
          >
            搜索照片
          </h1>
          <p className="text-gray-600">通过机场、机型、标签等关键词搜索航空摄影作品</p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索机场、机型、航空公司..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-lg"
              />
            </div>
            <Button 
              type="submit"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#0084d9] to-[#00a8e8] text-white hover:opacity-90"
            >
              搜索
            </Button>
          </div>
        </motion.form>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Airport Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              机场：
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAirport('')}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedAirport === ''
                    ? 'bg-[#0084d9] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {allAirports.slice(0, 10).map(airport => (
                <button
                  key={airport}
                  onClick={() => setSelectedAirport(airport === selectedAirport ? '' : airport)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedAirport === airport
                      ? 'bg-[#0084d9] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {airport}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              标签：
            </span>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[#0084d9] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedAirport || selectedTags.length > 0 || query) && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-gray-500">已选筛选：</span>
              {query && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#0084d9]/10 text-[#0084d9]">
                  搜索: {query}
                  <button onClick={() => { setQuery(''); setSearchParams({}); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedAirport && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#0084d9]/10 text-[#0084d9]">
                  <MapPin className="w-3 h-3" />
                  {selectedAirport}
                  <button onClick={() => setSelectedAirport('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#0084d9]/10 text-[#0084d9]">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button onClick={() => toggleTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 ml-2"
              >
                清除全部
              </button>
            </div>
          )}
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-gray-600">
            找到 <span className="font-bold text-gray-900">{searchResults.length}</span> 张照片
          </p>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-xl">
                  <Filter className="w-4 h-4" />
                  {sortBy === 'newest' && '最新上传'}
                  {sortBy === 'popular' && '最多浏览'}
                  {sortBy === 'mostLiked' && '最多点赞'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  最新上传
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('popular')}>
                  最多浏览
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('mostLiked')}>
                  最多点赞
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode */}
            <div className="flex items-center border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#0084d9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#0084d9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {searchResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <SearchIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">未找到相关照片</h3>
            <p className="text-gray-500">尝试使用其他关键词或筛选条件</p>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' : 'space-y-4'}>
            {searchResults.map((photo, index) => (
              viewMode === 'grid' ? (
                <PhotoGridCard key={photo.id} photo={photo} index={index} />
              ) : (
                <PhotoListCard key={photo.id} photo={photo} index={index} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 网格视图卡片
const PhotoGridCard = ({ photo, index }: { photo: Photo; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group"
  >
    <Link to={`/photo/${photo.id}`}>
      <div className="card-glass overflow-hidden">
        <div className="relative aspect-square">
          <img
            src={photo.thumbnail || photo.url}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
            <h3 className="font-bold truncate">{photo.title}</h3>
            <p className="text-sm opacity-80">{photo.airport}</p>
          </div>
        </div>
        
        {/* Info Bar */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {photo.likes.length}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {photo.views}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(photo.createdAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// 列表视图卡片
const PhotoListCard = ({ photo, index }: { photo: Photo; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Link to={`/photo/${photo.id}`}>
      <div className="card-glass p-4 flex gap-4 group hover:shadow-lg transition-shadow">
        <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={photo.thumbnail || photo.url}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#0084d9] transition-colors">
            {photo.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{photo.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {photo.airport}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {photo.likes.length}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {photo.views}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default Search;
