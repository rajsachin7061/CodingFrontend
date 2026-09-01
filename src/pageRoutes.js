import { getQuizCategoryBySlug } from "./Components/QuizCategories";

export const pageRoutes = {
  landing: "/",
  login: "/login",
  register: "/register",
  reset: "/reset-password",
  quiz: "/quiz",
  contest: "/contest",
  compiler: "/compiler",
  profile: "/profile",
  editProfile: "/profile/edit",
  certificate: "/profile/certificate",
  resume: "/profile/resume",
  logout: "/logout",
  admin: "/admin",
  problems: "/javaproblems",
  Allproblem: "/all-problem",
  StartQuiz: "/quiz/start/",
  QuizStart: "/startquiz",
  Aboutus: "/aboutus/codesnipers/",
  Privacy: "/privacy/codesnipers/",
  Contactus: "/contactus/codesnipers/",
  Game: "/Game",
  problemsheet: "/problem-sheet",
    About:"/aboutus/codesnipers/",

  //practice pageroutes
  Practice: "/practice",
  PracticeLanguage: "/practice/:languageSlug",
  PracticeModule: "/practice/:languageSlug/modules/:moduleId",

  Practicejava: "/practice/java",
  Practicecpp: "/practice/cpp",
  Practicepython: "/practice/python",
  Practicejavascript: "/practice/javascript",
  Practicec: "/practice/c",
  Practicesql: "/practice/sql",

  compilers: "/code/compiler",
  javaproblem: "/javaproblem",
  cppproblem: "/quiz/cppproblem",
  htmlproblem: "/htmlproblem",
  cssproblem: "/cssproblem",
  javascriptproblem: "/javascriptproblem",

  Questiondetail: "/problem/:id",
  PracticeQuestion: "/practice-question/:id",
};

const pathToPage = {
  "/": "landing",
  "/index.html": "landing",
  [pageRoutes.login]: "login",
  [pageRoutes.register]: "register",
  [pageRoutes.reset]: "reset",
  [pageRoutes.quiz]: "quiz",
  [pageRoutes.contest]: "contest",
  [pageRoutes.compiler]: "compiler",
  [pageRoutes.profile]: "profile",
  [pageRoutes.editProfile]: "editProfile",
  [pageRoutes.certificate]: "certificate",
  [pageRoutes.resume]: "resume",
  [pageRoutes.logout]: "logout",
  [pageRoutes.admin]: "admin",
  [pageRoutes.StartQuiz]: "StartQuiz",
  [pageRoutes.QuizStart]: "QuizStart",
  [pageRoutes.Aboutus]: "Aboutus",
  [pageRoutes.Privacy]: "Privacy",
  [pageRoutes.Contactus]: "Contactus",
  [pageRoutes.problemsheet]: "problemsheet",

  //Practice path to page
  [pageRoutes.Practicejava]: "Practicejava",
  [pageRoutes.Practicecpp]: "Practicecpp",
  [pageRoutes.Practicepython]: "Practicepython",
  [pageRoutes.Practicejavascript]: "Practicejavascript",
  [pageRoutes.Practicec]: "Practicec",
  [pageRoutes.Practicesql]: "Practicesql",

  [pageRoutes.PracticeLanguage]: "PracticeLanguage",
  [pageRoutes.PracticeModule]: "PracticeModule",

  [pageRoutes.compilers]: "compilers",
  [pageRoutes.javaproblem]: "javaproblem",
  [pageRoutes.cppproblem]: "cppproblem",
  [pageRoutes.htmlproblem]: "htmlproblem",
  [pageRoutes.cssproblem]: "cssproblem",
  [pageRoutes.javascriptproblem]: "javascriptproblem",
  [pageRoutes.Questiondetail]: "Questiondetail",
  [pageRoutes.PracticeQuestion]: "PracticeQuestion",

  [pageRoutes.Game]: "Game",
  [pageRoutes.problemsheet]: "problemsheet",
  [pageRoutes.About]: "About",
  
 
  [pageRoutes.Allproblem]: "Allproblem",
};

export const getQuizCategoryFromPath = (pathname) => {
  const match = pathname.match(/^\/quiz\/([^/]+)$/);

  return match ? getQuizCategoryBySlug(match[1]) : "";
};

export const getRequestedPageFromPath = (pathname) => {
  if (getQuizCategoryFromPath(pathname)) {
    return "quiz";
  }

  if (/^\/quiz\/start\/?$/.test(pathname)) {
    return "quizStart";
  }

  if (/^\/practice\/[^/]+\/modules\/[^/]+\/?$/.test(pathname)) {
    return "PracticeModule";
  }

  if (/^\/practice\/[^/]+\/?$/.test(pathname)) {
    return "PracticeLanguage";
  }

  if (/^\/practice-question\/[^/]+\/?$/.test(pathname)) {
    return "PracticeQuestion";
  }

  if (pathname === "/problem" || /^\/problem\/[^/]+\/?$/.test(pathname)) {
    return "Questiondetail";
  }

  return pathToPage[pathname] || "login";
};

export const getAllowedPage = (pathname, currentUser) => {
  const page = getRequestedPageFromPath(pathname);
  const protectedPages = [
    "quiz",
    "quizStart",
    "contest",
    "profile",
    "editProfile",
    "certificate",
    "resume",
    "logout",
  ];

  if (protectedPages.includes(page) && !currentUser) {
    return "login";
  }

  if (
    (page === "landing" ||
      page === "login" ||
      page === "register" ||
      page === "reset") &&
    currentUser
  ) {
    return "quiz";
  }

  return page;
};
