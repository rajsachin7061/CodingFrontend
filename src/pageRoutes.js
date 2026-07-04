
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

  
  compilers: "/code/compiler",

  javaproblem: "/javaproblem",
  cppproblem: "/quiz/cppproblem",
  htmlproblem: "/htmlproblem",
  cssproblem: "/cssproblem",
  javascriptproblem: "/javascriptproblem",
  Questiondetail: "/question-details",

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


  [pageRoutes.compilers]: "compilers",
  [pageRoutes.javaproblem]: "javaproblem",
  [pageRoutes.cppproblem]: "cppproblem",
  [pageRoutes.htmlproblem]: "htmlproblem",
  [pageRoutes.cssproblem]: "cssproblem",
  [pageRoutes.javascriptproblem]: "javascriptproblem",
  [pageRoutes.Questiondetail]: "Questiondetail",
};

export const getQuizCategoryFromPath = (pathname) => {
  const match = pathname.match(/^\/quiz\/([^/]+)$/);

  return match ? getQuizCategoryBySlug(match[1]) : "";
};

export const getRequestedPageFromPath = (pathname) => {
  if (getQuizCategoryFromPath(pathname)) {
    return "quiz";
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
