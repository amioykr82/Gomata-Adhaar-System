import React from 'react';

export const FingerprintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 12h.01" />
    <path d="M17.3 7.7a9.5 9.5 0 1 0-10.6 10.6" />
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M18.8 12.2a6.5 6.5 0 1 0-7.6 7.6" />
  </svg>
);
