# SUIT Backend API Documentation

This document reflects the current backend implementation.

Base URL: `http://<host>:<port>`
Default port: `3000`

## Environment Variables

Required for server/database:

- `PORT` (optional, defaults to `3000`)
- `MONGO_URI` (recommended)

If `MONGO_URI` is not provided, backend builds URI from:

- `MONGO_LOGIN`
- `MONGO_PASSWORD`

Required for Cloudflare R2 image storage:

- `CLOUDFLARE_R2_ENDPOINT` (for example `https://<account_id>.r2.cloudflarestorage.com`)
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_PUBLIC_BASE_URL` (public domain for serving uploaded images)

---

## Models

### User (`UserInternship`)

```json
{
  "name": "String (required)",
  "surname": "String (required)",
  "login": "String (required)",
  "password": "String (required)",
  "role": "String (required) - one of [Tutor, Admin, Rector, Professor]"
}
```

### Student

```json
{
  "name": "String (required)",
  "surname": "String (required)",
  "lastname": "String (required)",
  "faculty": "ObjectId (ref Faculty)",
  "nameFaculty": "String (optional)",
  "gender": "String (optional)",
  "year": "Number (optional)"
}
```

### Faculty

```json
{
  "name": "String (required)",
  "numberOfStudents": "Array",
  "location": "String (required)",
  "duration": "String (required)",
  "tutorID": "String",
  "plan": "String (required)",
  "company": "String (required)",
  "progressAll": "String",
  "status": "String (required)",
  "days": [
    {
      "approved": "Boolean (default false)",
      "dayNumber": "String",
      "date": "String",
      "shortReport": {
        "dayID": "ObjectId",
        "images": [
          {
            "url": "String",
            "key": "String",
            "uploadedAt": "Date"
          }
        ],
        "title": "String",
        "description": "String",
        "date": "Date"
      },
      "comments": [
        {
          "commentID": "ObjectId",
          "text": "String",
          "date": "Date",
          "userID": "ObjectId (ref UserInternship)"
        }
      ]
    }
  ]
}
```

Notes:

- On day save, `shortReport.dayID` is auto-assigned from the day `_id` if empty.
- Faculty GET endpoints populate `days.comments.userID`.

---

## Routes Summary

Mounted route prefixes:

- `/faculty`
- `/usersInternship`
- `/student`

Health route:

- `GET /` -> `Welcome to the API!`

---

## Users API

Base path: `/usersInternship`

| Method | Path                    | Description |
|--------|-------------------------|-------------|
| GET    | /usersInternship        | List users |
| GET    | /usersInternship/:id    | Get user by ID |
| POST   | /usersInternship        | Create user |
| PATCH  | /usersInternship/:id    | Update user |
| DELETE | /usersInternship/:id    | Delete user |

Sample create/update body:

```json
{
  "name": "John",
  "surname": "Doe",
  "login": "jdoe",
  "password": "secret123",
  "role": "Tutor"
}
```

---

## Students API

Base path: `/student`

| Method | Path              | Description |
|--------|-------------------|-------------|
| GET    | /student          | List students (with populated `faculty`) |
| GET    | /student/:id      | Get student by ID (with populated `faculty`) |
| POST   | /student          | Create student |
| PATCH  | /student/:id      | Update student |
| DELETE | /student/:id      | Delete student |

Sample create/update body:

```json
{
  "name": "Alice",
  "surname": "Smith",
  "lastname": "Williams",
  "faculty": "603e2f...",
  "nameFaculty": "Engineering",
  "gender": "Female",
  "year": 2
}
```

---

## Faculty API

Base path: `/faculty`

| Method | Path                                   | Description |
|--------|----------------------------------------|-------------|
| GET    | /faculty                               | List faculties (populates `days.comments.userID`) |
| GET    | /faculty/:id                           | Get faculty by ID (populates `days.comments.userID`) |
| POST   | /faculty                               | Create faculty |
| PATCH  | /faculty/:id                           | Update faculty fields |
| DELETE | /faculty/:id                           | Delete faculty |
| POST   | /faculty/:id/days                      | Add day to faculty |
| PATCH  | /faculty/:id/days/:dayId               | Update a day |
| DELETE | /faculty/:id/days/:dayId               | Delete a day |
| POST   | /faculty/:id/days/:dayId/images        | Upload image to Cloudflare R2 |
| DELETE | /faculty/:id/days/:dayId/images/*      | Delete image from Cloudflare R2 by full key |

### Create Faculty sample body

```json
{
  "name": "Internship Program 2026",
  "numberOfStudents": [20, 25],
  "location": "Baku",
  "duration": "3 months",
  "tutorID": "tutor123",
  "plan": "Backend Development",
  "company": "SUIT",
  "progressAll": "0%",
  "status": "active",
  "days": []
}
```

### Add Day sample body (`POST /faculty/:id/days`)

```json
{
  "approved": false,
  "dayNumber": "1",
  "date": "2026-03-26",
  "shortReport": {
    "title": "Introduction",
    "description": "First day report"
  },
  "comments": []
}
```

### Upload Image (`POST /faculty/:id/days/:dayId/images`)

Request requirements:

- `Content-Type: multipart/form-data`
- File field name must be `image`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Max file size: `5MB`

Successful response example:

```json
{
  "message": "Изображение успешно загружено",
  "image": {
    "url": "https://<public-base-url>/faculty/<facultyId>/day/<dayId>/<uuid>-photo.png",
    "key": "faculty/<facultyId>/day/<dayId>/<uuid>-photo.png",
    "uploadedAt": "2026-03-26T10:00:00.000Z"
  }
}
```

#### JavaScript/React Example (Single Image)

```javascript
async function uploadImage(facultyId, dayId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(
      `https://siut-internship-35635e91d124.herokuapp.com/faculty/${facultyId}/days/${dayId}/images`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.image; // Returns { url, key, uploadedAt }
  } catch (err) {
    console.error('Image upload error:', err);
    throw err;
  }
}

