
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Bell, Users, Calendar, AlertCircle, Loader } from 'lucide-react';
import { Card } from './ui/card';
import { PortalLayout } from './PortalLayout';
import { Button } from './ui/button';
import { toast } from 'sonner';
import {
  getNoticeById,
  getNoticeCategories,
  getNoticePriorities,
  getNoticeTargetAudiences,
} from '../api/noticeApi';
import type {
  NoticeCategory,
  NoticePriority,
  NoticeTargetAudience,
  NoticeResponse,
} from '../types/noticeTypes';

export default function UpdateNotice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const [currentAttachmentName, setCurrentAttachmentName] = useState('');

  // API Data
  const [categories, setCategories] = useState<NoticeCategory[]>([]);
  const [priorities, setPriorities] = useState<NoticePriority[]>([]);
  const [audiences, setAudiences] = useState<NoticeTargetAudience[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    noticeNumber: '',
    category: '',
    priority: '',
    targetAudience: '',
    publishDate: '',
    expiryDate: '',
    content: '',
  });

  // Fetch notice and dropdown data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast.error('Invalid notice ID.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [notice, categoriesData, prioritiesData, audiencesData] = await Promise.all([
          getNoticeById(id),
          getNoticeCategories(),
          getNoticePriorities(),
          getNoticeTargetAudiences(),
        ]);
        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setAudiences(audiencesData);
        setFormData({
          title: notice.noticeTitle || '',
          noticeNumber: notice.noticeNumber || '',
          category: notice.categoryId ? String(notice.categoryId) : '',
          priority: notice.priorityId ? String(notice.priorityId) : '',
          targetAudience: notice.targetAudienceId ? String(notice.targetAudienceId) : '',
          publishDate: notice.publishDate ? notice.publishDate.substring(0, 10) : '',
          expiryDate: notice.expiryDate ? notice.expiryDate.substring(0, 10) : '',
          content: notice.noticeContent || '',
        });
        const noticeAttachments = (notice as any).noticeAttachments;
        setCurrentAttachmentName(
          Array.isArray(noticeAttachments) && noticeAttachments.length > 0
            ? noticeAttachments[0]?.fileName || noticeAttachments[0]?.name || ''
            : ''
        );
      } catch (error) {
        toast.error('Failed to load notice data', {
          description: 'Please refresh the page and try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedAttachment(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!id) {
        toast.error('Invalid notice ID.');
        return;
      }
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Validation Error', { description: 'Notice title is required.' });
        return;
      }
      if (!formData.category) {
        toast.error('Validation Error', { description: 'Please select a category.' });
        return;
      }
      if (!formData.priority) {
        toast.error('Validation Error', { description: 'Please select a priority.' });
        return;
      }
      if (!formData.targetAudience) {
        toast.error('Validation Error', { description: 'Please select a target audience.' });
        return;
      }
      if (!formData.publishDate) {
        toast.error('Validation Error', { description: 'Please select a publish date.' });
        return;
      }
      if (!formData.content.trim()) {
        toast.error('Validation Error', { description: 'Notice content is required.' });
        return;
      }

      // Build payload for update
      const payload = new FormData();
      payload.append('NoticeId', String(id));
      payload.append('NoticeTitle', formData.title);
      payload.append('NoticeNumber', formData.noticeNumber || '');
      payload.append('CategoryId', formData.category);
      payload.append('PriorityId', formData.priority);
      payload.append('TargetAudienceId', formData.targetAudience);
      payload.append('PublishDate', formData.publishDate);
      payload.append('ExpiryDate', formData.expiryDate || '');
      payload.append('NoticeContent', formData.content);
      if (selectedAttachment) {
        payload.append('Attachment', selectedAttachment);
      }

      // Call API to update notice as FormData
      const response = await fetch(`https://localhost:44390/api/Notice/${id}`, {
        method: 'PUT',
        body: payload,
      });
      let result: any = {};
      const text = await response.text();
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (e) {
          // ignore parse error, treat as success if status is ok
        }
      }
      if (response.ok && result.success !== false) {
        toast.success('Notice Updated Successfully!', {
          description: `"${formData.title}" has been updated.`,
        });
        setTimeout(() => {
          navigate('/admin/notices');
        }, 1000);
      } else {
        toast.error('Failed to Update Notice', {
          description: result.message || 'Please try again later.',
        });
      }
    } catch (error) {
      toast.error('Failed to Update Notice', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Update Notice"
      breadcrumbs={["Home", "Admin", "Notices", "Update Notice"]}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/admin/notices')}
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notices
        </Button>

        <Card className="p-8 bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Update Notice</h2>
              <p className="text-sm text-slate-600">Edit and update the notice details</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-3 text-slate-600">Loading notice data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Notice Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Annual Sports Day 2026"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting || categories.length === 0}
                        className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {categories.length === 0 ? 'Loading...' : 'Select Category'}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          required
                          disabled={isSubmitting || priorities.length === 0}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {priorities.length === 0 ? 'Loading...' : 'Select Priority'}
                          </option>
                          {priorities.map((pri) => (
                            <option key={pri.priorityId} value={pri.priorityId}>
                              {pri.priorityName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Target Audience <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                          name="targetAudience"
                          value={formData.targetAudience}
                          onChange={handleChange}
                          required
                          disabled={isSubmitting || audiences.length === 0}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {audiences.length === 0 ? 'Loading...' : 'Select Audience'}
                          </option>
                          {audiences.map((aud) => (
                            <option key={aud.id} value={aud.id}>
                              {aud.audienceName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Publication Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Publish Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        name="publishDate"
                        value={formData.publishDate}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Leave blank if notice doesn't expire</p>
                  </div>
                </div>
              </div>

              {/* Notice Content */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Notice Content
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Notice Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Enter the full notice content here..."
                    required
                    disabled={isSubmitting}
                    rows={10}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Provide detailed information about the notice
                  </p>
                </div>
              </div>

              {/* Attachments (disabled for update) */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Attachments
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Upload Attachment
                  </label>
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleAttachmentChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave empty to keep the current attachment.
                  </p>
                  {currentAttachmentName && !selectedAttachment && (
                    <p className="text-xs text-slate-600 mt-2">
                      Current attachment: {currentAttachmentName}
                    </p>
                  )}
                  {selectedAttachment && (
                    <p className="text-xs text-slate-600 mt-2">
                      Selected file: {selectedAttachment.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/notices')}
                  className="px-6 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-8 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Notice
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
}
