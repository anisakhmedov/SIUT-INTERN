import React, { useMemo, useState } from 'react';

const ROLE_GUIDES = {
  Admin: {
    title: 'Admin Guide',
    intro: 'Manage platform users, control access, and keep internship data quality high.',
    websiteRoutes: [
      'Dashboard -> view all internships and open details',
      'Create Tutors -> create Tutor, Admin, Rector, and Professor accounts',
      'Students -> review and update student documents',
      'Feedback -> monitor daily comment activity across internships',
    ],
    workflow: [
      'Start in Dashboard and review active internship status cards.',
      'Open internship details to check day reports, approvals, and comments.',
      'Use Create Tutors when new staff accounts are needed.',
      'Use Students to verify passport and medicine document uploads.',
      'Use Feedback to quickly jump into flagged or recent comments.',
    ],
    permissions: [
      'Full user-management access',
      'Can approve reports and manage internship records',
      'Can access protected routes requiring admin-level actions',
    ],
    tips: [
      'Review comments daily to catch blockers early.',
      'Create accounts with correct role on first attempt to reduce rework.',
      'Keep student documents complete before internship milestones.',
    ],
  },
  Tutor: {
    title: 'Tutor Guide',
    intro: 'Track assigned internships, write/update daily reports, and mentor students through comments.',
    websiteRoutes: [
      'Dashboard -> open internship detail pages',
      'Internship details -> days timeline, report form, image upload, comments',
      'Feedback -> see recent comment stream and jump to context',
    ],
    workflow: [
      'Open Dashboard and select your internship card.',
      'Pick a day in the timeline, then write or update the short report.',
      'Upload day images where needed and verify they appear in the day view.',
      'Use comments to guide students and answer blockers.',
    ],
    permissions: [
      'Can create and update day reports',
      'Can post comments on day entries',
      'No user account management access',
    ],
    tips: [
      'Keep report titles concise and consistent by day.',
      'Post actionable comments, not only status notes.',
      'Upload images only when they add evidence to the report.',
    ],
  },
  Professor: {
    title: 'Professor Guide',
    intro: 'Review progress quality and provide academic-level feedback for internship outcomes.',
    websiteRoutes: [
      'Dashboard -> review internship cards and progress trends',
      'Internship details -> inspect day reports and comments',
      'Feedback -> monitor latest mentorship conversations',
    ],
    workflow: [
      'Use Dashboard to identify internships needing academic intervention.',
      'Open detailed day reports and review outcomes against expected plan.',
      'Leave targeted comments for tutors and students where correction is needed.',
    ],
    permissions: [
      'Read internship and student-related operational data',
      'Can participate in feedback discussions where enabled',
      'No admin account provisioning',
    ],
    tips: [
      'Focus on consistency between plan, reported work, and evidence.',
      'Prioritize feedback that helps students improve next-day execution.',
      'Escalate critical issues to Admin quickly.',
    ],
  },
  Rector: {
    title: 'Rector Guide',
    intro: 'Use high-level visibility features to supervise program quality and governance.',
    websiteRoutes: [
      'Dashboard -> track global internship progress and health',
      'Feedback -> review communication quality and unresolved issues',
      'Students -> verify document completeness trends',
    ],
    workflow: [
      'Start from Dashboard and scan institution-wide internship status.',
      'Open high-risk internships for detail review when anomalies appear.',
      'Use Feedback to evaluate response speed and quality from teams.',
    ],
    permissions: [
      'High-level oversight access',
      'Can audit progress and operational readiness',
      'No routine low-level editing required',
    ],
    tips: [
      'Use weekly cadence checks instead of ad-hoc monitoring.',
      'Track recurring issues by role and route them to Admin.',
      'Keep focus on process quality, not only completion counts.',
    ],
  },
  Student: {
    title: 'Student Guide',
    intro: 'Understand how your internship data and document flow works in the platform.',
    websiteRoutes: [
      'Students section (by authorized staff) -> your profile and documents',
      'Internship details (staff-facing) -> your day progress and report outcomes',
      'Feedback stream (staff-facing) -> comments related to your internship activity',
    ],
    workflow: [
      'Share required documents with authorized staff for upload and verification.',
      'Follow tutor comments and daily goals communicated in the platform.',
      'Resolve missing document requests quickly to avoid process delays.',
    ],
    permissions: [
      'Student records are managed by authorized staff roles',
      'Document status and progress are tracked in your internship context',
      'Access level depends on your institution setup',
    ],
    tips: [
      'Keep document photos clear and readable.',
      'Respond early when mentors request updates.',
      'Ask for clarification when report feedback is unclear.',
    ],
  },
};

