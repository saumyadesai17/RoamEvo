'use client';   

import { useState } from 'react';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="font-montserrat relative w-full max-w-lg">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg 
          className="w-5 h-5 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input 
        type="text" 
        placeholder="Where you wanna go ?" 
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent bg-opacity-90 text-white placeholder-white"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        suppressHydrationWarning={true}
      />
    </div>
  );
};

export default SearchBar;