import axios from 'axios';

const BASE = 'https://localhost:44366';

export async function getAcademicYears() {
  const url = `${BASE}/api/Master/GetAllAcademicYear`;
  const res = await axios.get(url);
  return res.data;
}

export async function getClasses() {
  const url = `${BASE}/api/Master/Class`;
  const res = await axios.get(url);
  return res.data;
}

export async function getSubjects() {
  const url = `${BASE}/api/Master/Subjects`;
  const res = await axios.get(url);
  return res.data;
}

export async function getExamTypes() {
  const url = `${BASE}/api/Master/ExamType`;
  const res = await axios.get(url);
  return res.data;
}

export async function getAllExams() {
  const url = `${BASE}/api/Exams/GetAllExams`;
  const res = await axios.get(url);
  return res.data;
}

export async function getExamById(examId: string | number) {
  const url = `${BASE}/api/Exams/Exams${examId}`;
  const res = await axios.get(url);
  return res.data;
}

export async function deleteExam(examId: string | number) {
  const url = `${BASE}/api/Exams/DeleteExam/${examId}`;
  const res = await axios.delete(url);
  return res.data;
}

export async function getAllSubjectByExamId(examId: string | number) {
  const url = `${BASE}/api/Master/GetAllSubjectByExamId/${examId}`;
  const res = await axios.get(url);
  return res.data;
}

export async function createExamWithSchedule(payload: any) {
  const url = `${BASE}/api/Exams/CreateWithSchedule`;
  const res = await axios.post(url, payload);
  return res.data;
}

export async function updateExam(payload: any) {
  const url = `${BASE}/api/Exams/UpdateExam`;
  const res = await axios.post(url, payload);
  return res.data;
}

export async function createExamSubjectSchedule(payload: any) {
  const url = `${BASE}/api/Master/CreateExamSubjectSchedule`;
  const res = await axios.post(url, payload);
  return res.data;
}

export default {
  getAcademicYears,
  getClasses,
  getSubjects,
  getExamTypes,
  getAllExams,
  deleteExam,
  getAllSubjectByExamId,
  createExamWithSchedule,
  getExamById,
  updateExam,
  createExamSubjectSchedule,
};
