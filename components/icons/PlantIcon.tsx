
import React from 'react';

export const PlantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 20h10" />
        <path d="M10 20v-6h4v6" />
        <path d="M12 14v-4" />
        <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M15 6.5a2.5 2.5 0 0 0-5 0" />
        <path d="M17 10a2 2 0 1 0-4 0" />
    </svg>
);
