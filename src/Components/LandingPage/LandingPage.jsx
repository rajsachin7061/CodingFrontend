import { useEffect, useMemo, useState } from "react";
import logoImg from "./imaiges/logo.png";
import webImg from "./imaiges/landingImaige.png";
import contestImg from "./imaiges/contest.png";
import quizeImg from "./imaiges/quize.png";
import Slider from "./Slider";
import "./landing.css";
import "./slider.css";
import Footer from "./footer";

const Page = ({ onLogin, onSignup }) => {
  const images = useMemo(
    () => [
      {
        image: contestImg,
        name: "contest",
      },
      {
        image: quizeImg,
        name: "quize",
      },
    ],
    [],
  );

  const [current, setCurrent] = useState(0);

  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleExplore = () => {
    document.getElementById("site-content")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <div className="logo-box">
          <img src={logoImg} alt="web" />
          {/* <h1 className="logo">Coding Snipers</h1> */}
        </div>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={handleToggleMenu}
        >
          ☰
        </button>

        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li onClick={closeMenu}>Course</li>
            <li onClick={closeMenu}>Practice</li>
            <li onClick={closeMenu}>Problem</li>
            <li onClick={closeMenu}>Game</li>
            <li
              className="nav-action"
              onClick={() => {
                closeMenu();
                onLogin();
              }}
            >
              <button class="button">Login</button>
            </li>
            <li
              className="nav-action"
              onClick={() => {
                closeMenu();
                onSignup();
              }}
            >
             <button class="button">Signup</button> 
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-[#D1D3D8]">
        <div className="landigepage_imaige">
          <img src={webImg} alt="web" />
          <div className="landing_quote">
            <h1>Code Smart, Build the future</h1>
            <p>
              learn programming with real world projects and modern technology.
            </p>
            <button type="button" onClick={handleExplore}>
              Explore
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="w-full flex justify-center items-center py-10 bg-[#D1D3D8]">
          <div className="relative w-[95%] md:w-[85%] lg:w-[75%]">
            <img
              src={images[current].image}
              alt={images[current].name}
              className="w-full h-30 sm:h-50 md:h-75 lg:h-75 object-cover rounded-2xl duration-500"
            />

            {/* Left Button */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full text-2xl flex items-center justify-center"
              aria-label="Previous slide"
            >
              ❮
            </button>

            {/* Right Button */}
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full text-2xl flex items-center justify-center"
              aria-label="Next slide"
            >
              ❯
            </button>
          </div>
        </div>

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

        {/* Hero Section */}
        <div className="p-0 py-0 text-indigo-700 font-bold text-4xl bg-[#D1D3D8] text-center">
          Code Smart <br />
          Sniper for Developers
        </div>

        <section id="site-content" className="bg-[#D1D3D8]">
          <Slider />
        </section>

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
                  Participate
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-semibold text-slate-900">
                  React Challenge
                </h3>
                <p className="mt-4 text-slate-600">Hard</p>
                <p className="mt-2 text-slate-700 font-semibold">Prize ₹1000</p>
                <button className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800">
                  Participate
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-semibold text-slate-900">
                  JavaScript Cup
                </h3>
                <p className="mt-4 text-slate-600">Easy</p>
                <p className="mt-2 text-slate-700 font-semibold">Prize ₹300</p>
                <button className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800">
                  Participate
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
                Join Now Free
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Page;
