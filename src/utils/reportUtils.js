export function hasReportContent(day) {
  if (!day?.shortReport) return false;

  const title =
    typeof day.shortReport.title === "string"
      ? day.shortReport.title.trim()
      : "";
  const description =
    typeof day.shortReport.description === "string"
      ? day.shortReport.description.trim()
      : "";
  const reportImages = Array.isArray(day.shortReport.images)
    ? day.shortReport.images
    : [];
  const dayImages = Array.isArray(day.images) ? day.images : [];

  return Boolean(title || description || reportImages.length || dayImages.length);
}
