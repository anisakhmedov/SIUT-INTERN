# Frontend Prompt: Public Internship Evaluation Form

Use this prompt with your frontend team or AI assistant to build the internship evaluation page.

## Ready Prompt For Frontend AI Assistant

You are implementing a public internship evaluation form page for a university internship system.

Important context:
- This page is available for everyone.
- Do not require login to open or submit the page.
- The page must be clear, professional, and easy to use on desktop and mobile.
- Use plain labels in the UI. Do not label fields with the word `text:`.
- The form must enforce required fields exactly as specified below.
- All inputs are required unless the field is explicitly marked unrequired.
- Open-ended questions are optional.
- Declaration checkbox is required.

## Page Goal

Build a single-page public internship evaluation form where a supervisor can submit a complete evaluation for a student internship.

The page must include these sections:
1. Student information
2. Company information
3. Evaluation criteria with 1 to 5 scoring
4. Open-ended questions
5. Final recommendation

## Backend Contract

### Recommended endpoint
- POST /internship-evaluations

### Request rules
- Send JSON.
- Every required field must be present.
- Rating fields must be numbers from 1 to 5.
- Open-ended fields may be empty or omitted.
- Declaration must be accepted with a checked checkbox.

## Form Structure

### 1) Student Information
Fields:
- Full Name
- Student ID
- Degree Program
- Year of Study
- Internship Start Date
- Internship End Date

Validation rules:
- Full Name: required string.
- Student ID: required string.
- Degree Program: required string.
- Year of Study: required number.
- Internship Start Date: required date.
- Internship End Date: required date and must be the same day or after the start date.

### 2) Company Information
Fields:
- Company Name
- Department
- Supervisor Contact

Validation rules:
- Company Name: required string.
- Department: required string.
- Supervisor Contact: required string.

### 3) Evaluation Criteria
Show a short instruction line at the top of the section:
- 1 = Poor
- 2 = Below Average
- 3 = Satisfactory
- 4 = Good
- 5 = Excellent

Each score should use a radio group, segmented control, or select input with values 1 to 5.

#### Professionalism
- Punctuality and attendance
- Dress code and appearance
- Adherence to company policies
- Comments on professionalism

#### Work Ethic
- Initiative and proactiveness
- Time management
- Ability to meet deadlines
- Comment on work ethic

#### Technical Skills
- Application of academic knowledge
- Ability to learn new skills/tools
- Quality of work output
- Comments on technical skills

#### Communication Skills
- Verbal communication
- Written communication
- Team collaboration
- Comments on communication skills

#### Problem-Solving Skills
- Analytical thinking
- Creativity and innovation
- Ability to handle challenges
- Comments on problem-solving skills

#### Overall Performance
- Contribution to the team
- Alignment with company goals
- Potential for future employment
- Comments on overall performance

Validation rules:
- Every rating input is required.
- Every rating must be a number from 1 to 5.
- Every comment field in these sections is required.

### 4) Open-Ended Questions
These are unrequired, but should still be available as optional long text areas.

Fields:
- Strengths
- Areas of improvement
- Project/Task Feedback
- Learning and Growth
- Team Dynamics
- Adaptability
- Feedback for the student
- Feedback for the University

UI guidance:
- Use multiline text areas.
- Keep each question readable and full sentence styled.
- Allow the user to skip any of these fields.

### 5) Final Recommendation
Fields:
- Final Rating
- Supervisor’s Recommendation
- Declaration checkbox
- Supervisor's Full Name
- Date

Final Rating options:
- 1–2: Needs significant improvement
- 3–4: Meets expectations
- 5: Exceeds expectations

Supervisor’s Recommendation options:
- Recommend for future opportunities
- Recommend with reservations
- Do not recommend

Declaration:
- Checkbox label: I agree
- The UI should also display the declaration sentence:
  - By entering my name below and submitting this form, I confirm that this evaluation is accurate and complete.

Validation rules:
- Final Rating: required select.
- Supervisor’s Recommendation: required select.
- Declaration checkbox: required checked state.
- Supervisor's Full Name: required string.
- Date: required date.

## Validation Scheme

Use a frontend validation schema for the entire form and keep the field names aligned with the backend payload.

Recommended approach:
- Use Zod, Yup, or an equivalent schema validator.
- Validate on blur and again on submit.
- Show inline errors next to the field.
- Prevent submission until all required fields are valid.

### Required field groups

Student information:
- fullname: required string
- studentID: required string
- degreeProgram: required string
- yearOfStudy: required number
- internshipStartDate: required date
- internshipEndDate: required date, must be greater than or equal to internshipStartDate

Company information:
- companyName: required string
- department: required string
- supervisorContact: required string

Evaluation ratings:
- Every rating field must be required
- Every rating field must accept only values 1, 2, 3, 4, or 5
- Every section comment must be required string

Open-ended questions:
- All open-ended questions are optional
- Empty strings are allowed

Final recommendation:
- finalRating: required select with values 1-2, 3-4, or 5
- supervisorRecommendation: required select with values recommend-future-opportunities, recommend-with-reservations, or do-not-recommend
- declarationAccepted: required boolean and must be true
- supervisorFullName: required string
- date: required date

### Suggested schema shape

