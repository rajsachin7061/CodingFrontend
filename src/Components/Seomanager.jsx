
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.codesniper.in";

const pages = {
  "/": {
    title: "CodeSniper - Coding Practice & DSA Learning",
    description:
      "Practice programming, solve coding problems, and improve your data structures and algorithms skills with CodeSniper.",
  },

  "/register" : {
    title: "Register",
    description:
      "Practice programming, solve coding problems, and improve your data structures and algorithms skills with CodeSniper.",
  },

   "/login" : {
    title: " Login",
    description:
      "Practice programming, solve coding problems, and improve your data structures and algorithms skills with CodeSniper.",
  },
   "/compiler": {
     title: "Compiler",
    description:
      "Practice  programming with examples and coding exercises.",
  },
  "/practice-sheet": {
     title: "Practice Sheet Problems",
    description:
      "Practice  programming with examples and coding exercises.",
  },

  "/dsa-problem-sheet": {
    title: "DSA Problem Sheet",
    description:
      "Practice data structures and algorithms with a structured problem sheet.",
  },
  
  "/practice/java": {
    title: "Java Coding Problems and Solutions",
    description:
      "Practice Java programming with coding problems, examples, and solutions on CodeSniper.",
  },
  "/practice/cpp": {
    title: "C++ Coding Problems and Practice",
    description:
      "Improve your C++ programming skills with coding exercises and practice problems.",
  },
  "/practice/python": {
    title: "Python Coding Practice",
    description:
      "Practice Python with programming exercises and  challenges.",
  },
  "/practice/javascript": {
    title: "JavaScript Coding Practice",
    description:
      "Improve your JavaScript skills with practical web design and styling exercises.",
  },
  "/practice/c": {
    title: "C Coding Problems",
    description:
      "Practice C programming with examples and coding exercises.",
  },
  
  
  "/game": {
    title: "Coding Games",
    description:
      "Explore coding games and interactive programming practice on CodeSniper.",
  },

  "/quiz/java" : {
    title: "Java Quiz",
    description:
      "Java Top 50 MCQ Question programming practice on CodeSniper.",
  },
  "/quiz/c-plus-plus" : {
    title: "C++ Quiz",
    description:
      "C++ Top 50 MCQ Question programming practice on CodeSniper.",
  },
  "/quiz/html" : {
    title: "HTML Quiz",
    description:
      "HTML Top 50 MCQ Question programming practice on CodeSniper.",
  },

  "/quiz/css" : {
    title: " CSS Quiz",
    description:
      "CSS Top 50 MCQ Question programming practice on CodeSniper.",
  },

  "/quiz/javascript" : {
    title: " JavaSript Quiz",
    description:
      "JavaSript Top 50 MCQ Question programming practice on CodeSniper.",
  },

  "/aboutus/codesnipers": {
    title: "About CodeSniper",
    description:
      "Learn about CodeSniper and its mission to help people improve their programming skills.",
  },
  "/contactus/codesnipers": {
    title: "Contact CodeSniper",
    description:
      "Contact the CodeSniper team for questions, feedback, and collaboration.",
  },
  "/privacy/codesnipers": {
    title: "Privacy Policy",
    description:
      "Read the CodeSniper privacy policy and learn how user information is handled.",
  },
};

const privatePrefixes = [
  "/admin",
  "/profile",
  "/edit-profile",
  "/reset-password",
];

function shouldIndex(path) {
  if (pages[path]) return true;

  // Only index learning routes if they work for logged-out visitors
  // and provide useful, unique content.
  if (/^\/practice\/[a-z0-9-]+\/?$/.test(path)) {
    return true;
  }

  if (
    privatePrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    )
  ) {
    return false;
  }

  // Default to noindex for unspecified routes.
  return false;
}

export default function SEOManager() {
  const { pathname } = useLocation();

  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";

  const page = pages[normalizedPath];
  const indexable = shouldIndex(normalizedPath) && Boolean(page);

  const canonical = new URL(normalizedPath, SITE_URL).href;

  return (
    <Helmet>
      <title>
        {page
          ? `${page.title} | CodeSniper`
          : "CodeSniper"}
      </title>

      <meta
        name="description"
        content={
          page?.description ||
          "Explore coding practice and programming resources on CodeSniper."
        }
      />

      <meta
        name="robots"
        content={
          indexable
            ? "index,follow"
            : "noindex,nofollow"
        }
      />

      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
