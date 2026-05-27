import { z } from 'zod';

const rating = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const InternshipEvaluationSchema = z.object({
  studentInformation: z.object({
    fullname: z.string().min(1),
    studentID: z.string().min(1),
    degreeProgram: z.string().min(1),
    yearOfStudy: z.number().int().positive(),
    internshipStartDate: z.string().refine((s) => !Number.isNaN(Date.parse(s))),
    internshipEndDate: z.string().refine((s) => !Number.isNaN(Date.parse(s))),
  }).refine((data) => {
    try {
      const start = new Date(data.internshipStartDate);
      const end = new Date(data.internshipEndDate);
      return end.getTime() >= start.getTime();
    } catch (e) {
      return false;
    }
  }, { message: 'End date must be same or after start date', path: ['internshipEndDate'] }),

  companyInformation: z.object({
    companyName: z.string().min(1),
    department: z.string().min(1),
    supervisorContact: z.string().min(1),
  }),

  professionalism: z.object({
    punctualityAndAttendance: rating,
    dressCodeAndAppearance: rating,
    adherenceToCompanyPolicies: rating,
    comments: z.string().min(1),
  }),
  workEthic: z.object({
    initiativeAndProactiveness: rating,
    timeManagement: rating,
    abilityToMeetDeadlines: rating,
    comments: z.string().min(1),
  }),
  technicalSkills: z.object({
    applicationOfAcademicKnowledge: rating,
    abilityToLearnNewSkillsTools: rating,
    qualityOfWorkOutput: rating,
    comments: z.string().min(1),
  }),
  communicationSkills: z.object({
    verbalCommunication: rating,
    writtenCommunication: rating,
    teamCollaboration: rating,
    comments: z.string().min(1),
  }),
  problemSolvingSkills: z.object({
    analyticalThinking: rating,
    creativityAndInnovation: rating,
    abilityToHandleChallenges: rating,
    comments: z.string().min(1),
  }),
  overallPerformance: z.object({
    contributionToTheTeam: rating,
    alignmentWithCompanyGoals: rating,
    potentialForFutureEmployment: rating,
    comments: z.string().min(1),
  }),

  openEndedQuestions: z.object({
    strengths: z.string().optional(),
    areasOfImprovement: z.string().optional(),
    projectTaskFeedback: z.string().optional(),
    learningAndGrowth: z.string().optional(),
    teamDynamics: z.string().optional(),
    adaptability: z.string().optional(),
    feedbackForStudent: z.string().optional(),
    feedbackForUniversity: z.string().optional(),
  }).optional(),

  finalRecommendation: z.object({
    finalRating: z.enum(['1-2', '3-4', '5']),
    supervisorRecommendation: z.enum(['recommend-future-opportunities', 'recommend-with-reservations', 'do-not-recommend']),
    declarationAccepted: z.literal(true),
    supervisorFullName: z.string().min(1),
    date: z.string().refine((s) => !Number.isNaN(Date.parse(s))),
  }),
});

export default InternshipEvaluationSchema;
