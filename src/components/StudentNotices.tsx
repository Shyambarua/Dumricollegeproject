import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Calendar,
  Clock,
  Users,
  Eye,
  Pin,
  AlertCircle,
  CheckCircle2,
  Info,
  Megaphone,
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { PortalLayout } from './PortalLayout';
import { getNoticeCategories, getNoticePriorities, getNoticesByAudience } from '../api/noticeApi';
import type { NoticeCategory as NoticeCategoryDto, NoticePriority, NoticeResponse } from '../types/noticeTypes';

type NoticeCategory = 'general' | 'urgent' | 'academic' | 'event' | 'holiday';

type NoticeRow = {
  id: number;
  title: string;
  description: string;
  category: NoticeCategory;
  categoryLabel: string;
  priorityLabel: string;
  targetAudience: string[];
  date: string;
  author: string;
  isPinned: boolean;
  views: number;
};

const PIN_OVERRIDES_KEY = 'noticePinOverrides';

function readPinOverrides(): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(PIN_OVERRIDES_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, boolean>;
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.entries(parsed).reduce<Record<number, boolean>>((accumulator, [key, value]) => {
      const id = Number(key);
      if (!Number.isNaN(id)) {
        accumulator[id] = Boolean(value);
      }
      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

function writePinOverrides(overrides: Record<number, boolean>) {
  localStorage.setItem(PIN_OVERRIDES_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('notice-pin-updated'));
}

function normalizeLabel(value: unknown): string {
  return String(value ?? '').trim();
}

function resolveCategoryName(
  notice: NoticeResponse,
  categoryLookup: Map<number, string>
): string {
  const record = notice as unknown as Record<string, unknown>;
  const directValue = normalizeLabel(record.category ?? record.categoryName);

  if (directValue) return directValue;

  const categoryId = Number(notice.categoryId ?? record.categoryId ?? NaN);
  if (!Number.isNaN(categoryId) && categoryLookup.has(categoryId)) {
    return categoryLookup.get(categoryId) ?? 'General';
  }

  return 'General';
}

function resolvePriorityName(
  notice: NoticeResponse,
  priorityLookup: Map<number, string>
): string {
  const record = notice as unknown as Record<string, unknown>;
  const directValue = normalizeLabel(record.priority ?? record.priorityName);

  if (directValue) return directValue;

  const priorityId = Number(notice.priorityId ?? record.priorityId ?? NaN);
  if (!Number.isNaN(priorityId) && priorityLookup.has(priorityId)) {
    return priorityLookup.get(priorityId) ?? 'Normal';
  }

  return 'Normal';
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
}

function mapNoticeRow(
  notice: NoticeResponse,
  categoryLookup: Map<number, string>,
  priorityLookup: Map<number, string>
): NoticeRow {
  const record = notice as unknown as Record<string, unknown>;

  const categoryLabel = resolveCategoryName(notice, categoryLookup);
  const priorityLabel = resolvePriorityName(notice, priorityLookup);

  const rawCategory = categoryLabel.toLowerCase();
  const rawPriority = priorityLabel.toLowerCase();
  const category: NoticeCategory = rawCategory.includes('urgent')
    ? 'urgent'
    : rawCategory.includes('academic') || rawCategory.includes('exam') || rawPriority.includes('academic')
      ? 'academic'
      : rawCategory.includes('event')
        ? 'event'
        : rawCategory.includes('holiday')
          ? 'holiday'
          : 'general';

  const audienceValue = String(record.targetAudience ?? record.targetAudienceName ?? 'All Classes');

  return {
    id: Number(notice.noticeId ?? record.id ?? 0),
    title: String(notice.noticeTitle ?? record.title ?? 'Untitled Notice'),
    description: String(notice.noticeContent ?? record.content ?? '-'),
    category,
    categoryLabel,
    priorityLabel,
    targetAudience: audienceValue ? [audienceValue] : ['All Classes'],
    date: formatDate(notice.publishDate ?? String(record.postedDate ?? '')),
    author: String(record.postedBy ?? record.author ?? 'Administration'),
    isPinned: Boolean(record.isPinned ?? false),
    views: Number(record.views ?? 0),
  };
}

function isUrgentNotice(notice: NoticeRow): boolean {
  return /urgent|high|critical/i.test(notice.priorityLabel) || /urgent/i.test(notice.categoryLabel);
}

function isAcademicNotice(notice: NoticeRow): boolean {
  return /academic|exam/i.test(notice.categoryLabel) || /academic|exam/i.test(notice.priorityLabel);
}

export function StudentNotices() {
  const [noticeData, setNoticeData] = useState<NoticeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noticeFetchError, setNoticeFetchError] = useState('');
  const [filter, setFilter] = useState<'all' | 'urgent' | 'academic' | 'pinned' | 'month'>('all');

  useEffect(() => {
    let mounted = true;

    const loadNotices = async () => {
      try {
        setIsLoading(true);
        setNoticeFetchError('');
        const [notices, categories, priorities] = await Promise.all([
          getNoticesByAudience(3),
          getNoticeCategories(),
          getNoticePriorities(),
        ]);
        if (!mounted) return;

        const nextCategoryLookup = new Map<number, string>(
          (categories as NoticeCategoryDto[]).map((category) => [category.categoryId, category.categoryName])
        );
        const nextPriorityLookup = new Map<number, string>(
          (priorities as NoticePriority[]).map((priority) => [priority.priorityId, priority.priorityName])
        );

        const overrides = readPinOverrides();
        setNoticeData(
          notices.map((notice) => mapNoticeRow(notice, nextCategoryLookup, nextPriorityLookup)).map((notice) => ({
            ...notice,
            isPinned: Object.prototype.hasOwnProperty.call(overrides, notice.id)
              ? overrides[notice.id]
              : notice.isPinned,
          }))
        );
      } catch (error) {
        if (!mounted) return;
        setNoticeFetchError(error instanceof Error ? error.message : 'Failed to fetch notices');
        setNoticeData([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadNotices();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredNotices = noticeData.filter((notice) => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return isUrgentNotice(notice);
    if (filter === 'academic') return isAcademicNotice(notice);
    if (filter === 'pinned') return notice.isPinned;
    if (filter === 'month') {
      const noticeDate = new Date(notice.date);
      const now = new Date();
      return noticeDate.getMonth() === now.getMonth() && noticeDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const pinnedNotices = filteredNotices.filter((notice) => notice.isPinned);
  const regularNotices = filteredNotices.filter((notice) => !notice.isPinned);

  const academicCount = noticeData.filter(isAcademicNotice).length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'academic':
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

  const getPriorityColor = (priority: string) => {
    const normalized = priority.toLowerCase();
    if (normalized.includes('urgent') || normalized.includes('high') || normalized.includes('critical')) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (normalized.includes('academic') || normalized.includes('exam')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'academic':
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
    const overrides = readPinOverrides();
    const nextPinnedState = !noticeData.find((notice) => notice.id === id)?.isPinned;
    overrides[id] = nextPinnedState;
    writePinOverrides(overrides);

    setNoticeData((currentNotices) =>
      currentNotices.map((notice) =>
        notice.id === id ? { ...notice, isPinned: nextPinnedState } : notice
      )
    );
  };

  const urgentCount = noticeData.filter(isUrgentNotice).length;
  const pinnedCount = noticeData.filter((notice) => notice.isPinned).length;
  const thisMonthCount = noticeData.filter((notice) => new Date(notice.date).getMonth() === new Date().getMonth()).length;

  const filterButtonClass = (active: boolean, activeClass: string, inactiveClass: string) =>
    active ? activeClass : inactiveClass;

  return (
    <PortalLayout
      role="student"
      userName="Rohan Kumar"
      userRole="Grade 10-A"
      pageTitle="Notices & Announcements"
      breadcrumbs={["Home", "Student", "Notices"]}
    >
      <div className="space-y-6">
        {isLoading && (
          <Card className="p-4 bg-white border-amber-200 shadow-md">
            <p className="text-slate-600">Loading notices...</p>
          </Card>
        )}

        {noticeFetchError && !isLoading && (
          <Card className="p-4 bg-red-50 border-red-200 shadow-md">
            <p className="text-red-700">{noticeFetchError}</p>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05 }}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setFilter('all')}
              onKeyDown={(event) => event.key === 'Enter' && setFilter('all')}
              className={`bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg p-4 cursor-pointer ring-offset-2 ${filter === 'all' ? 'ring-2 ring-amber-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Total</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">All Notices</p>
              <h3 className="text-2xl font-bold text-white">{noticeData.length}</h3>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.05 }}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setFilter('urgent')}
              onKeyDown={(event) => event.key === 'Enter' && setFilter('urgent')}
              className={`bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg p-4 cursor-pointer ring-offset-2 ${filter === 'urgent' ? 'ring-2 ring-red-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Priority</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">Urgent</p>
              <h3 className="text-2xl font-bold text-white">{urgentCount}</h3>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.05 }}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setFilter('academic')}
              onKeyDown={(event) => event.key === 'Enter' && setFilter('academic')}
              className={`bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg p-4 cursor-pointer ring-offset-2 ${filter === 'academic' ? 'ring-2 ring-blue-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Academic</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">Academic</p>
              <h3 className="text-2xl font-bold text-white">{academicCount}</h3>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.05 }}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setFilter('pinned')}
              onKeyDown={(event) => event.key === 'Enter' && setFilter('pinned')}
              className={`bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg p-4 cursor-pointer ring-offset-2 ${filter === 'pinned' ? 'ring-2 ring-purple-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Activity</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">Pinned</p>
              <h3 className="text-2xl font-bold text-white">{pinnedCount}</h3>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileHover={{ scale: 1.05 }}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setFilter('month')}
              onKeyDown={(event) => event.key === 'Enter' && setFilter('month')}
              className={`bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg p-4 cursor-pointer ring-offset-2 ${filter === 'month' ? 'ring-2 ring-emerald-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 font-semibold backdrop-blur-sm text-xs">Recent</Badge>
              </div>
              <p className="text-xs text-white/90 font-semibold mb-1">This Month</p>
              <h3 className="text-2xl font-bold text-white">{thisMonthCount}</h3>
            </Card>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <Card className="p-4 bg-white border-amber-200 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className={filterButtonClass(filter === 'all', 'bg-amber-500 hover:bg-amber-600', 'border-amber-300 text-amber-600 hover:bg-amber-50')}>
                All Notices
              </Button>
              <Button variant={filter === 'urgent' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('urgent')} className={filterButtonClass(filter === 'urgent', 'bg-red-500 hover:bg-red-600', 'border-red-300 text-red-600 hover:bg-red-50')}>
                Urgent
              </Button>
              <Button variant={filter === 'academic' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('academic')} className={filterButtonClass(filter === 'academic', 'bg-blue-500 hover:bg-blue-600', 'border-blue-300 text-blue-600 hover:bg-blue-50')}>
                Academic
              </Button>
              <Button variant={filter === 'pinned' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pinned')} className={filterButtonClass(filter === 'pinned', 'bg-purple-500 hover:bg-purple-600', 'border-purple-300 text-purple-600 hover:bg-purple-50')}>
                Pinned
              </Button>
              <Button variant={filter === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('month')} className={filterButtonClass(filter === 'month', 'bg-emerald-500 hover:bg-emerald-600', 'border-emerald-300 text-emerald-600 hover:bg-emerald-50')}>
                This Month
              </Button>
            </div>
          </div>
        </Card>

        {pinnedNotices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900">Pinned Notices</h2>
            </div>
            {pinnedNotices.map((notice, index) => (
              <motion.div key={notice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02, y: -4 }}>
                <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notice.category === 'urgent' ? 'bg-red-100' : notice.category === 'academic' ? 'bg-blue-100' : notice.category === 'event' ? 'bg-purple-100' : notice.category === 'holiday' ? 'bg-green-100' : 'bg-amber-100'}`}>
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
                        <Badge variant="outline" className={getPriorityColor(notice.priorityLabel)}>
                          <span className="capitalize">{notice.priorityLabel}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          {new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                        className={`gap-2 ${notice.isPinned ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-slate-600 hover:bg-slate-100'}`}
                        title={notice.isPinned ? 'Unpin notice' : 'Pin notice'}
                      >
                        <Pin className="w-4 h-4" fill={notice.isPinned ? 'currentColor' : 'none'} />
                        {notice.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
                    </div>
                  </div>

                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {regularNotices.length > 0 && (
          <div className="space-y-4">
            {pinnedNotices.length > 0 && <h2 className="text-xl font-bold text-slate-900">All Notices</h2>}
            {regularNotices.map((notice, index) => (
              <motion.div key={notice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + pinnedNotices.length) * 0.1 }} whileHover={{ scale: 1.02, y: -4 }}>
                <Card className="bg-white border-amber-200 shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notice.category === 'urgent' ? 'bg-red-100' : notice.category === 'academic' ? 'bg-blue-100' : notice.category === 'event' ? 'bg-purple-100' : notice.category === 'holiday' ? 'bg-green-100' : 'bg-amber-100'}`}>
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
                        <Badge variant="outline" className={getPriorityColor(notice.priorityLabel)}>
                          <span className="capitalize">{notice.priorityLabel}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          {new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                        className={`gap-2 ${notice.isPinned ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                        title={notice.isPinned ? 'Unpin notice' : 'Pin notice'}
                      >
                        <Pin className="w-4 h-4" fill={notice.isPinned ? 'currentColor' : 'none'} />
                        {notice.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && !noticeFetchError && noticeData.length === 0 && (
          <Card className="p-6 bg-white border-amber-200 shadow-md">
            <p className="text-slate-600">No notices available.</p>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}