# SUIT Backend API Documentation

This document outlines the available endpoints, request/response formats, and model fields for the SUIT backend server.

Base URL: `https://siut-internship-35635e91d124.herokuapp.com` (default port 3000)

---

## Models

### User
```json
{
  "name": "String (required)",
  "surname": "String (required)",
  "login": "String (required)",
  "password": "String (required)",
  "role": "String (required) \u2013 one of [Tutor, Admin, Rector, Professor]"
}
```

### Student
```json
{
  "name": "String (required)",
  "surname": "String (required)",
  "faculty": "ObjectId (ref Faculty)",
  "nameFaculty": "String (optional)",
  "gender": "String (optional)",
  "year": "Number (optional)"
}
```

### Faculty
Fields correspond to `Faculty` mongoose schema.
```json
{
  "name": "String (required)",
  "numberOfStudents": "Array",
  "location": "String (required)",
  "duration": "String (required)",
  "tutorID": "String",
  "plan": "String (required)",
  "company": "String (required)",
  "progressAll": "String (required)",
  "status": "String (required)",
  "days": [
    {
      "approved": "Boolean",
      "dayNumber": "String",
      "date": "String",
      "shortReport": { "dayID": "ObjectId", "images": ["String"], "title": "String", "description": "String", "date": "Date" },
      "comments": ["String"]
    }
  ]
}
```

---

## Endpoints

### Users

| Method | Path           | Description            |
|--------|----------------|------------------------|
| GET    | /users         | List all users         |
| GET    | /users/:id     | Get single user        |
| POST   | /users         | Create new user        |
| PATCH  | /users/:id     | Update a user          |
| DELETE | /users/:id     | Remove a user          |

**Sample POST body**
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

### Students

| Method | Path               | Description                |
|--------|--------------------|----------------------------|
| GET    | /student           | List all students          |
| GET    | /student/:id       | Get single student         |
| POST   | /student           | Create new student         |
| PATCH  | /student/:id       | Update a student           |
| DELETE | /student/:id       | Remove a student           |

**Sample POST body**
```json
{
  "name": "Alice",
  "surname": "Smith",
  "faculty": "603e2f...",
  "nameFaculty": "Engineering",
  "gender": "Female",
  "year": 2
}
```

---

### Faculty

| Method | Path                        | Description                            |
|--------|-----------------------------|----------------------------------------|
| GET    | /faculty                    | List all faculties                     |
| GET    | /faculty/:id                | Get faculty by ID                      |
| POST   | /faculty                    | Create a new faculty                   |
| PATCH  | /faculty/:id                | Update faculty fields                  |
| DELETE | /faculty/:id                | Delete faculty                         |
| POST   | /faculty/:id/days           | Add a day to faculty                   |
| PATCH  | /faculty/:id/days/:dayId    | Update a specific day                  |
| DELETE | /faculty/:id/days/:dayId    | Remove a specific day                  |

**Notes**
- When adding/updating days, send the day object in the request body. Fields in a day: `approved`, `dayNumber`, `date`, `shortReport`, `comments`.

---

## Common Responses

- `200` – success, JSON payload returned.
- `201` – resource created.
- `400` – bad request (validation errors).
- `404` – resource not found.
- `500` – server error.

---

> 🔧 _Add additional documentation or examples as needed._
