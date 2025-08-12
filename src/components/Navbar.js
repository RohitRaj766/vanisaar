import React from 'react';
import { FaSun, FaMoon, FaDownload } from 'react-icons/fa';

const Navbar = ({ theme, toggleTheme, generatePDF }) => {
  return (
    <nav
      className={`flex justify-between items-center p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow`}
    >
      <h1 className="text-xl font-bold">Vanisaar</h1>
      <div className="flex items-center">
        <button
          onClick={generatePDF}
          className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-300
            ${theme === 'dark' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-400 text-white hover:bg-green-500'}`}
        >
          <FaDownload className="text-lg" />
          <span className="text-sm font-medium">Generate PDF</span>
        </button>
   
        <button
          onClick={toggleTheme}
          className="p-2 ml-4 hover:bg-gray-200 rounded-full transition"
        >
          {theme === 'light' ? <FaMoon className="text-xl" /> : <FaSun className="text-xl" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
