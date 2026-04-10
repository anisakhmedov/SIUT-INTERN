import { API_URL } from './apiClient';
import { getAuthTokenFromStorage } from './storageUtils';

export const STUDENT_IMAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const STUDENT_IMAGE_MAX_SIZE = 15 * 1024 * 1024;

export function validateStudentImageFile(file) {
  if (!file) {
    return 'Please choose an image file.';
  }

  if (!STUDENT_IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, GIF, and WebP images are allowed.';
  }

  if (file.size > STUDENT_IMAGE_MAX_SIZE) {
    return 'Maximum file size is 15MB.';
  }

  return '';
}

function parseResponseText(responseText) {
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return null;
  }
}

function getErrorMessage(payload) {
  return payload?.message || payload?.data?.message || 'Upload failed';
}

function uploadStudentImage(studentId, file, endpointPath, onProgress) {
  return new Promise((resolve, reject) => {
    if (!studentId) {
      reject(new Error('Student ID is required.'));
      return;
    }

    if (!file) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();

    xhr.open('PATCH', `${API_URL}/student/${studentId}/${endpointPath}`);

    const token = getAuthTokenFromStorage();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      if (!event.lengthComputable || !event.total) {
        onProgress(0);
        return;
      }

      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(progress);
    };

    xhr.onload = () => {
      const payload = parseResponseText(xhr.responseText);

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload || {});
        return;
      }

      reject(new Error(getErrorMessage(payload)));
    };

    xhr.onerror = () => {
      reject(new Error('Upload failed'));
    };

    xhr.send(formData);
  });
}

export function uploadStudentPassportImage(studentId, file, onProgress) {
  return uploadStudentImage(studentId, file, 'passport-image', onProgress);
}

export function uploadStudentMedicineImage(studentId, file, onProgress) {
  return uploadStudentImage(studentId, file, 'medicine-image', onProgress);
}