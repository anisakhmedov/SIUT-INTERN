import { get, post, patch, del } from './apiClient';

const buildPath = (facultyId, path = '') => `/faculty/${facultyId}/attendance${path}`;

export async function getAttendance(facultyId) {
  return await get(buildPath(facultyId));
}

export async function syncAttendance(facultyId) {
  return await post(buildPath(facultyId, '/sync'));
}

export async function createAttendanceDay(facultyId, payload) {
  return await post(buildPath(facultyId, '/days'), payload);
}

export async function updateAttendanceDay(facultyId, dayId, payload) {
  return await patch(buildPath(facultyId, `/days/${dayId}`), payload);
}

export async function toggleAttendanceStudent(facultyId, dayId, studentKey, present) {
  return await patch(buildPath(facultyId, `/days/${dayId}/students/${encodeURIComponent(studentKey)}`), { present });
}

export async function deleteAttendanceDay(facultyId, dayId) {
  return await del(buildPath(facultyId, `/days/${dayId}`));
}

export default { getAttendance, syncAttendance, createAttendanceDay, updateAttendanceDay, toggleAttendanceStudent, deleteAttendanceDay };
