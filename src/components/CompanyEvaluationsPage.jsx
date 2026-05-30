import AllEvaluationsPage from './AllEvaluationsPage';

export default function CompanyEvaluationsPage() {
  return (
    <AllEvaluationsPage
      badge="Company reviews"
      title="Company Evaluations"
      subtitle="Review submitted company evaluations in a compact summary table, then open any row to see the full response details."
      endpoint="/company-evaluations"
    />
  );
}