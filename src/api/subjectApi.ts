import { API_BASE_URL, API_ENDPOINTS } from "./apiConfig";
import type { 
  Faculty, 
  CompulsorySubject, 
  FacultyCompulsorySubject, 
  OptionalSubject, 
  AdditionalSubject,
  SubjectDto,
  ClassDto,
  ReligionDto,
  CasteDto,
  GenderDto,
  CategoryDto,
  BloodGroupDto,
  MaritalStatusDto
} from "../types/subjectTypes";

export async function getFaculties(): Promise<Faculty[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.faculties);
  if (!response.ok) throw new Error("Failed to fetch faculties");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getCompulsorySubjects(): Promise<CompulsorySubject[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.compulsorySubjects);
  if (!response.ok) throw new Error("Failed to fetch compulsory subjects");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getFacultyCompulsorySubjects(facultyId: number): Promise<FacultyCompulsorySubject[]> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.facultyCompulsorySubjects}/${facultyId}`);
  if (!response.ok) throw new Error("Failed to fetch faculty compulsory subjects");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getOptionalSubjectsByFaculty(facultyId: number): Promise<OptionalSubject[]> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.optionalSubjectsByFaculty}/${facultyId}`);
  if (!response.ok) throw new Error("Failed to fetch optional subjects");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getAdditionalSubjects(): Promise<AdditionalSubject[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.additionalSubjects);
  if (!response.ok) throw new Error("Failed to fetch additional subjects");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getSubjects(): Promise<SubjectDto[]> {
  const response = await fetch(`${API_BASE_URL}/Master/Subjects`);
  if (!response.ok) throw new Error("Failed to fetch subjects");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getClasses(): Promise<ClassDto[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.classes);
  if (!response.ok) throw new Error("Failed to fetch classes");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

// Reference Data Fetch Methods
export async function getReligions(): Promise<ReligionDto[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.religions);
  if (!response.ok) throw new Error("Failed to fetch religions");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getCastes(): Promise<CasteDto[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.castes);
  if (!response.ok) throw new Error("Failed to fetch castes");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getGenders(): Promise<GenderDto[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.genders);
  if (!response.ok) throw new Error("Failed to fetch genders");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getCategories(): Promise<CategoryDto[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.categories);
  if (!response.ok) throw new Error("Failed to fetch categories");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getBloodGroups(): Promise<BloodGroupDto[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.bloodGroups);
  if (!response.ok) throw new Error("Failed to fetch blood groups");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getMaritalStatuses(): Promise<MaritalStatusDto[]> {
  const response = await fetch(API_BASE_URL + API_ENDPOINTS.maritalStatuses);
  if (!response.ok) throw new Error("Failed to fetch marital statuses");
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}
