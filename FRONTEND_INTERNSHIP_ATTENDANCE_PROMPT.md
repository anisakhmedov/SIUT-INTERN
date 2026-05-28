# Frontend Prompt: Internship Attendance Tracking

Use this prompt with your frontend team or AI assistant to build the attendance page for students attached to an internship.

## Ready Prompt For Frontend AI Assistant

You are implementing an attendance tracking page for internship students.

Important context:
- This page is used by authenticated staff.
- The page must show students attached to one internship and track attendance by day.
- The main UI is a table by days.
- Each row must show the date, student first name, student surname, and whether the student was present that day.
- Keep the interface simple, fast, and mobile-friendly.
- Do not label fields with `text:`.

## Page Goal

Build an internship attendance page where the user can:
- view the attendance roster
- create attendance records for a day
- mark each student as present or absent
- edit an existing day
- remove a day if needed
- sync the roster when students are attached to the internship

## Backend Contract

### Recommended endpoints
- GET /faculty/:id/attendance
- POST /faculty/:id/attendance/sync
- POST /faculty/:id/attendance/days
- GET /faculty/:id/attendance/days/:attendanceDayId
- PATCH /faculty/:id/attendance/days/:attendanceDayId
- PATCH /faculty/:id/attendance/days/:attendanceDayId/students/:studentKey
- DELETE /faculty/:id/attendance/days/:attendanceDayId

### Auth
- Send JWT in the `Authorization: Bearer <token>` header.

## Response Shape

The attendance endpoint returns this shape:

```ts
export type AttendanceStudent = {
  studentKey: string;
  studentId: string | null;
  name: string;
  surname: string;
  lastname: string;
  fullName: string;
  faculty: string | null;
  present: boolean;
};

export type AttendanceDay = {
  id: string;
  dayNumber: number;
  date: string | null;
  students: AttendanceStudent[];
};

export type AttendanceTableRow = AttendanceStudent & {
  dayId: string;
  dayNumber: number;
  date: string | null;
};

export type AttendanceResponse = {
  internship: {
    id: string;
    name: string;
    duration: {
      start: string;
      end: string;
    };
  };
  students: AttendanceStudent[];
  attendance: AttendanceDay[];
  tableRows: AttendanceTableRow[];
  dates: string[];
};
```

## UI Structure

### Top section
Show:
- internship name
- internship date range
- total students
- total days in attendance
- a button to sync roster

### Main table
Render the attendance data as a table grouped by day.

Recommended columns:
- Date
- Day number
- Student name
- Student surname
- Present
- Actions

Behavior:
- `Present` should be editable with a checkbox or toggle.
- Each day should be easy to scan.
- Keep the day grouping visible when there are many students.
- If you use the flat `tableRows` data, group rows by `dayId` or `date` in the UI.

### Day editor
Allow the user to:
- create a new day by choosing a date
- edit the date if needed
- toggle student attendance
- save all changes

### Empty state
If no attendance exists yet:
- show a friendly empty state
- show a button to create the first attendance day
- explain that attendance is based on students attached to the internship

## Request Payloads

### Create attendance day
```json
{
  "date": "2026-05-28",
  "students": [
    {
      "studentKey": "student-id-or-key",
      "present": true
    }
  ]
}
```

### Update attendance day
```json
{
  "date": "2026-05-28",
  "dayNumber": 1,
  "students": [
    {
      "studentKey": "student-id-or-key",
      "present": false
    }
  ]
}
```

### Update one student in a day
```json
{
  "present": true
}
```

## Validation Rules

- `date` is required when creating or updating a day.
- `students` must be an array.
- `studentKey` must match the roster returned by the backend.
- `present` must be boolean.
- Prevent duplicate attendance days for the same date.

## Frontend Implementation Notes

Use a typed API client with these functions:
- `getAttendance(internshipId, token)`
- `syncAttendance(internshipId, token)`
- `createAttendanceDay(internshipId, token, payload)`
- `updateAttendanceDay(internshipId, attendanceDayId, token, payload)`
- `toggleAttendanceStudent(internshipId, attendanceDayId, studentKey, token, present)`
- `deleteAttendanceDay(internshipId, attendanceDayId, token)`

Suggested state model:

```ts
type AttendanceState =
  | { status: "loading" }
  | { status: "ready"; data: AttendanceResponse }
  | { status: "saving"; data: AttendanceResponse }
  | { status: "error"; message: string };
```

## UI/UX Guidance

- Use a table or grouped cards, but keep the day/date hierarchy obvious.
- Show first name and surname separately.
- Add clear present/absent labels, not only icons.
- Provide loading, error, and empty states.
- Use optimistic UI only if rollback is safe.
- Preserve existing marks when the roster is synced.
- Keep the design clean and professional.

## Deliverables

- Attendance page
- API client for attendance endpoints
- Day editor modal or side panel
- Present/absent toggle controls
- Empty state and error handling
- Roster sync action