```ts
type InternshipEvaluationFormValues = {
  studentInformation: {
    fullname: string;
    studentID: string;
    degreeProgram: string;
    yearOfStudy: number | string;
    internshipStartDate: string;
    internshipEndDate: string;
  };
  companyInformation: {
    companyName: string;
    department: string;
    supervisorContact: string;
  };
  professionalism: {
    punctualityAndAttendance: number | string;
    dressCodeAndAppearance: number | string;
    adherenceToCompanyPolicies: number | string;
    comments: string;
  };
  workEthic: {
    initiativeAndProactiveness: number | string;
    timeManagement: number | string;
    abilityToMeetDeadlines: number | string;
    comments: string;
  };
  technicalSkills: {
    applicationOfAcademicKnowledge: number | string;
    abilityToLearnNewSkillsTools: number | string;
    qualityOfWorkOutput: number | string;
    comments: string;
  };
  communicationSkills: {
    verbalCommunication: number | string;
    writtenCommunication: number | string;
    teamCollaboration: number | string;
    comments: string;
  };
  problemSolvingSkills: {
    analyticalThinking: number | string;
    creativityAndInnovation: number | string;
    abilityToHandleChallenges: number | string;
    comments: string;
  };
  overallPerformance: {
    contributionToTheTeam: number | string;
    alignmentWithCompanyGoals: number | string;
    potentialForFutureEmployment: number | string;
    comments: string;
  };
  openEndedQuestions: {
    strengths?: string;
    areasOfImprovement?: string;
    projectTaskFeedback?: string;
    learningAndGrowth?: string;
    teamDynamics?: string;
    adaptability?: string;
    feedbackForStudent?: string;
    feedbackForUniversity?: string;
  };
  finalRecommendation: {
    finalRating: "1-2" | "3-4" | "5";
    supervisorRecommendation:
      | "recommend-future-opportunities"
      | "recommend-with-reservations"
      | "do-not-recommend";
    declarationAccepted: boolean;
    supervisorFullName: string;
    date: string;
  };
};
```

## UI/UX Requirements

- Make the page public and accessible without login.
- Use a clean, trustworthy, academic style.
- Organize the form into clear visual sections.
- Provide sticky or repeated section navigation if the page is long.
- Show field-level validation messages.
- Show a top-level success message after submission.
- Show a clear error message if submission fails.
- Disable the submit button while the request is in progress.
- Keep the submit flow simple and reliable.
- Support mobile layout with stacked fields and large touch targets.

## Submission Payload Example

```json
{
  "studentInformation": {
    "fullname": "John Doe",
    "studentID": "20240001",
    "degreeProgram": "Computer Science",
    "yearOfStudy": 3,
    "internshipStartDate": "2026-01-10",
    "internshipEndDate": "2026-03-10"
  },
  "companyInformation": {
    "companyName": "Example Company",
    "department": "Software Engineering",
    "supervisorContact": "+998901234567"
  },
  "professionalism": {
    "punctualityAndAttendance": 5,
    "dressCodeAndAppearance": 4,
    "adherenceToCompanyPolicies": 5,
    "comments": "Always on time and professional."
  },
  "workEthic": {
    "initiativeAndProactiveness": 5,
    "timeManagement": 4,
    "abilityToMeetDeadlines": 5,
    "comments": "Completed tasks independently and on schedule."
  },
  "technicalSkills": {
    "applicationOfAcademicKnowledge": 4,
    "abilityToLearnNewSkillsTools": 5,
    "qualityOfWorkOutput": 4,
    "comments": "Learned the stack quickly and delivered solid work."
  },
  "communicationSkills": {
    "verbalCommunication": 4,
    "writtenCommunication": 4,
    "teamCollaboration": 5,
    "comments": "Communicated clearly with the team."
  },
  "problemSolvingSkills": {
    "analyticalThinking": 4,
    "creativityAndInnovation": 4,
    "abilityToHandleChallenges": 5,
    "comments": "Handled new tasks well and adapted fast."
  },
  "overallPerformance": {
    "contributionToTheTeam": 5,
    "alignmentWithCompanyGoals": 5,
    "potentialForFutureEmployment": 5,
    "comments": "Strong overall performance and future potential."
  },
  "openEndedQuestions": {
    "strengths": "...",
    "areasOfImprovement": "...",
    "projectTaskFeedback": "...",
    "learningAndGrowth": "...",
    "teamDynamics": "...",
    "adaptability": "...",
    "feedbackForStudent": "...",
    "feedbackForUniversity": "..."
  },
  "finalRecommendation": {
    "finalRating": "3-4",
    "supervisorRecommendation": "recommend-future-opportunities",
    "declarationAccepted": true,
    "supervisorFullName": "Jane Smith",
    "date": "2026-05-27"
  }
}
```

## Implementation Notes

- Use a form library if helpful, but keep the field names stable.
- Validate dates before submit.
- Validate every rating field in the browser before sending.
- Keep optional open-ended questions separate from required scoring fields.
- Do not hide the declaration agreement.
- This form is public, so do not depend on auth state.

## Deliverables

- A polished public internship evaluation page.
- A reusable form component.
- Client-side validation for all required fields.
- API client function to submit the form.
- Success and error states after submission.

## Short Version For Frontend AI

Build a public internship evaluation form page that anyone can access without login. Include student information, company information, 1-to-5 evaluation scores with required comments, optional open-ended questions, and final recommendation controls with a required declaration checkbox. Submit the data to POST /internship-evaluations, validate required fields on the client, and show clear success/error states.