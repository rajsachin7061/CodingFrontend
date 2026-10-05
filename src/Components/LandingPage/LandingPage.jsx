import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiCode,
  FiFolder,
  FiMenu,
  FiPlay,
  FiAward,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { pageRoutes } from "../../pageRoutes.js";
import logoImg from "./imaiges/logo.png";
import javaImg from "./imaiges/Java_logo_PNG1.png";
import pythonImg from "./imaiges/Python-logo.png";
import cppImg from "./imaiges/c++-logo.png";
import htmlImg from "./imaiges/javascript-logo.png";
import cssImg from "./imaiges/css.png";
import webImg from "./imaiges/landingImaige.png";
import "./landing.css";
import Footer from "./Footer.jsx";

const Page = ({ onLogin, onSignup }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div>
      {/* Navbar */}
      <header className="navbar">
        <Link
          className="logo-box"
          to={pageRoutes.landing}
          aria-label="CodeSniper home"
        >
          <img src={logoImg} alt="CodeSniper" />
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={handleToggleMenu}
        >
          {menuOpen ? (
            <FiX aria-hidden="true" />
          ) : (
            <FiMenu aria-hidden="true" />
          )}
        </button>

        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li>
              <a href="#popular-courses" onClick={closeMenu}>
                Course
              </a>
            </li>
            <li>
              <a href="/practice-sheet" onClick={closeMenu}>
                Practice
              </a>
            </li>
            <li>
              <a href="/dsa-problem-sheet" onClick={closeMenu}>
                Problem
              </a>
            </li>
            <li>
              <a href="/all-game" onClick={closeMenu}>
                Game
              </a>
            </li>
            <li>
              <Link to={pageRoutes.compiler} onClick={closeMenu}>
                Compiler
              </Link>
            </li>
            <li className="nav-action">
              <button
                className="login-button"
                type="button"
                onClick={() => {
                  closeMenu();
                  onLogin();
                }}
              >
                Login
              </button>
            </li>
            <li className="nav-action">
              <button
                className="signup-button"
                type="button"
                onClick={() => {
                  closeMenu();
                  onSignup();
                }}
              >
                Signup
              </button>
            </li>
          </ul>
        </div>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-content">
            <div className="hero-badge">
              <FiCode aria-hidden="true" /> LEARN · PRACTICE · BUILD · GROW
            </div>
            <h1 id="hero-title">
              Learn to Code.
              <br />
              Practice Skills.
              <br />
              <span>Build Real Projects.</span>
            </h1>
            <p className="hero-description">
              CodeSniper is your place to learn programming, practice coding
              problems, build real-world projects, and grow your skills from
              beginner to advanced.
            </p>
            <div className="hero-actions">
              <a className="hero-primary-button" href="#popular-courses">
                <FiPlay aria-hidden="true" /> Start Learning{" "}
                <FiArrowRight aria-hidden="true" />
              </a>
              <a className="hero-secondary-button" href="/dsa-problem-sheet">
                <FiCode aria-hidden="true" /> Explore Problems
              </a>
            </div>
            <div
              className="hero-highlights"
              aria-label="What you can do on CodeSniper"
            >
              <div>
                <FiBookOpen aria-hidden="true" />
                <span>
                  <strong>Learn</strong>
                  <small>Structured courses</small>
                </span>
              </div>
              <div>
                <FiCode aria-hidden="true" />
                <span>
                  <strong>Practice</strong>
                  <small>Coding problems</small>
                </span>
              </div>
              <div>
                <FiFolder aria-hidden="true" />
                <span>
                  <strong>Build</strong>
                  <small>Real projects</small>
                </span>
              </div>
              <div>
                <FiAward aria-hidden="true" />
                <span>
                  <strong>Compete</strong>
                  <small>Contests & games</small>
                </span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="CodeSniper coding dashboard">
            <img
              className="hero-laptop"
              src={webImg}
              alt="CodeSniper coding dashboard displayed on a laptop"
            />
            <div className="hero-float-card hero-card-courses">
              <FiBookOpen aria-hidden="true" />
              <span>
                <strong>Structured Courses</strong>
                <small>From basics to advanced</small>
              </span>
            </div>
            <div className="hero-float-card hero-card-problems">
              <FiCode aria-hidden="true" />
              <span>
                <strong>Practice Problems</strong>
                <small>Learn by doing</small>
              </span>
            </div>
            <div className="hero-float-card hero-card-projects">
              <FiFolder aria-hidden="true" />
              <span>
                <strong>Real Projects</strong>
                <small>Build your portfolio</small>
              </span>
            </div>
            <div className="hero-float-card hero-card-contests">
              <FiAward aria-hidden="true" />
              <span>
                <strong>Contests</strong>
                <small>Challenge yourself</small>
              </span>
            </div>
            <div className="hero-float-card hero-card-community">
              <FiUsers aria-hidden="true" />
              <span>
                <strong>Active Community</strong>
                <small>Grow together</small>
              </span>
            </div>
          </div>
        </section>

        {/* //popular Course */}

        <section className="popular-courses" id="popular-courses">
          <div className="courses-header">
            <div>
              <div className="courses-label">
                <span>♟</span> POPULAR COURSES
              </div>

              <h2>
                Start Your <span>Learning Journey</span>
              </h2>
            </div>

            <a className="view-courses-btn" href="/practice-sheet">
              View All Courses <FiArrowRight aria-hidden="true" />
            </a>
          </div>

          <div className="courses-grid">
            <a className="course-card" href="/practice/java">
              <div className="course-image java-bg">
                <img src={javaImg} alt="Java" />
              </div>
              <div className="course-card-content">
                <h3>Java</h3>
                <p>Beginner to Advanced</p>
                <div className="learners">
                  <FiUsers aria-hidden="true" /> 12,450 learners
                </div>
                <span className="open-course-button">
                  Open Course <FiArrowRight aria-hidden="true" />
                </span>
              </div>
            </a>

            <a className="course-card" href="/practice/python">
              <div className="course-image python-bg">
                <img src={pythonImg} alt="Python" />
              </div>
              <div className="course-card-content">
                <h3>Python</h3>
                <p>Beginner to Advanced</p>
                <div className="learners">
                  <FiUsers aria-hidden="true" /> 10,820 learners
                </div>
                <span className="open-course-button">
                  Open Course <FiArrowRight aria-hidden="true" />
                </span>
              </div>
            </a>

            <a className="course-card" href="/practice/cpp">
              <div className="course-image cpp-bg">
                <img src={cppImg} alt="C++" />
              </div>
              <div className="course-card-content">
                <h3>C++</h3>
                <p>From Basics to Pro</p>
                <div className="learners">
                  <FiUsers aria-hidden="true" /> 8,640 learners
                </div>
                <span className="open-course-button">
                  Open Course <FiArrowRight aria-hidden="true" />
                </span>
              </div>
            </a>

            <a className="course-card" href="/practice/javascript">
              <div className="course-image react-bg">
                <img src={htmlImg} alt="JavaScript" />
              </div>
              <div className="course-card-content">
                <h3>JavaScript</h3>
                <p>Backend Development</p>
                <div className="learners">
                  <FiUsers aria-hidden="true" /> 7,280 learners
                </div>
                <span className="open-course-button">
                  Open Course <FiArrowRight aria-hidden="true" />
                </span>
              </div>
            </a>

            <a className="course-card" href="/practice-sheet">
              <div className="course-image css-bg">
                <img src={cssImg} alt="CSS" />
              </div>
              <div className="course-card-content">
                <h3>CSS</h3>
                <p>From Basics to Pro</p>
                <div className="learners">
                  <FiUsers aria-hidden="true" /> 6,150 learners
                </div>
                <span className="open-course-button">
                  Open Course <FiArrowRight aria-hidden="true" />
                </span>
              </div>
            </a>
          </div>
        </section>

        {/* Feature Cards */}
        <div className="bg-white py-10">
          <div className="mx-auto w-[95%] md:w-[85%] lg:w-[75%]">
            <div className="text-center mb-8">
              <p className="text-xl text-indigo-700 font-semibold">
                ✨ Features
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Learn, Compete, Improve & Win
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="text-3xl">💡</div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  Learn
                </h3>
                <p className="mt-2 text-slate-600">
                  Practice real coding skills with guided lessons.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="text-3xl">🏆</div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  Compete
                </h3>
                <p className="mt-2 text-slate-600">
                  Join live challenges and level up with others.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="text-3xl">🎯</div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  Improve
                </h3>
                <p className="mt-2 text-slate-600">
                  Track progress and sharpen your problem-solving speed.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="text-3xl">🎁</div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  Rewards
                </h3>
                <p className="mt-2 text-slate-600">
                  Earn badges, prizes, and recognition for every win.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <section id="site-content" className="bg-[#D1D3D8]">
          <Slider />
        </section> */}

        {/* Active Contests */}
        <div className="bg-white py-10">
          <div className="mx-auto w-[95%] md:w-[85%] lg:w-[75%]">
            <div className="text-center mb-8">
              <p className="text-xl text-indigo-700 font-semibold">
                Upcoming CONTESTS
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-semibold text-slate-900">
                  Frontend Battle
                </h3>
                <p className="mt-4 text-slate-600">Medium</p>
                <p className="mt-2 text-slate-700 font-semibold">Prize ₹500</p>
                <button className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800">
                  <a href="/participate/challenge/frontend/">Participate</a>
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-semibold text-slate-900">
                  React Challenge
                </h3>
                <p className="mt-4 text-slate-600">Hard</p>
                <p className="mt-2 text-slate-700 font-semibold">Prize ₹1000</p>
                <button className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800">
                  <a href="/participate/challenge/react/">Participate</a>
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-semibold text-slate-900">
                  JavaScript Cup
                </h3>
                <p className="mt-4 text-slate-600">Easy</p>
                <p className="mt-2 text-slate-700 font-semibold">Prize ₹300</p>
                <button className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800">
                  <a href="/participate/challenge/javascript/">Participate</a>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#F8FAFC] py-10">
          <div className="mx-auto w-[95%] md:w-[85%] lg:w-[75%] rounded-[2rem] border border-indigo-200 bg-white px-8 py-10 shadow-xl shadow-indigo-100">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-500">
                Ready to become a coding champion?
              </p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                Join Now Free
              </h2>
              <button className="mt-8 inline-flex rounded-full bg-indigo-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800">
                <a href="/joinnow">join now</a>
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Page;
