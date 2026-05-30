import { z } from 'zod';

const requiredText = (message) =>
  z.string().trim().min(1, { message });

const validDate = (requiredMessage, invalidMessage) =>
  requiredText(requiredMessage).refine((s) => !Number.isNaN(Date.parse(s)), {
    message: invalidMessage,
  });

const rating = z
  .number({ invalid_type_error: 'Please select a score from 1 to 5.' })
  .int({ message: 'Please select a score from 1 to 5.' })
  .min(1, { message: 'Please select a score from 1 to 5.' })
  .max(5, { message: 'Please select a score from 1 to 5.' });

const finalRatingValues = ['1-2', '3-4', '5'];
const recommendationValues = [
  'recommend-future-opportunities',
  'recommend-with-reservations',
  'do-not-recommend',
];

export const InternshipEvaluationSchema = z.object({
  studentInformation: z.object({
    fullname: requiredText('Please enter the student\'s full name.'),
    studentID: requiredText('Please enter the student ID.'),
    degreeProgram: requiredText('Please enter the degree program.'),
    yearOfStudy: z
      .number({ invalid_type_error: 'Please enter year of study as a number.' })
      .int({ message: 'Year of study must be a whole number.' })
      .min(1, { message: 'Year of study must be at least 1.' }),
    internshipStartDate: validDate(
      'Please select the internship start date.',
      'Please enter a valid internship start date.',
    ),
    internshipEndDate: validDate(
      'Please select the internship end date.',
      'Please enter a valid internship end date.',
    ),
  }).refine((data) => {
    try {
      const start = new Date(data.internshipStartDate);
      const end = new Date(data.internshipEndDate);
      return end.getTime() >= start.getTime();
    } catch (e) {
      return false;
    }
  }, { message: 'Internship end date must be the same as or later than the start date.', path: ['internshipEndDate'] }),

  companyInformation: z.object({
    companyName: requiredText('Please enter the company name.'),
    department: requiredText('Please enter the department.'),
    supervisorContact: requiredText('Please enter the supervisor contact information.'),
  }),

  professionalism: z.object({
    punctualityAndAttendance: rating,
    dressCodeAndAppearance: rating,
    adherenceToCompanyPolicies: rating,
    comments: z.string().optional(),
  }),
  workEthic: z.object({
    initiativeAndProactiveness: rating,
    timeManagement: rating,
    abilityToMeetDeadlines: rating,
    comments: z.string().optional(),
  }),
  technicalSkills: z.object({
    applicationOfAcademicKnowledge: rating,
    abilityToLearnNewSkillsTools: rating,
    qualityOfWorkOutput: rating,
    comments: z.string().optional(),
  }),
  communicationSkills: z.object({
    verbalCommunication: rating,
    writtenCommunication: rating,
    teamCollaboration: rating,
    comments: z.string().optional(),
  }),
  problemSolvingSkills: z.object({
    analyticalThinking: rating,
    creativityAndInnovation: rating,
    abilityToHandleChallenges: rating,
    comments: z.string().optional(),
  }),
  overallPerformance: z.object({
    contributionToTheTeam: rating,
    alignmentWithCompanyGoals: rating,
    potentialForFutureEmployment: rating,
    comments: z.string().optional(),
  }),

  openEndedQuestions: z.object({
    strengths: requiredText('Please fill in the strengths field.'),
    areasOfImprovement: requiredText('Please fill in the areas of improvement field.'),
    projectTaskFeedback: requiredText('Please fill in the project task feedback field.'),
    learningAndGrowth: requiredText('Please fill in the learning and growth field.'),
    teamDynamics: requiredText('Please fill in the team dynamics field.'),
    adaptability: requiredText('Please fill in the adaptability field.'),
    feedbackForStudent: requiredText('Please fill in the feedback for student field.'),
    feedbackForUniversity: requiredText('Please fill in the feedback for university field.'),
  }),

  finalRecommendation: z.object({
    finalRating: requiredText('Please choose a final rating.').refine(
      (value) => finalRatingValues.includes(value),
      { message: 'Please choose a valid final rating option.' },
    ),
    supervisorRecommendation: requiredText('Please choose a supervisor recommendation.').refine(
      (value) => recommendationValues.includes(value),
      { message: 'Please choose a valid supervisor recommendation option.' },
    ),
    declarationAccepted: z.boolean().refine((value) => value === true, {
      message: 'Please confirm the declaration before submitting the form.',
    }),
    supervisorFullName: requiredText('Please enter the supervisor\'s full name.'),
    date: validDate(
      'Please select the evaluation date.',
      'Please enter a valid evaluation date.',
    ),
  }),
});

export default InternshipEvaluationSchema;
