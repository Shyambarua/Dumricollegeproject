import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  Eye,
  Pin,
  AlertCircle,
  CheckCircle2,
  Info,
  Megaphone,
} from 'lucide-react';
import { Card } from './ui/card';
import { PortalLayout } from './PortalLayout';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { getNoticesByAudience } from '../api/noticeApi';
import type { NoticeResponse } from '../types/noticeTypes';

interface Notice {
  id: number;
  title: string;
  description: string;
  category: 'general' | 'urgent' | 'exam' | 'event' | 'holiday';
  targetAudience: string[];
  date: string;
  author: string;
  isPinned: boolean;
  views: number;
}

function formatDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split('T')[0];
}

function normalizeCategory(value: unknown): Notice['category'] {
  const category = String(value ?? 'general').toLowerCase();
  if (category.includes('urgent')) return 'urgent';
  if (category.includes('exam')) return 'exam';
  if (category.includes('event')) return 'event';
  if (category.includes('holiday')) return 'holiday';
  return 'general';
}

function mapNotice(notice: NoticeResponse): Notice {
  const record = notice as unknown as Record<string, unknown>;
  const audienceValue = String(record.targetAudience ?? record.targetAudienceName ?? 'All Classes');

  return {
    id: Number(notice.noticeId ?? record.id ?? 0),
    title: String(notice.noticeTitle ?? record.title ?? 'Untitled Notice'),
    description: String(notice.noticeContent ?? record.content ?? '-'),
    category: normalizeCategory(record.category ?? record.categoryName),
    targetAudience: audienceValue ? [audienceValue] : ['All Classes'],
    date: formatDate(notice.publishDate ?? String(record.postedDate ?? '')),
    author: String(record.postedBy ?? record.author ?? 'Administration'),
    isPinned: Boolean(record.isPinned ?? false),
    views: Number(record.views ?? 0),
  };
}

export function TeacherNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState<'all' | 'general' | 'urgent' | 'exam' | 'event' | 'holiday'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await getNoticesByAudience(2);
        setNotices(data.map(mapNotice));
      } catch (loadError) {
        console.error('Failed to load teacher notices:', loadError);
        setNotices([]);
        setError('Unable to load teacher notices right now.');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotices();
  }, []);

  const filteredNotices = filter === 'all'
    ? notices
    : notices.filter((notice) => notice.category === filter);

  const pinnedNotices = filteredNotices.filter((notice) => notice.isPinned);
  const regularNotices = filteredNotices.filter((notice) => !notice.isPinned);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'exam':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'event':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'holiday':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'general':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'exam':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'event':
        return <Megaphone className="w-4 h-4" />;
      case 'holiday':
        return <Calendar className="w-4 h-4" />;
      case 'general':
        return <Info className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const togglePin = (id: number) => {
    setNotices((currentNotices) =>
      currentNotices.map((notice) =>
        notice.id === id ? { ...notice, isPinned: !notice.isPinned } : notice
      )
    );
  };

  return (
    <PortalLayout
      role="teacher"
      userName="Dr. Priya Sharma"
      userRole="Mathematics Teacher"
      pageTitle="Notices"
      breadcrumbs={["Home", "Teacher", "Notices"]}
    >
      <div className="space-y-6">
        {isLoading && (
          <Card className="p-4 bg-white border-amber-200 shadow-md">
            <p className="text-slate-600">Loading notices...</p>
          </Card>
        )}

        {error && !isLoading && (
          <Card className="p-4 bg-red-50 border-red-200 shadow-md">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Total</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">All Notices</p>
              <h3 className="text-2xl font-bold text-white">{notices.length}</h3>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Priority</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">Urgent</p>
              <h3 className="text-2xl font-bold text-white">
                {notices.filter((notice) => notice.category === 'urgent').length}
              </h3>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Academic</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">Exams</p>
              <h3 className="text-2xl font-bold text-white">
                {notices.filter((notice) => notice.category === 'exam').length}
              </h3>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Activity</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">Events</p>
              <h3 className="text-2xl font-bold text-white">
                {notices.filter((notice) => notice.category === 'event').length}
              </h3>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Recent</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">This Month</p>
              <h3 className="text-2xl font-bold text-white">
                {notices.filter((notice) => {
                  const noticeDate = new Date(notice.date);
                  const now = new Date();
                  return noticeDate.getMonth() === now.getMonth() && noticeDate.getFullYear() === now.getFullYear();
                }).length}
              </h3>
            </Card>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <Card className="p-4 bg-white border-amber-200 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 text-amber-600 hover:bg-amber-50'}
              >
                All Notices
              </Button>
              <Button
                variant={filter === 'urgent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('urgent')}
                className={filter === 'urgent' ? 'bg-red-500 hover:bg-red-600' : 'border-red-300 text-red-600 hover:bg-red-50'}
              >
                Urgent
              </Button>
              <Button
                variant={filter === 'exam' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('exam')}
                className={filter === 'exam' ? 'bg-blue-500 hover:bg-blue-600' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}
              >
                Exams
              </Button>
              <Button
                variant={filter === 'event' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('event')}
                className={filter === 'event' ? 'bg-purple-500 hover:bg-purple-600' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}
              >
                Events
              </Button>
              <Button
                variant={filter === 'holiday' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('holiday')}
                className={filter === 'holiday' ? 'bg-green-500 hover:bg-green-600' : 'border-green-300 text-green-600 hover:bg-green-50'}
              >
                Holidays
              </Button>
            </div>
          </div>
        </Card>

        {/* Pinned Notices */}
        {pinnedNotices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900">Pinned Notices</h2>
            </div>
            {pinnedNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notice.category === 'urgent' ? 'bg-red-100' : notice.category === 'exam' ? 'bg-blue-100' : notice.category === 'event' ? 'bg-purple-100' : notice.category === 'holiday' ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {getCategoryIcon(notice.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{notice.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{notice.description}</p>
                        </div>
                        <Badge variant="outline" className={getCategoryColor(notice.category)}>
                          {getCategoryIcon(notice.category)}
                          <span className="ml-1 capitalize">{notice.category}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          {new Date(notice.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-500" />
                          {notice.targetAudience.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-amber-500" />
                          {notice.views} views
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(notice.id)}
                        className="text-amber-600 hover:bg-amber-100"
                      >
                        <Pin className="w-4 h-4 fill-amber-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Regular Notices */}
        {regularNotices.length > 0 && (
          <div className="space-y-4">
            {pinnedNotices.length > 0 && <h2 className="text-xl font-bold text-slate-900">All Notices</h2>}
            {regularNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + pinnedNotices.length) * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="bg-white border-amber-200 shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notice.category === 'urgent' ? 'bg-red-100' : notice.category === 'exam' ? 'bg-blue-100' : notice.category === 'event' ? 'bg-purple-100' : notice.category === 'holiday' ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {getCategoryIcon(notice.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{notice.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{notice.description}</p>
                        </div>
                        <Badge variant="outline" className={getCategoryColor(notice.category)}>
                          {getCategoryIcon(notice.category)}
                          <span className="ml-1 capitalize">{notice.category}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          {new Date(notice.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-500" />
                          {notice.targetAudience.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-amber-500" />
                          {notice.views} views
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(notice.id)}
                        className="text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                      >
                        <Pin className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && !error && notices.length === 0 && (
          <Card className="p-6 bg-white border-amber-200 shadow-md">
            <p className="text-slate-600">No notices available.</p>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
