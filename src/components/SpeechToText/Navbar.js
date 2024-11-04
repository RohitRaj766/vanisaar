import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const Navbar = ({ theme, toggleTheme, isRecognizing, startRecognitionHandler, stopRecognitionHandler }) => {
  return (
    <nav className={`flex justify-between items-center p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow`}>
      <h1 className="text-xl font-bold">Vanisaar</h1>
      <div className="flex items-center">
        <button onClick={toggleTheme} className="p-2 hover:bg-gray-200 rounded-full transition">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
