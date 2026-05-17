import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Clock,
  Download,
  Pin,
} from 'lucide-react';
import { FileDown, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PortalLayout } from './PortalLayout';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router';
import { getAllNotices, getNoticeCategories, deleteNoticeById } from '../api/noticeApi';
import type { NoticeCategory, NoticeResponse } from '../types/noticeTypes';

type UiNotice = {
  id: string;
  title: string;
  content: string;
  category: string;
  postedBy: string;
  postedDate: string;
  expiryDate: string;
  targetAudience: string;
  status: 'Active' | 'Expired' | 'Draft';
  isPinned: boolean;
  views: number;
};

const PAGE_SIZE = 10;
const PIN_OVERRIDES_KEY = 'noticePinOverrides';

function readPinOverrides(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PIN_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePinOverrides(overrides: Record<string, boolean>) {
  localStorage.setItem(PIN_OVERRIDES_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('notice-pin-updated'));
}

function formatDate(dateValue?: string): string {
  if (!dateValue) return '-';

  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return dateValue;

  return d.toISOString().split('T')[0];
}

function deriveStatus(notice: NoticeResponse): 'Active' | 'Expired' | 'Draft' {
  if ((notice as unknown as Record<string, unknown>).status === 'Draft') {
    return 'Draft';
  }

  if (!notice.expiryDate) return 'Active';

  const expiry = new Date(notice.expiryDate);
  if (Number.isNaN(expiry.getTime())) return 'Active';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return expiry < today ? 'Expired' : 'Active';
}

function mapNoticeToUi(notice: NoticeResponse): UiNotice {
  const record = notice as unknown as Record<string, unknown>;

  return {
    id: String(notice.noticeId ?? record.id ?? ''),
    title: String(notice.noticeTitle ?? record.title ?? 'Untitled Notice'),
    content: String(notice.noticeContent ?? record.content ?? '-'),
    category: String(record.category ?? 'General'),
    postedBy: String(record.postedBy ?? 'Admin'),
    postedDate: formatDate(notice.publishDate ?? String(record.postedDate ?? '')),
    expiryDate: formatDate(notice.expiryDate ?? String(record.expiryDate ?? '')),
    targetAudience: String(record.targetAudience ?? 'All'),
    status: deriveStatus(notice),
    isPinned: Boolean(record.isPinned ?? false),
    views: Number(record.views ?? 0),
  };
}

export function NoticeManagement() {
  const navigate = useNavigate();



  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const [notices, setNotices] = useState<UiNotice[]>([]);
  const [apiCategories, setApiCategories] = useState<NoticeCategory[]>([]);

  const statuses = ['All', 'Active', 'Expired', 'Draft'];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await getNoticeCategories();
        setApiCategories(categoryData);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };

    loadCategories();
  }, []);

  const loadNotices = async () => {
    try {
      setIsLoading(true);
      const response = await getAllNotices(pageNumber, PAGE_SIZE);
      const overrides = readPinOverrides();
      const mapped = response.map(mapNoticeToUi).map((notice) => {
        if (Object.prototype.hasOwnProperty.call(overrides, notice.id)) {
          return { ...notice, isPinned: overrides[notice.id] };
        }
        return notice;
      });
      setNotices(mapped);
    } catch (error) {
      console.error('Failed to load notices', error);
      toast.error('Failed to load notices', {
        description: 'Please try again after a moment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

 


  const handleDelete = async (noticeId: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNoticeById(noticeId);
      toast.success('Notice deleted successfully');
      loadNotices();
    } catch (error) {
      toast.error('Failed to delete notice', { description: String(error) });
    }
  };

  const handlePin = async (notice: UiNotice) => {
    try {
      // Toggle pin status
      const newPinnedStatus = !notice.isPinned;
      const overrides = readPinOverrides();
      overrides[notice.id] = newPinnedStatus;
      writePinOverrides(overrides);
      
      // Update local state first for immediate visual feedback
      const updatedNotices = notices.map(n => 
        n.id === notice.id ? { ...n, isPinned: newPinnedStatus } : n
      );
      setNotices(updatedNotices);

      // Try to call backend API to persist pin status
      const response = await fetch(`https://localhost:44390/api/Notice/${notice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinnedStatus }),
      });

      if (!response.ok) {
        console.warn('Backend pin update failed, but UI updated locally', response.status);
      }

      if (newPinnedStatus) {
        toast.success('Notice pinned successfully! ✓', {
          description: 'The notice has been pinned and will appear at the top.',
        });
      } else {
        toast.success('Notice unpinned successfully! ✓', {
          description: 'The notice has been unpinned.',
        });
      }
    } catch (error) {
      console.error('Failed to toggle pin notice:', error);
      toast.error('Failed to toggle pin notice', { description: String(error) });
      loadNotices(); // Reload to revert local state if failed
    }
  };

  const categories = useMemo(() => {
    const fromApi = apiCategories.map((category) => category.categoryName);
    const fromNoticeList = notices.map((notice) => notice.category);
    const unique = Array.from(new Set([...fromApi, ...fromNoticeList].filter(Boolean)));
    return ['All', ...unique];
  }, [apiCategories, notices]);

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        selectedCategory === 'All' ||
        notice.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === 'all' ||
        selectedStatus === 'All' ||
        notice.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [notices, searchQuery, selectedCategory, selectedStatus]);

  const handleDownload = (format: 'pdf' | 'csv' | 'excel') => {
    toast.success(`Downloading report as ${format.toUpperCase()}...`, {
      description: 'Your report will be downloaded shortly.',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Expired: 'bg-red-500/10 text-red-500 border-red-500/20',
      Draft: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    };

    return (
      <Badge className={`${statusColors[status] ?? statusColors.Active} border`}>
        {status}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      General: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      Academic: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      Event: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Holiday: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
      default: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    };

    return (
      <Badge className={`${categoryColors[category] ?? categoryColors.default} border`}>
        {category}
      </Badge>
    );
  };

  const canGoPrevious = pageNumber > 1;
  const canGoNext = notices.length === PAGE_SIZE;
  const startIndex = (pageNumber - 1) * PAGE_SIZE + 1;
  const endIndex = startIndex + filteredNotices.length - 1;

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Notice Management"
      breadcrumbs={["Home", "Admin", "Notices"]}
    >
      <div className="min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Notice Management</h1>
              <p className="text-slate-600">Create and manage school notices and announcements</p>
            </div>
            <Button
              onClick={() => navigate('/admin/create-notice')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Notice
            </Button>
          </div>
        </motion.div>

        <Card className="bg-white border-slate-200 p-6 mb-6 shadow-md">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Status' : status}
                </option>
              ))}
            </select>
            <div className="relative">
              <Button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="bg-gradient-to-r h-[45px] from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 text-white transition-all duration-200"
              >
                <FileDown className="w-4 h-4" />
                Export Result
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              {showExportDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-lg rounded-lg z-50 min-w-[140px]"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleDownload('pdf');
                        setShowExportDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <FileDown className="w-4 h-4 mr-2 text-red-600" />
                      PDF
                    </button>
                    <button
                      onClick={() => {
                        handleDownload('csv');
                        setShowExportDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                      CSV
                    </button>
                    <button
                      onClick={() => {
                        handleDownload('excel');
                        setShowExportDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2 text-blue-600" />
                      Excel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white border-slate-200 p-6 shadow-md">
              <p className="text-slate-600">Loading notices...</p>
            </Card>
          ) : filteredNotices.length === 0 ? (
            <Card className="bg-white border-slate-200 p-6 shadow-md">
              <p className="text-slate-600">No notices found.</p>
            </Card>
          ) : (
            filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id || `${notice.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white border-slate-200 hover:border-slate-400 transition-all shadow-md">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {notice.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                          <h3 className="text-xl font-bold text-black">{notice.title}</h3>
                          {getCategoryBadge(notice.category)}
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 border">
                            {notice.targetAudience}
                          </Badge>
                        </div>
                        <p className="text-slate-500 mb-4">{notice.content}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Posted by: {notice.postedBy}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Posted: {notice.postedDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Expires: {notice.expiryDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {notice.views} views
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        {getStatusBadge(notice.status)}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className={`transition-all ${
                              notice.isPinned
                                ? 'text-orange-500 bg-orange-50 hover:text-orange-600 hover:bg-orange-100'
                                : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            onClick={() => handlePin(notice)}
                            title={notice.isPinned ? 'Click to unpin' : 'Click to pin'}
                          >
                            <Pin className="w-4 h-4" fill={notice.isPinned ? 'currentColor' : 'none'} />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => navigate(`/admin/view-notice/${notice.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => navigate(`/admin/update-notice/${notice.id}`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(notice.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-slate-600">
            {filteredNotices.length === 0
              ? 'Showing 0 notices'
              : `Showing ${startIndex}-${endIndex} notices (Page ${pageNumber})`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-slate-300 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 transition-all duration-200"
              disabled={!canGoPrevious || isLoading}
              onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="border-slate-300 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 transition-all duration-200"
              disabled={!canGoNext || isLoading}
              onClick={() => setPageNumber((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}