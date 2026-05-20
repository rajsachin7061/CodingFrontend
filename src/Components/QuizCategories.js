const quizCategories = ["Java", "C++", "HTML", "CSS", "JavaScript"];

export const defaultQuizCategory = "Java";

export const quizCategorySlugs = {
  Java: "java",
  "C++": "c-plus-plus",
  HTML: "html",
  CSS: "css",
  JavaScript: "javascript",
};

export const getQuizCategoryBySlug = (slug) =>
  quizCategories.find((category) => quizCategorySlugs[category] === slug) || "";

export const getQuizCategoryPath = (category) =>
  `/quiz/${quizCategorySlugs[category] || quizCategorySlugs[defaultQuizCategory]}`;

export default quizCategories;
