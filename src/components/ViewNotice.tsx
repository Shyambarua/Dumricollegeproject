import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoticeById, getNoticeCategories, getNoticePriorities, getNoticeTargetAudiences } from '../api/noticeApi';
import { NoticeCategory, NoticePriority, NoticeTargetAudience, NoticeResponse } from '../types/noticeTypes';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PortalLayout } from './PortalLayout';
import { Bell, FileText } from 'lucide-react';

export default function ViewNotice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<NoticeResponse | null>(null);
  const [categoryList, setCategoryList] = useState<NoticeCategory[]>([]);
  const [priorityList, setPriorityList] = useState<NoticePriority[]>([]);
  const [audienceList, setAudienceList] = useState<NoticeTargetAudience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [noticeRes, categories, priorities, audiences] = await Promise.all([
          getNoticeById(id!),
          getNoticeCategories(),
          getNoticePriorities(),
          getNoticeTargetAudiences(),
        ]);
        setNotice(noticeRes);
        setCategoryList(categories);
        setPriorityList(priorities);
        setAudienceList(audiences);
      } catch (err) {
        setError('Failed to load notice details.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function getCategory() {
    if (!notice) return null;
    if (notice.categoryId)
      return categoryList.find(c => c.categoryId === notice.categoryId) || null;
    if ((notice as any).category)
      return categoryList.find(c => c.categoryName.toLowerCase() === String((notice as any).category).toLowerCase()) || null;
    return null;
  }
  function getPriority() {
    if (!notice) return null;
    if (notice.priorityId)
      return priorityList.find(p => p.priorityId === notice.priorityId) || null;
    if ((notice as any).priority)
      return priorityList.find(p => p.priorityName.toLowerCase() === String((notice as any).priority).toLowerCase()) || null;
    return null;
  }
  function getAudience() {
    if (!notice) return null;
    if (notice.targetAudienceId)
      return audienceList.find(a => a.id === notice.targetAudienceId) || null;
    if ((notice as any).targetAudience)
      return audienceList.find(a => a.audienceName.toLowerCase() === String((notice as any).targetAudience).toLowerCase()) || null;
    return null;
  }

  if (loading) return <Card className="p-8">Loading...</Card>;
  if (error || !notice) return <Card className="p-8 text-red-600">{error || 'Notice not found.'}</Card>;

  const cat = getCategory();
  const pri = getPriority();
  const aud = getAudience();

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="View Notice"
      breadcrumbs={['Home', 'Admin', 'Notices', 'View Notice']}
    >
      <div className="space-y-6">
        <Card className="bg-white border border-slate-200">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1">{notice.noticeTitle}</h2>
                <div className="text-base font-bold text-slate-700">Notice Number: <span className="font-mono font-bold text-lg">{notice.noticeNumber || '-'}</span></div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div>
                <div className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Category</div>
                <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  {cat ? <>{cat.categoryName} <span className="text-xs text-slate-400">({cat.isActive ? 'Active' : 'Inactive'})</span></> : '-'}
                </div>
              </div>
              <div>
                <div className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Priority</div>
                <div className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-100">
                  {pri ? pri.priorityName : '-'}
                </div>
              </div>
              <div>
                <div className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Target Audience</div>
                <div className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                  {aud ? aud.audienceName : '-'}
                </div>
              </div>
              <div>
                <div className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Publish Date</div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
                  {notice.publishDate}
                </div>
              </div>
              <div>
                <div className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Expiry Date</div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
                  {notice.expiryDate || '-'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-200">Notice Content</h3>
              <div className="bg-slate-50 rounded p-4 whitespace-pre-line text-slate-800 border border-slate-100">
                {notice.noticeContent}
              </div>
            </div>

            {/* Attachments */}
            {'noticeAttachments' in notice && Array.isArray((notice as any).noticeAttachments) && (notice as any).noticeAttachments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-200">Attachments</h3>
                <ul className="list-disc ml-6">
                  {(notice as any).noticeAttachments.map((att: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 py-1">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <a href={att.filePath || att.url || att.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{att.fileName || att.name || 'Attachment'}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button onClick={() => navigate(-1)} className="bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 text-slate-700 border-2 border-slate-300 transition-all duration-200">
                Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}