// Usage:
const imageFile = document.querySelector('input[type="file"]').files[0];
const uploadedImage = await uploadImage('faculty123', 'day456', imageFile);
console.log('Image uploaded:', uploadedImage.url);
```

#### JavaScript/React Example (Multiple Images)

```javascript
async function uploadMultipleImages(facultyId, dayId, imageFiles) {
  const uploadPromises = Array.from(imageFiles).map(file =>
    uploadImage(facultyId, dayId, file)
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results; // Array of { url, key, uploadedAt }
  } catch (err) {
    console.error('Multiple image upload failed:', err);
    throw err;
  }
}

// Usage:
const imageInputElement = document.querySelector('input[type="file"][multiple]');
const images = await uploadMultipleImages('faculty123', 'day456', imageInputElement.files);
console.log(`Uploaded ${images.length} images`);
```

#### Integration with Report Creation (Full Example)

```javascript
async function submitReportWithImages(facultyId, dayId, reportData, imageFiles) {
  let uploadedImageUrls = [];

  // Step 1: Upload images first
  if (imageFiles && imageFiles.length > 0) {
    try {
      const uploadedImages = await uploadMultipleImages(facultyId, dayId, imageFiles);
      uploadedImageUrls = uploadedImages.map(img => img.url);
    } catch (err) {
      console.error('Failed to upload images:', err);
      throw new Error('Image upload failed');
    }
  }

  // Step 2: Create/update report with image URLs
  const reportPayload = {
    ...reportData,
    shortReport: {
      ...reportData.shortReport,
      images: uploadedImageUrls,
      date: new Date().toISOString(),
    },
  };

  try {
    const response = await fetch(
      `https://siut-internship-35635e91d124.herokuapp.com/faculty/${facultyId}/days/${dayId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save report');
    }

    return await response.json();
  } catch (err) {
    console.error('Report submission error:', err);
    throw err;
  }
}

// Usage:
const reportData = {
  title: 'Day 1 Report',
  description: 'First day of internship',
};
const imageFiles = document.querySelector('input[type="file"]').files;

try {
  const result = await submitReportWithImages('faculty123', 'day456', reportData, imageFiles);
  console.log('Report submitted successfully:', result);
} catch (err) {
  console.error('Submission failed:', err);
}
```

#### Image Validation (Client-Side)

```javascript
function validateImage(file) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: JPEG, PNG, WebP, GIF`);
  }

  if (file.size > MAX_SIZE) {
    throw new Error(`File too large. Maximum size: 5MB`);
  }

  return true;
}

// Usage:
const files = document.querySelector('input[type="file"]').files;
Array.from(files).forEach(file => {
  try {
    validateImage(file);
    console.log(`✓ ${file.name} is valid`);
  } catch (err) {
    console.error(`✗ ${file.name}: ${err.message}`);
  }
});
```

#### Image Preview (Before Upload)

```javascript
function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve({
        id: file.lastModified,
        src: event.target.result,
        name: file.name,
        size: file.size,
      });
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Usage:
const files = document.querySelector('input[type="file"]').files;
const previews = await Promise.all(
  Array.from(files).map(file => createImagePreview(file))
);