const roleOrder = ['Admin', 'Tutor', 'Professor', 'Rector', 'Student'];

function ListBlock({ title, items }) {
  return (
    <section style={{ marginBottom: 14 }}>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 800,
          marginBottom: 7,
          color: '#0f172a',
          fontFamily: 'Syne, sans-serif',
        }}
      >
        {title}
      </h3>
      <ul style={{ marginLeft: 17, color: '#334155', fontSize: 13, lineHeight: 1.65 }}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function UserEducationPage({ user }) {
  const initialRole = roleOrder.includes(user?.role) ? user.role : 'Admin';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const activeGuide = useMemo(() => ROLE_GUIDES[selectedRole] || ROLE_GUIDES.Admin, [selectedRole]);

  return (
    <div className="pp" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div
        className="gc"
        style={{
          padding: 20,
          marginBottom: 14,
          background: 'linear-gradient(135deg, rgba(99,91,255,.14), rgba(6,201,160,.12))',
          border: '1px solid rgba(99,91,255,.2)',
        }}
      >
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 26,
            fontWeight: 800,
            color: '#0c0e18',
            marginBottom: 6,
          }}
        >
          New User Education Center
        </h1>
        <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
          Role-based onboarding to help each user understand where to go in the website,
          what they can do, and the fastest way to complete daily tasks.
        </p>
      </div>

      <div
        className="gc"
        style={{
          padding: 14,
          marginBottom: 14,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {roleOrder.map((role) => (
          <button
            key={role}
            type="button"
            className={selectedRole === role ? 'bp' : 'bg'}
            onClick={() => setSelectedRole(role)}
            style={{ borderRadius: 999, padding: '7px 13px', fontSize: 12 }}
          >
            {role}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 14,
        }}
      >
        <div className="gc" style={{ padding: 18 }}>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 21,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 8,
            }}
          >
            {activeGuide.title}
          </h2>
          <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.65, marginBottom: 12 }}>
            {activeGuide.intro}
          </p>

          <ListBlock title="Website Routes" items={activeGuide.websiteRoutes} />
          <ListBlock title="How To Work In The Website" items={activeGuide.workflow} />
          <ListBlock title="Permissions In Platform" items={activeGuide.permissions} />
          <ListBlock title="Practical Tips" items={activeGuide.tips} />
        </div>

        <div className="gc" style={{ padding: 16 }}>
          <h3
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 16,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 8,
            }}
          >
            Quick Start (All Roles)
          </h3>
          <ol style={{ marginLeft: 18, color: '#334155', fontSize: 13, lineHeight: 1.7 }}>
            <li>Sign in with your assigned login.</li>
            <li>Open the left menu and choose your main work section.</li>
            <li>Use Dashboard as your daily starting point.</li>
            <li>Open details and finish your role-specific actions.</li>
            <li>Use Feedback for communication and follow-up.</li>
          </ol>

          <div
            style={{
              marginTop: 14,
              background: 'rgba(6,201,160,.08)',
              border: '1px solid rgba(6,201,160,.22)',
              borderRadius: 12,
              padding: 11,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', marginBottom: 4 }}>
              Current Session Role
            </div>
            <div style={{ fontSize: 13, color: '#065f46' }}>{user?.role || 'Not identified'}</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .pp > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
