import React from "react";
import { FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full border-t-4 border-blue-600 mt-2">
      <div className="px-6 sm:px-12 md:px-24 py-5 text-white text-center bg-[#414856]">

        {/* Powered By */}
        <h2 className="font-bold">Powered by</h2>
        <h2 className="font-bold text-lg">Coding Snipers</h2>

        {/* Social Media */}
        <div className="flex justify-center items-center gap-4 mt-3">

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/codesniper/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0A66C2] hover:scale-110 transition-transform"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn size={16} />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/codesniper74/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:scale-110 transition-transform"
            aria-label="Instagram"
          >
            <FaInstagram size={16} />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@codesniper74"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-md bg-red-600 hover:scale-110 transition-transform"
            aria-label="YouTube"
          >
            <FaYoutube size={16} />
          </a>

        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-3 mt-3">

          <a
            href="/aboutus/codesnipers/"
            className="hover:text-blue-400"
          >
            • About Us
          </a>

          <a
            href="/privacy/codesnipers/"
            className="hover:text-blue-400"
          >
            • Privacy Policy
          </a>

          <a
            href="/contactus/codesnipers/"
            className="hover:text-blue-400"
          >
            • Contact Us
          </a>

        </div>

        {/* Copyright */}
        <p className="mt-3 text-sm">
          © {new Date().getFullYear()} Code Snipers. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;