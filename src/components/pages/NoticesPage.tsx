import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, Bell, Calendar, Download, Pin, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { CarouselHeader } from '../CarouselHeader';
import { Footer } from '../Footer';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'Academic' | 'Event' | 'Holiday' | 'Important' | 'General' | 'Admission' | string;
  priority: string;
  isPinned: boolean;
  hasAttachment: boolean;
}

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

// Fallback static notices (kept commented for reference)
/* const fallbackNotices: Notice[] = [
  {
    id: 'NOT001',
    title: 'Admission Open for Academic Year 2026-27',
    description: 'Dumri College announces admission for UG and PG programs for the academic year 2026-27. Interested students can apply online through our admission portal. Last date to apply: April 30, 2026.',
    date: '2026-03-10',
    category: 'Admission',
    priority: 'High',
    isPinned: true,
    hasAttachment: true,
  },
  {
    id: 'NOT002',
    title: 'Annual Convocation Ceremony - March 25, 2026',
    description: 'The Annual Convocation Ceremony will be held on March 25, 2026 at the University Auditorium. All graduating students and their families are invited to attend this prestigious event.',
    date: '2026-03-08',
    category: 'Event',
    priority: 'High',
    isPinned: true,
    hasAttachment: false,
  },
  {
    id: 'NOT003',
    title: 'Holiday Notice - Holi Festival',
    description: 'The college will remain closed on March 14, 2026 for Holi festival celebrations. Regular classes will resume on March 16, 2026. Wishing everyone a colorful and safe Holi!',
    date: '2026-03-05',
    category: 'Holiday',
    priority: 'Normal',
    isPinned: false,
    hasAttachment: false,
  },
  {
    id: 'NOT004',
    title: 'End-Semester Examination Schedule Published',
    description: 'The end-semester examination schedule for all undergraduate and postgraduate courses has been published. Students are requested to download the timetable from the college website and prepare accordingly.',
    date: '2026-03-01',
    category: 'Academic',
    priority: 'Normal',
    isPinned: false,
    hasAttachment: true,
  },
  {
    id: 'NOT005',
    title: 'Guest Lecture Series on Artificial Intelligence',
    description: 'Department of Computer Science is organizing a guest lecture series on "Recent Advances in Artificial Intelligence" from March 20-22, 2026. All students and faculty are invited to attend.',
    date: '2026-02-28',
    category: 'Event',
    priority: 'Normal',
    isPinned: false,
    hasAttachment: true,
  },
  {
    id: 'NOT006',
    title: 'Library Timing Extended During Exams',
    description: 'The Central Library will operate with extended hours during the examination period. New timings: 6:00 AM to 10:00 PM on all days including weekends.',
    date: '2026-02-25',
    category: 'General',
    priority: 'Normal',
    isPinned: false,
    hasAttachment: false,
  },
  {
    id: 'NOT007',
    title: 'Important: Document Verification for New Admissions',
    description: 'All students who have applied for admission must complete their document verification by March 31, 2026. Please bring original documents along with photocopies to the Admission Office.',
    date: '2026-02-22',
    category: 'Important',
    priority: 'Urgent',
    isPinned: false,
    hasAttachment: true,
  },
  {
    id: 'NOT008',
    title: 'Annual Sports Meet - Registration Open',
    description: 'Registration is now open for the Annual Sports Meet 2026. Students interested in participating should register with the Sports Department by March 18, 2026.',
    date: '2026-02-20',
    category: 'Event',
    priority: 'Normal',
    isPinned: false,
    hasAttachment: false,
  },
  {
    id: 'NOT009',
    title: 'Scholarship Application Deadline Extended',
    description: 'The deadline for merit-based scholarship applications has been extended to March 20, 2026. Eligible students are encouraged to apply through the student portal.',
    date: '2026-02-18',
    category: 'Academic',
    priority: 'Normal',
    isPinned: false,
    hasAttachment: true,
  },
  {
    id: 'NOT010',
    title: 'Faculty Development Program on Digital Teaching',
    description: 'A three-day Faculty Development Program on "Digital Teaching Methods and E-Learning Tools" will be conducted from March 15-17, 2026. All teaching staff are requested to participate.',
    date: '2026-02-15',
    category: 'General',
    priority: 'Normal',
    isPinned: false,
    hasAttachment: false,
  },
]; */

