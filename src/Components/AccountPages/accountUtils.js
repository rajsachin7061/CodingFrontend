import quizCategories from "../QuizCategories";

export const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "U";

export const renderAvatar = (user, className = "profile-photo-large", photoOverride = "") =>
  photoOverride || user.photo ? (
    <img alt={`${user.name} profile`} className={className} src={photoOverride || user.photo} />
  ) : (
    <span className={className}>{getInitial(user.name)}</span>
  );

export const getCertificates = (user) => {
  const stats = user.stats || {};
  const certificates = [];

  if ((stats.totalSolved || 0) >= 1) {
    certificates.push({
      title: "Practice Starter",
      text: "Completed the first quiz practice set.",
    });
  }

  if ((stats.totalSolved || 0) >= 10) {
    certificates.push({
      title: "Question Solver",
      text: "Solved 10 or more quiz questions.",
    });
  }

  quizCategories.forEach((category) => {
    if ((stats.categories?.[category]?.completed || 0) > 0) {
      certificates.push({
        title: `${category} Practice`,
        text: `Completed a ${category} practice quiz.`,
      });
    }
  });

  return certificates;
};

export const resumeTemplates = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "compact", label: "Compact" },
];
