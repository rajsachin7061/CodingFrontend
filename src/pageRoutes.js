
import { getQuizCategoryBySlug } from "./Components/QuizCategories";

export const pageRoutes = {
  landing: "/",
  login: "/login",
  register: "/register",
  reset: "/reset-password",
  quiz: "/quiz",
  compiler: "/compiler",
  profile: "/profile",
  editProfile: "/profile/edit",
  certificate: "/profile/certificate",
  resume: "/profile/resume",
  logout: "/logout",
  admin: "/admin",
  problems: "/javaproblems",
  Game: "/game",
  Allproblem: "/all-problem",
  StartQuiz: "/quiz/start/",
  QuizStart: "/startquiz",

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
<<<<<<< HEAD
  Course: "/all-courses",
  Game:"/Game"
=======
  PracticeQuestion: "/practice-question/:id",


>>>>>>> 9c740f15e75f0bd9993887afe730c29fd61d3c6b
 
  

};

const pathToPage = {
  "/": "landing",
  "/index.html": "landing",
  [pageRoutes.login]: "login",
  [pageRoutes.register]: "register",
  [pageRoutes.reset]: "reset",
  [pageRoutes.quiz]: "quiz",
  [pageRoutes.compiler]: "compiler",
  [pageRoutes.profile]: "profile",
  [pageRoutes.editProfile]: "editProfile",
  [pageRoutes.certificate]: "certificate",
  [pageRoutes.resume]: "resume",
  [pageRoutes.logout]: "logout",
  [pageRoutes.admin]: "admin",
  [pageRoutes.StartQuiz]: "StartQuiz",
  [pageRoutes.QuizStart]: "QuizStart",

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
  [pageRoutes.Allproblem]: "Allproblem",

  
  [pageRoutes.game]: "Game",
};

export const getQuizCategoryFromPath = (pathname) => {
  const match = pathname.match(/^\/quiz\/([^/]+)$/);

  return match ? getQuizCategoryBySlug(match[1]) : "";
};

export const getRequestedPageFromPath = (pathname) => {
  if (getQuizCategoryFromPath(pathname)) {
    return "quiz";
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
  const protectedPages = ["quiz",  "profile", "editProfile", "certificate", "resume", "logout"];

  if (protectedPages.includes(page) && !currentUser) {
    return "login";
  }

  if ((page === "landing" || page === "login" || page === "register" || page === "reset") && currentUser) {
    return "quiz";
  }

  return page;
};