const getCategoryBadge = (category: string) => {
  const colors = {
    Academic: 'bg-blue-50 text-blue-700 border-blue-200',
    Event: 'bg-purple-50 text-purple-700 border-purple-200',
    Holiday: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Important: 'bg-red-50 text-red-700 border-red-200',
    General: 'bg-amber-50 text-amber-700 border-amber-200',
    Admission: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  const icons = {
    Academic: CheckCircle,
    Event: Calendar,
    Holiday: Info,
    Important: AlertCircle,
    General: Bell,
    Admission: Info,
  };
  const Icon = icons[category as keyof typeof icons];
  return (
    <Badge className={`${colors[category as keyof typeof colors]} border flex items-center gap-1.5 font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      {category}
    </Badge>
  );
};

// Fetch notices from API and map them
const useFetchNotices = () => {
  const [list, setList] = useState<Notice[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchNotices = async () => {
      try {
        const res = await fetch('https://localhost:44390/api/Notice?pageNumber=1&pageSize=10');
        if (!res.ok) {
          console.error('Failed to fetch notices', res.status);
          setList([]);
          return;
        }
        const data = await res.json();

        // Handle various API response shapes
        const items: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : data?.notices ?? [];

        // Map API response to Notice interface
        const overrides = readPinOverrides();
        const mapped: Notice[] = items.map((item: any) => {
          const priority = item.priority ?? 'Normal';
          const id = String(item.noticeId ?? item.id ?? '');
          const baseIsPinned = priority.toLowerCase() === 'high' || item.isPinned === true;
          return {
            id,
            title: item.noticeTitle ?? item.title ?? 'Untitled',
            description: item.noticeContent ?? item.description ?? '',
            date: item.publishDate ?? item.date ?? new Date().toISOString().split('T')[0],
            category: item.category ?? 'General',
            priority: priority,
            isPinned: Object.prototype.hasOwnProperty.call(overrides, id)
              ? overrides[id]
              : baseIsPinned,
            hasAttachment: Array.isArray(item.noticeAttachments) ? item.noticeAttachments.length > 0 : item.hasAttachment === true,
          };
        });

        if (mounted) setList(mapped);
      } catch (e) {
        console.error('Error loading notices', e);
        setList([]);
      }
    };

    fetchNotices();
    
    // Auto-refresh every 5 seconds to pick up updates from admin panel (pin/unpin actions)
    const interval = setInterval(() => {
      if (mounted) fetchNotices();
    }, 5000);

    const onPinnedUpdated = () => {
      if (mounted) fetchNotices();
    };

    window.addEventListener('notice-pin-updated', onPinnedUpdated);

    return () => { 
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('notice-pin-updated', onPinnedUpdated);
    };
  }, []);

  return list;
};

export function NoticesPage() {
  const navigate = useNavigate();
  const notices: Notice[] = useFetchNotices();

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'thisMonth'>('all');

  // Count urgent notices (only when priority is set to 'Urgent')
  const urgentCount = notices.filter(n => 
    n.priority.toLowerCase() === 'urgent'
  ).length;

  // Count notices from current month
  const currentMonth = new Date().getMonth();
  const thisMonthCount = notices.filter(n => 
    new Date(n.date).getMonth() === currentMonth
  ).length;

  const visibleNotices = notices.filter((n) => {
    if (activeFilter === 'urgent') return n.priority.toLowerCase() === 'urgent';
    if (activeFilter === 'thisMonth') return new Date(n.date).getMonth() === currentMonth;
    return true;
  });

  // Filter notices based on priority (High priority = pinned)
  const pinnedNotices = visibleNotices.filter(n => n.isPinned);
  const regularNotices = visibleNotices.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <CarouselHeader />

      {/* Hero Banner */}
      <section className="relative h-[320px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
            alt="Campus"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a2e]/90 via-[#00324d]/85 to-[#004d73]/80"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center pt-30 pb-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-white text-sm hover:underline"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-white" />
            <span className="text-white text-sm">Notices & Announcements</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6 font-serif">
            Notices & Announcements
          </h1>

          {/* Description */}
          <p className="text-white/90 text-base leading-7 max-w-3xl">
            Stay updated with the latest news, announcements, and important information
            <br className="hidden sm:block" />
            from Dumri College. Check here regularly for academic updates and events.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card
                  onClick={() => setActiveFilter('all')}
                  className={`bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg p-6 cursor-pointer transition-all ${activeFilter === 'all' ? 'ring-2 ring-blue-200 scale-[1.01]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/90 mb-1">Total Notices</p>
                      <h3 className="text-3xl font-bold text-white">{notices.length}</h3>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card
                  onClick={() => setActiveFilter((prev) => (prev === 'urgent' ? 'all' : 'urgent'))}
                  className={`bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg p-6 cursor-pointer transition-all ${activeFilter === 'urgent' ? 'ring-2 ring-red-200 scale-[1.01]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/90 mb-1">Urgent Notices</p>
                      <h3 className="text-3xl font-bold text-white">{urgentCount}</h3>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Pin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/90 mb-1">Pinned</p>
                      <h3 className="text-3xl font-bold text-white">{pinnedNotices.length}</h3>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card
                  onClick={() => setActiveFilter((prev) => (prev === 'thisMonth' ? 'all' : 'thisMonth'))}
                  className={`bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg p-6 cursor-pointer transition-all ${activeFilter === 'thisMonth' ? 'ring-2 ring-emerald-200 scale-[1.01]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/90 mb-1">This Month</p>
                      <h3 className="text-3xl font-bold text-white">{thisMonthCount}</h3>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Pinned Notices */}
            {pinnedNotices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Pin className="w-6 h-6 text-blue-600" />
                  Pinned Notices
                </h3>
                <div className="space-y-4">
                  {pinnedNotices.map((notice: Notice, index: number) => (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Card className="bg-red-50 border-red-500 border-l-4 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Pin className="w-5 h-5 text-red-600" />
                                <h4 className="text-xl font-bold text-slate-900">{notice.title}</h4>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{notice.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-blue-200">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">
                                  {new Date(notice.date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              {getCategoryBadge(notice.category)}
                            </div>
                            {notice.hasAttachment && (
                              <Button className="bg-red-500 text-white hover:bg-[#1d4ed8] font-semibold">
                                <Download className="w-4 h-4 mr-2" />
                                Download Attachment
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* All Notices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                All Notices
              </h3>
              <div className="space-y-4">
                {regularNotices.map((notice: Notice, index: number) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    <Card className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-slate-900 mb-2">{notice.title}</h4>
                            <p className="text-slate-700 leading-relaxed">{notice.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">
                                {new Date(notice.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            {getCategoryBadge(notice.category)}
                          </div>
                          {notice.hasAttachment && (
                            <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8] font-semibold">
                              <Download className="w-4 h-4 mr-2" />
                              Download Attachment
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