previews.forEach(preview => {
  console.log(`Preview: ${preview.name} (${preview.size} bytes)`);
  // Display preview.src in <img src={preview.src} />
});
```

### Delete Image (`DELETE /faculty/:id/days/:dayId/images/*`)

Important:

- Pass the full image key after `/images/`.
- If key contains `/`, URL-encode it on client side.

Example encoded key:

`faculty%2F65f0...%2Fday%2F6601...%2F8c7f...-photo.png`

#### JavaScript Example (Delete Image)

```javascript
async function deleteImage(facultyId, dayId, imageKey) {
  const encodedKey = encodeURIComponent(imageKey);

  try {
    const response = await fetch(
      `https://siut-internship-35635e91d124.herokuapp.com/faculty/${facultyId}/days/${dayId}/images/${encodedKey}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }

    return await response.json();
  } catch (err) {
    console.error('Image delete error:', err);
    throw err;
  }
}

// Usage:
const imageKey = 'faculty/65f0.../day/6601.../8c7f...-photo.png';
await deleteImage('faculty123', 'day456', imageKey);
console.log('Image deleted successfully');
```

---

## Image Upload Best Practices

### Client-Side Best Practices

1. **Validate before upload:**
   - Check file type (MIME type)
   - Check file size limits
   - Show error messages to user

2. **Provide user feedback:**
   - Show upload progress percentage
   - Display loading spinners
   - Show preview of selected images
   - Display error messages clearly

3. **Handle errors gracefully:**
   - Retry failed uploads
   - Show retry button
   - Collect error details for debugging

4. **Optimize performance:**
   - Compress images before upload (optional)
   - Upload multiple images in parallel (not sequentially)
   - Clear successful uploads from form

### Server Storage (Cloudflare R2)

- **Storage Path:** `faculty/{facultyId}/day/{dayId}/{uniqueId}-{filename}`
- **Public URL:** `https://{publicBaseUrl}/{storagePath}`
- **Max Size:** 5MB per file
- **Allowed Formats:** JPEG, PNG, WebP, GIF

### Image Metadata

Each uploaded image stores:

```javascript
{
  url: String,           // Public URL to access the image
  key: String,           // Storage key in R2 (used for deletion)
  uploadedAt: Date       // ISO 8601 timestamp
}
```

---

## Complete Example: Upload from InternshipPage.jsx

```javascript
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  const newValidImages = files.filter(file => {
    if (!validImageTypes.includes(file.type)) {
      alert(`${file.name} is not a valid image file. Only JPEG, PNG, WebP and GIF are allowed.`);
      return false;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert(`${file.name} is too large. Maximum size is 5MB.`);
      return false;
    }
    return true;
  });
  
  setReportImages(prev => [...prev, ...newValidImages]);
  
  // Create previews for the new images
  newValidImages.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviews(prev => [...prev, { 
        id: file.lastModified, 
        src: reader.result, 
        name: file.name 
      }]);
    };
    reader.readAsDataURL(file);
  });
};

const handleReportSubmit = async (e) => {
  e.preventDefault();
  if (!currentDay) return;
  
  setSubmitting(true);
  setActionError('');
  setActionMessage('');
  
  try {
    const formData = new FormData();
    
    // Upload each image and collect URLs
    const imageUrls = [];
    for (const image of reportImages) {
      const imageFormData = new FormData();
      imageFormData.append('image', image);
      
      const res = await fetch(
        `${API_URL}/faculty/${facultyId}/days/${getDayId(currentDay)}/images`,
        {
          method: 'POST',
          body: imageFormData,
        }
      );
      
      if (!res.ok) throw new Error('Image upload failed');
      
      const imageData = await res.json();
      imageUrls.push(imageData.image.url);
    }
    
    // Create or update report with image URLs
    const reportPayload = {
      ...currentDay,
      shortReport: {
        title: reportTitle.trim() || 'Report',
        description: reportDescription.trim() || '',
        images: imageUrls,
        date: new Date().toISOString(),
      },
    };
    
    const method = isEditingReport ? 'PATCH' : 'POST';
    const endpoint = isEditingReport 
      ? `${API_URL}/faculty/${facultyId}/days/${getDayId(currentDay)}`
      : `${API_URL}/faculty/${facultyId}/days/${getDayId(currentDay)}/report`;
    
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportPayload),
    });
    
    if (!res.ok) throw new Error(`Failed to ${isEditingReport ? 'update' : 'submit'} report`);
    
    await fetchFaculty();
    setActionMessage(`Report ${isEditingReport ? 'updated' : 'created'}.`);
    setShowReportForm(false);
    setIsEditingReport(false);
    
    // Reset form
    setReportTitle('');
    setReportDescription('');
    setReportImages([]);
    setImagePreviews([]);
  } catch (err) {
    setActionError(err.message || 'Something went wrong.');
  } finally {
    setSubmitting(false);
  }
};
```

---

## Common Status Codes

- `200` Success
- `201` Created
- `400` Bad request / validation error
- `404` Not found
- `500` Internal server error
