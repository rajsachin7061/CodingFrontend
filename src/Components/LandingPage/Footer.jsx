import React from "react";

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="w-full border-t-4 border-blue-600 mt-2">
        <div className="px-6 sm:px-12 md:px-24 py-5 text-white text-center bg-[#414856]">
          <h1 className="font-bold">Powered by</h1>
          <h1 className="font-bold">Coding Snipers</h1>
          <p>About us • Privacy Policy • Contact</p>
          <p className="mt-2">
            © {new Date().getFullYear()} Leader. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
