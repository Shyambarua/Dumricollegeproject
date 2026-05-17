export interface NoticeCategory {
  categoryId: number;
  categoryName: string;
  isActive: boolean;
}

export interface NoticePriority {
  priorityId: number;
  priorityName: string;
}

export interface NoticeTargetAudience {
  id: number;
  audienceName: string;
}

export interface NoticeAttachmentDto {
  fileName: string;
  filePath: string;
}

export interface CreateNoticeDto {
  noticeTitle: string;
  noticeNumber?: string | null;
  categoryId?: number | null;
  priorityId?: number | null;
  targetAudienceId?: number | null;
  publishDate: string; // ISO date format: YYYY-MM-DD
  expiryDate?: string | null; // ISO date format: YYYY-MM-DD
  noticeContent: string;
  noticeAttachments?: NoticeAttachmentDto[] | null;
}

export interface NoticeResponse {
  noticeId: number;
  noticeTitle: string;
  noticeNumber?: string;
  categoryId?: number;
  priorityId?: number;
  targetAudienceId?: number;
  publishDate: string;
  expiryDate?: string;
  noticeContent: string;
  createdDate: string;
  isActive: boolean;
}
