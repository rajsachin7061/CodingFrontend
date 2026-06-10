import { useEffect, useMemo, useState } from "react";
import webImg from "./imaiges/landingImaige.png";
import contestImg from "./imaiges/contest.png";
import quizeImg from "./imaiges/quize.png";
import Slider from "./Slider";
import "./landing.css";
import "./slider.css";

const Page = ({ onLogin, onSignup }) => {
  const images = useMemo(() => [
    {
      image: contestImg,
      name: "contest",
    },
    {
      image: quizeImg,
      name: "quize",
    },
  ], []);

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

  return (
    <div>
      {/* Navbar */}
      <div className="w-full bg-indigo-200 flex items-center justify-between px-6 py-0.5">
        <div className="bg-indigo-300 px-4 py-2 rounded">
          <h1 className="font-bold text-xl">Coding Snipers</h1>
        </div>

        <div>
          <ul className="flex gap-6 items-center">
            <li className="cursor-pointer">Course</li>
            <li className="cursor-pointer">Practice</li>
            <li className="cursor-pointer">Problem</li>
            <li className="cursor-pointer">Game</li>

            <li
              className="px-3 py-2 bg-indigo-700 text-white font-bold rounded cursor-pointer"
              onClick={onLogin}
            >
              Login
            </li>

            <li
              className="px-3 py-2 bg-indigo-700 text-white font-bold rounded cursor-pointer"
              onClick={onSignup}
            >
              Signup
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

        {/* Hero Section */}
        <div className="p-0 py-0 text-indigo-700 font-bold text-4xl bg-[#D1D3D8] text-center">
          Code Smart <br />
          Sniper for Developers
        </div>

        <section id="site-content" className="bg-[#D1D3D8]">
          <Slider />
        </section>
      </div>
    </div>
  );
};

export default Page;
