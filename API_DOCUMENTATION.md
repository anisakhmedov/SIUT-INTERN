# SUIT Backend API Documentation

This document reflects the current backend implementation.

Base URL: `http://<host>:<port>`
Default port: `3000`

## Environment Variables

Required for server/database:

- `PORT` (optional, defaults to `3000`)
- `MONGO_URI` (recommended)
- `JWT_SECRET` (required for login/protected user routes)
- `JWT_EXPIRES_IN` (optional, default `12h`)

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
  "login": "String (required, unique)",
  "password": "String (required, min 8 chars; stored hashed)",
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
  "year": "Number (optional)",
  "passport": "String (image URL, optional)",
  "medicine": "String (image URL, optional)"
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
        "images": ["String (URL)"],
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
| POST   | /usersInternship/login   | Login and receive JWT token |
| POST   | /usersInternship/register | Register user (public only for first user, then Admin only) |
| POST   | /usersInternship         | Alias for register |
| GET    | /usersInternship/me      | Get current logged-in user |
| GET    | /usersInternship         | List users (Admin) |
| GET    | /usersInternship/:id     | Get user by ID (self or Admin) |
| PATCH  | /usersInternship/:id     | Update user (self; role/login only Admin) |
| DELETE | /usersInternship/:id     | Delete user (Admin) |

Protected routes require header:

- `Authorization: Bearer <token>`

### Login request body

```json
{
  "login": "jdoe",
  "password": "secret123"
}
```

### Login response example

```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "...",
    "name": "John",
    "surname": "Doe",
    "login": "jdoe",
    "role": "Tutor"
  }
}
```

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
| PATCH  | /student/:id/passport-image | Upload single passport image |
| PATCH  | /student/:id/medicine-image | Upload single medicine image |
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

### Upload Passport Image (`PATCH /student/:id/passport-image`)

Request requirements:

- `Content-Type: multipart/form-data`
- File field name: `image`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Max file size: `15MB`

Successful response example:

```json
{
  "message": "passport image uploaded successfully",
  "field": "passport",
  "image": "https://<public-base-url>/student/<studentId>/passport/<uuid>-passport.png",
  "key": "student/<studentId>/passport/<uuid>-passport.png"
}
```

### Upload Medicine Image (`PATCH /student/:id/medicine-image`)

Request requirements are the same as passport upload.

Successful response example:

```json
{
  "message": "medicine image uploaded successfully",
  "field": "medicine",
  "image": "https://<public-base-url>/student/<studentId>/medicine/<uuid>-medicine.png",
  "key": "student/<studentId>/medicine/<uuid>-medicine.png"
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
| PATCH/POST | /faculty/:id/days/:dayId/images   | Update image array in Cloudflare R2 |
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

### Upload Image (`PATCH or POST /faculty/:id/days/:dayId/images`)

Request requirements:

- `Content-Type: multipart/form-data`
- File field name can be `images` (recommended, supports multiple) or `image` (legacy)
- Send only one of these field names in a request (do not send both)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Max file size: `15MB` per file

Successful response example:

```json
{
  "message": "Изображения успешно загружены",
  "uploadedCount": 3,
  "images": [
    "https://<public-base-url>/faculty/<facultyId>/day/<dayId>/<uuid>-1.png",
    "https://<public-base-url>/faculty/<facultyId>/day/<dayId>/<uuid>-2.png",
    "https://<public-base-url>/faculty/<facultyId>/day/<dayId>/<uuid>-3.png"
  ],
  "keys": [
    "faculty/<facultyId>/day/<dayId>/<uuid>-1.png",
    "faculty/<facultyId>/day/<dayId>/<uuid>-2.png",
    "faculty/<facultyId>/day/<dayId>/<uuid>-3.png"
  ]
}
```

### Delete Image (`DELETE /faculty/:id/days/:dayId/images/*`)

Important:

- Pass the full image key after `/images/`.
- If key contains `/`, URL-encode it on client side.

Example encoded key:

`faculty%2F65f0...%2Fday%2F6601...%2F8c7f...-photo.png`

---

## Common Status Codes

- `200` Success
- `201` Created
- `400` Bad request / validation error
- `404` Not found
- `500` Internal server error
