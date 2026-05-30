import PublicEvaluationForm from './PublicEvaluationForm';

export default function CompanyEvaluationForm(props) {
  return (
    <PublicEvaluationForm
      {...props}
      badge="Company evaluation form"
      title="Company Evaluation Form"
      successBadge="Success"
      successTitle="Your company evaluation was submitted."
      successText="Thank you. The company evaluation has been received and saved successfully."
      nextStepLabel="You may close this page"
      submitLabel="Submit Company Evaluation"
      apiPath="/company-evaluations"
    />
  );
}