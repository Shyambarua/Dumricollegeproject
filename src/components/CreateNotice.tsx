import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Bell, Users, Calendar, AlertCircle, Loader } from 'lucide-react';
import { Card } from './ui/card';
import { PortalLayout } from './PortalLayout';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  getNoticeCategories,
  getNoticePriorities,
  getNoticeTargetAudiences,
  createNotice,
} from '../api/noticeApi';
import type {
  NoticeCategory,
  NoticePriority,
  NoticeTargetAudience,
  CreateNoticeDto,
} from '../types/noticeTypes';

export function CreateNotice() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Data
  const [categories, setCategories] = useState<NoticeCategory[]>([]);
  const [priorities, setPriorities] = useState<NoticePriority[]>([]);
  const [audiences, setAudiences] = useState<NoticeTargetAudience[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: '',
    targetAudience: '',
    publishDate: '',
    expiryDate: '',
    content: '',
    attachments: '',
  });

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, prioritiesData, audiencesData] = await Promise.all([
          getNoticeCategories(),
          getNoticePriorities(),
          getNoticeTargetAudiences(),
        ]);

        setCategories(categoriesData);
        setPriorities(prioritiesData);
        setAudiences(audiencesData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load form data', {
          description: 'Please refresh the page and try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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

      // Map form data to API DTO format
      const noticePayload: CreateNoticeDto = {
        noticeTitle: formData.title,
        categoryId: formData.category ? parseInt(formData.category, 10) : undefined,
        priorityId: formData.priority ? parseInt(formData.priority, 10) : undefined,
        targetAudienceId: formData.targetAudience ? parseInt(formData.targetAudience, 10) : undefined,
        publishDate: formData.publishDate,
        expiryDate: formData.expiryDate || null,
        noticeContent: formData.content,
      };

      // Call API to create notice
      await createNotice(noticePayload);

      // Show success toast
      toast.success('Notice Published Successfully!', {
        description: `"${formData.title}" has been published.`,
      });

      // Navigate back to notices page
      setTimeout(() => {
        navigate('/admin/notices');
      }, 1000);
    } catch (error) {
      console.error('Error creating notice:', error);
      toast.error('Failed to Create Notice', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Create Notice"
      breadcrumbs={["Home", "Admin", "Notices", "Create Notice"]}
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
              <h2 className="text-2xl font-bold text-slate-900">Create New Notice</h2>
              <p className="text-sm text-slate-600">Create and publish a new notice or announcement</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-3 text-slate-600">Loading form data...</span>
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

              {/* Attachments */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Attachments (Optional)
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Attach Files
                  </label>
                  <input
                    type="file"
                    name="attachments"
                    onChange={handleChange}
                    multiple
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Upload any supporting documents (PDF, DOC, images, etc.)
                  </p>
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
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  className="px-8 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Publish Notice
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