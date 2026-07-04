import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t-4 border-blue-600 mt-2">
      <div className="px-6 sm:px-12 md:px-24 py-5 text-white text-center bg-[#414856]">
        <h2 className="font-bold">Powered by</h2>
        <h2 className="font-bold text-lg">Coding Snipers</h2>

        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <a href="/aboutus/codesnipers/" className="hover:text-blue-400">
           • About Us
          </a>

          <a href="/privacy/codesnipers/" className="hover:text-blue-400">
           • Privacy Policy
          </a>

          <a href="/contactus/codesnipers/" className="hover:text-blue-400">
           • Contact Us
          </a>
        </div>

        <p className="mt-3 text-sm">
          © {new Date().getFullYear()} Code Snipers. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;