/**
 * Delete a notice by ID
 */
export async function deleteNoticeById(id: string | number): Promise<boolean> {
  try {
    const response = await fetch(`${NOTICE_BASE}${NOTICE_ENDPOINTS.notice}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to delete notice');
    }
    const payload = await response.json();
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return Boolean(payload.data);
    }
    return false;
  } catch (error) {
    console.error('Error deleting notice:', error);
    throw error;
  }
}
/**
 * Fetch a single notice by ID
 */
export async function getNoticeById(id: string | number): Promise<NoticeResponse> {
  try {
    const response = await fetch(`${NOTICE_BASE}${NOTICE_ENDPOINTS.notice}/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch notice');
    }
    const payload = await response.json();
    if (payload && typeof payload === 'object' && 'data' in payload && payload.data) {
      return payload.data as NoticeResponse;
    }
    return payload as NoticeResponse;
  } catch (error) {
    console.error('Error fetching notice by id:', error);
    throw error;
  }
}

// Re-export with consistent names for ViewNotice

import { API_BASE_URL } from "./apiConfig";
import type { ResponseDto } from "../types/responseTypes";
import type {
  NoticeCategory,
  NoticePriority,
  NoticeTargetAudience,
  CreateNoticeDto,
  NoticeResponse,
} from "../types/noticeTypes";

const NOTICE_BASE = "https://localhost:44390/api";

const NOTICE_ENDPOINTS = {
  notice: "/Notice",
  categories: "/Master/Category",
  priorities: "/Master/Priority",
  targetAudiences: "/Master/Target Audience",
  attachments: "/Master/Attachments",
};

// Type definitions for API responses
type CategoriesResponse = ResponseDto & {
  data?: NoticeCategory[];
};

type PrioritiesResponse = ResponseDto & {
  data?: NoticePriority[];
};

type TargetAudiencesResponse = ResponseDto & {
  data?: NoticeTargetAudience[];
};

type NoticeCreateResponse = ResponseDto & {
  data?: NoticeResponse;
};

type NoticeListResponse = {
  success?: boolean;
  isSuccess?: boolean;
  message?: string;
  data?: NoticeResponse[];
};

// Normalize responses to handle both direct array and wrapped responses
function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as Record<string, unknown>).data;
    if (Array.isArray(data)) {
      return data as T[];
    }
  }

  return [];
}

/**
 * Fetch all notice categories
 */
export async function getNoticeCategories(): Promise<NoticeCategory[]> {
  try {
    const response = await fetch(NOTICE_BASE + NOTICE_ENDPOINTS.categories);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch notice categories");
    }
    const payload = (await response.json()) as unknown;
    return normalizeArray<NoticeCategory>(payload);
  } catch (error) {
    console.error("Error fetching notice categories:", error);
    throw error;
  }
}

/**
 * Fetch all notice priorities
 */
export async function getNoticePriorities(): Promise<NoticePriority[]> {
  try {
    const response = await fetch(NOTICE_BASE + NOTICE_ENDPOINTS.priorities);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch notice priorities");
    }
    const payload = (await response.json()) as unknown;
    return normalizeArray<NoticePriority>(payload);
  } catch (error) {
    console.error("Error fetching notice priorities:", error);
    throw error;
  }
}

/**
 * Fetch all notice target audiences
 */
export async function getNoticeTargetAudiences(): Promise<NoticeTargetAudience[]> {
  try {
    const response = await fetch(NOTICE_BASE + NOTICE_ENDPOINTS.targetAudiences);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch target audiences");
    }
    const payload = (await response.json()) as unknown;
    return normalizeArray<NoticeTargetAudience>(payload);
  } catch (error) {
    console.error("Error fetching target audiences:", error);
    throw error;
  }
}

/**
 * Create a new notice
 */
export async function createNotice(noticeData: CreateNoticeDto): Promise<NoticeResponse> {
  try {
    const payload = {
      NoticeTitle: noticeData.noticeTitle,
      NoticeNumber: noticeData.noticeNumber,
      CategoryId: noticeData.categoryId,
      PriorityId: noticeData.priorityId,
      TargetAudienceId: noticeData.targetAudienceId,
      PublishDate: noticeData.publishDate,
      ExpiryDate: noticeData.expiryDate,
      NoticeContent: noticeData.noticeContent,
    };

    const response = await fetch(NOTICE_BASE + NOTICE_ENDPOINTS.notice, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create notice");
    }

    const result = (await response.json()) as NoticeCreateResponse;

    if (result.data) {
      return result.data;
    }

    throw new Error(result.message || "Failed to create notice");
  } catch (error) {
    console.error("Error creating notice:", error);
    throw error;
  }
}

export async function createNoticeFormData(noticeFormData: FormData): Promise<NoticeResponse> {
  try {
    const response = await fetch(NOTICE_BASE + NOTICE_ENDPOINTS.notice, {
      method: "POST",
      body: noticeFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create notice");
    }

    const result = (await response.json()) as NoticeCreateResponse;

    if (result.data) {
      return result.data;
    }

    throw new Error(result.message || "Failed to create notice");
  } catch (error) {
    console.error("Error creating notice with form data:", error);
    throw error;
  }
}

/**
 * Fetch notices with pagination for list view
 */
export async function getAllNotices(pageNumber: number = 1, pageSize: number = 10): Promise<NoticeResponse[]> {
  try {
    const url = new URL(NOTICE_BASE + NOTICE_ENDPOINTS.notice);
    url.searchParams.set("pageNumber", String(pageNumber));
    url.searchParams.set("pageSize", String(pageSize));

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch notices");
    }

    const payload = (await response.json()) as unknown;

    if (Array.isArray(payload)) {
      return payload as NoticeResponse[];
    }

    if (payload && typeof payload === "object") {
      const wrapper = payload as NoticeListResponse;
      if (Array.isArray(wrapper.data)) {
        return wrapper.data;
      }
    }

    return normalizeArray<NoticeResponse>(payload);
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
}

/**
 * Fetch notices for a specific target audience id
 */
export async function getNoticesByAudience(audienceId: string | number): Promise<NoticeResponse[]> {
  try {
    const response = await fetch(`${NOTICE_BASE}${NOTICE_ENDPOINTS.notice}/by-audience/${audienceId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch notices by audience");
    }

    const payload = (await response.json()) as unknown;
    if (Array.isArray(payload)) {
      return payload as NoticeResponse[];
    }

    if (payload && typeof payload === "object") {
      const wrapper = payload as NoticeListResponse;
      if (Array.isArray(wrapper.data)) {
        return wrapper.data;
      }
    }

    return normalizeArray<NoticeResponse>(payload);
  } catch (error) {
    console.error("Error fetching notices by audience:", error);
    throw error;
  }
}
