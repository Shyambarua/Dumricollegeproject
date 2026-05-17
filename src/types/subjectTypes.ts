export interface Faculty {
  facultyId: number;
  facultyName: string;
}

export interface CompulsorySubject {
  compulsorySubjectId: number;
  subjectName: string;
}

export interface FacultyCompulsorySubject {
  id: number;
  facultyId: number;
  subjectName: string;
}

export interface OptionalSubject {
  optionalSubjectId: number;
  facultyId: number;
  subjectName: string;
}

export interface AdditionalSubject {
  additionalSubjectId: number;
  subjectName: string;
}

export interface SubjectDto {
  id: number;
  name: string;
}

export interface ClassDto {
  id: number;
  name: string;
}

// Reference Data DTOs
export interface ReligionDto {
  religionId: number;
  religionName: string;
}

export interface CasteDto {
  casteId: number;
  casteName: string;
}

export interface GenderDto {
  genderId: number;
  genderName: string;
}

export interface CategoryDto {
  categoryId: number;
  categoryName: string;
}

export interface BloodGroupDto {
  bloodGroupId: number;
  bloodGroupName: string;
}

export interface MaritalStatusDto {
  maritalStatusId: number;
  maritalStatusName: string;
}
